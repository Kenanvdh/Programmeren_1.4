const logger = require('../util/utils').logger;
const assert = require('assert')
const pool = require('../util/mysql-db')
const jwt = require('jsonwebtoken');

const userController = {
    //UC 201 - Registreren als nieuwe use
    createUser: (req, res, next) => {
        const email = req.body.emailAdress;

        pool.getConnection(function (err, conn) {
            if (err) {
                console.log('error');
                return next('error: ' + err.message);
            }

            // Checking if email exists
            conn.query(
                'SELECT * FROM `user` WHERE `emailAdress` = ?',
                [email],
                function (err, results) {
                    if (err) {
                        logger.error(err);
                        res.status(500).json({
                            status: 500,
                            message: err.sqlMessage,
                            data: {},
                        });
                        return;
                    }

                    if (results.length > 0) {
                        res.status(403).json({
                            status: 403,
                            message: email + ' is already registered!',
                            data: {},
                        });
                        return;
                    }

                    conn.query(
                        'SELECT `id` FROM `user` ORDER BY id DESC LIMIT 1',
                        function (err, results) {
                            if (err) {
                                res.status(500).json({
                                    status: 500,
                                    message: err.sqlMessage,
                                    data: {},
                                });
                            } else {
                                const lastId = results[0];
                                const id = lastId.id + 1;

                                const user = {
                                    id: id,
                                    firstName: req.body.firstName,
                                    lastName: req.body.lastName,
                                    isActive: 1,
                                    emailAdress: req.body.emailAdress,
                                    password: req.body.password,
                                    phoneNumber: req.body.phoneNumber,
                                    roles: req.body.roles,
                                    street: req.body.street,
                                    city: req.body.city,
                                };

                                // Check for missing fields
                                function validateField(fieldName, fieldType, fieldValue) {
                                    if (!fieldValue || typeof fieldValue !== fieldType) {
                                        res.status(400).json({
                                            status: 400,
                                            message: `${fieldName} (${fieldType}) is invalid!`,
                                            data: {},
                                        });
                                        return false;
                                    }
                                    return true;
                                }

                                function emailValidation(emailAdress) {
                                    const regEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                    const isValidEmail = regEx.test(emailAdress);
                                    if (!isValidEmail) {
                                        res.status(400).json({
                                            status: 400,
                                            message: `${emailAdress} is invalid!`,
                                            data: {},
                                        });
                                        return false;
                                    }
                                    return true;
                                }

                                function passwordValidation(password) {
                                    const regEx = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
                                    const validPassword = regEx.test(password);
                                    if (!validPassword) {
                                        res.status(400).json({
                                            status: 400,
                                            message: `${password} is invalid!`,
                                            data: {},
                                        });
                                        return false; // Add this line to exit the function
                                    }
                                    return true;
                                }
                                if (
                                    !validateField('firstName', 'string', user.firstName) ||
                                    !validateField('lastName', 'string', user.lastName) ||
                                    !validateField('emailAdress', 'string', user.emailAdress) ||
                                    !validateField('password', 'string', user.password) ||
                                    !emailValidation(user.emailAdress) ||
                                    !passwordValidation(user.password)
                                ) {
                                    return;
                                }

                                conn.query(
                                    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `phoneNumber`, `roles`, `street`, `city`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                                    [
                                        user.id,
                                        user.firstName,
                                        user.lastName,
                                        user.emailAdress,
                                        user.password,
                                        user.phoneNumber,
                                        user.roles,
                                        user.street,
                                        user.city,
                                    ],
                                    function (err, results) {
                                        if (err) {
                                            res.status(500).json({
                                                status: 500,
                                                message: err.sqlMessage,
                                                data: {},
                                            });
                                        } else {
                                            logger.info('results: ', results); // results contains rows returned by server
                                            res.status(200).json({
                                                status: 200,
                                                message: 'User added with id ' + id,
                                                data: user,
                                            });
                                        }
                                    }
                                );
                            }
                            pool.releaseConnection(conn);
                        }
                    );
                })
        })
    },

    // UC-202 - Opvragen van overzicht van users
    getAllUsers: (req, res, next) => {
        logger.info('Get all users');

        let sqlStatement = "SELECT * FROM `user`";
        let filters = [];

        if (req.query.isActive) {
            // Check if the user fills in true or false, make it 1 or 0
            if (req.query.isActive === "true") {
                req.query.isActive = 1;
            } else if (req.query.isActive === "false") {
                req.query.isActive = 0;
            }
            filters.push(`isActive = ${req.query.isActive}`);
        }

        // Check if roles filter is provided
        if (req.query.roles) {
            const roles = req.query.roles.split(",");
            const rolesFilter = roles
                .map((role) => `roles LIKE '%${role}%'`)
                .join(" OR ");
            filters.push(`(${rolesFilter})`);
        }

        // Append filters to the SQL statement if any
        if (filters.length > 0) {
            sqlStatement += ` WHERE ${filters.join(" AND ")}`;
        }

        pool.getConnection(function (err, conn) {
            if (err) {
                logger.error(err);
                next({
                    code: 500,
                    message: err.code,
                });
                return;
            }
            conn.query(
                sqlStatement,
                function (err, results, fields) {
                    if (err) {
                        logger.error(err.message);
                        next({
                            code: 409,
                            message: err.message,
                        });
                        return;
                    }
                    logger.info("Found", results.length, "results");

                    // Check if no filters other than isActive or roles are provided
                    if (
                        Object.keys(req.query).filter(
                            (key) => key !== "isActive" && key !== "roles"
                        ).length === 0
                    ) {
                        res.status(200).json({
                            status: 200,
                            message: "User getAll endpoint",
                            data: results,
                        });
                    } else if (
                        Object.keys(req.query).some(
                            (key) => key !== "isActive" && key !== "roles"
                        )
                    ) {
                        res.status(200).json({
                            status: 200,
                            message: "Invalid filter(s) used",
                            data: {}
                        });
                    } else {
                        res.status(200).json({
                            status: 200,
                            message: "User getAll endpoint",
                            data: [],
                        });
                    }
                    conn.release();
                }
            );
        });
    },

    //UC-203 - Opvragen van gebruikersprofiel
    getUserProfile: (req, res, next) => {
        logger.info('Get user profile for user', req.userId);

        let sqlStatement = 'SELECT * FROM `user` WHERE id=?';

        pool.getConnection(function (err, conn) {
            // Do something with the connection
            if (err) {
                logger.error(err.code, err.syscall, err.address, err.port);
                next({
                    code: 500,
                    message: err.code
                });
            }
            if (conn) {
                conn.query(sqlStatement, [req.userId], (err, results, fields) => {
                    if (err) {
                        logger.error(err.message);
                        next({
                            code: 409,
                            message: err.message
                        });
                    }
                    if (results) {
                        logger.trace('Found', results.length, 'results');
                        res.status(200).json({
                            status: 200,
                            message: 'Get User profile',
                            data: results[0]
                        });
                    }
                });
                pool.releaseConnection(conn);
            }
        });
    },

    //UC-204 - Opvragen van usergegevens bij ID
    getUser: (req, res, next) => {
        const loggedInUserId = req.userId; // Logged-in user ID
        const userId = parseInt(req.params.userId);

        pool.getConnection(function (err, conn) {
            // Do something with the connection
            if (err) {
                console.log('error');
                next('error: ' + err.message);
            }
            if (conn) {
                conn.query(
                    'SELECT * FROM `user` WHERE `id` = ?',
                    [userId],
                    function (err, results) {
                        if (err) {
                            res.status(500).json({
                                status: 500,
                                message: err.sqlMessage,
                                data: {},
                            });
                            return;
                        }
                        if (results.length !== 0) {
                            const user = results[0];
                            if (loggedInUserId === userId) {
                                // Logged-in user, show the password
                                res.status(200).json({
                                    status: 200,
                                    message: 'Requested user endpoint',
                                    data: user,
                                });
                            } else {
                                // Other user, hide the password
                                delete user.password;
                                res.status(200).json({
                                    status: 200,
                                    message: 'Requested user endpoint',
                                    data: user,
                                });
                            }
                        } else {
                            res.status(404).json({
                                status: 404,
                                message: 'User not found',
                                data: {},
                            });
                        }
                        logger.info('results: ', results); // results contains rows returned by server
                    }
                );
                pool.releaseConnection(conn);
            }
        });
    },

    //UC-205 - Updaten van usergegevens
    updateUser: (req, res, next) => {
        const loggedInUserId = req.userId; // Logged-in user ID
        const userId = parseInt(req.params.userId);

        pool.getConnection(function (err, conn) {
            if (err) {
                console.log('error');
                next('error: ' + err.message);
                return;
            }

            const user = {
                id: userId,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                isActive: req.body.isActive,
                emailAdress: req.body.emailAdress,
                password: req.body.password,
                phoneNumber: req.body.phoneNumber,
                roles: req.body.roles,
                street: req.body.street,
                city: req.body.city,
            };

            // Check for missing fields
            function validateField(fieldName, fieldType, fieldValue) {
                if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
                    res.status(400).json({
                        status: 400,
                        message: `${fieldName} is required`,
                        data: {}
                    });
                    return false;
                }

                if (typeof fieldValue !== fieldType) {
                    res.status(400).json({
                        status: 400,
                        message: `${fieldName} (${fieldType}) is invalid!`,
                        data: {}
                    });
                    return false;
                }
                return true;
            }

            function emailValidation(emailAdress) {
                const regEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const isValidEmail = regEx.test(emailAdress);
                if (!isValidEmail) {
                    res.status(400).json({
                        status: 400,
                        message: `${emailAdress} is invalid`,
                        data: {},
                    });
                    return false;
                }
                return true;
            }

            function passwordValidation(password) {
                const regEx = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
                const validPassword = regEx.test(password);
                if (!validPassword) {
                    res.status(400).json({
                        status: 400,
                        message: `${password} is invalid`,
                        data: {},
                    });
                    return false;
                }
                return true;
            }

            function phoneNumberValidation(phoneNumber) {
                const regEx = /^06(\s|-)?\d{8}$/;
                const validPhoneNumber = regEx.test(phoneNumber);
                if (!validPhoneNumber) {
                    res.status(400).json({
                        status: 400,
                        message: `${phoneNumber} is invalid`,
                        data: {},
                    });
                    return false;
                }
                return true;
            }

            if (
                !validateField('firstName', 'string', user.firstName) ||
                !validateField('lastName', 'string', user.lastName) ||
                !validateField('emailAdress', 'string', user.emailAdress) ||
                !validateField('password', 'string', user.password) ||
                !emailValidation(user.emailAdress) ||
                !passwordValidation(user.password) ||
                !phoneNumberValidation(user.phoneNumber)
            ) {
                conn.release();
                return;
            }

            conn.query(
                'SELECT * FROM `user` WHERE `id` = ?',
                [user.id],
                function (err, results) {
                    if (err) {
                        res.status(500).json({
                            status: 500,
                            message: err.sqlMessage,
                            data: {}
                        });
                        conn.release();
                        return;
                    }

                    if (results.length === 0) {
                        res.status(404).json({
                            status: 404,
                            message: 'User not found',
                            data: {}
                        });
                        conn.release();
                        return;
                    }

                    // Check if the logged-in user is trying to update their own profile
                    if (loggedInUserId !== userId) {
                        res.status(403).json({
                            status: 403,
                            message: 'You cannot update someone elses info.',
                            data: {},
                        });
                        conn.release();
                        return;
                    }

                    conn.query(
                        'UPDATE `user` SET `firstName` = ?, `lastName` = ?, `isActive` = ?, `emailAdress` = ?, `password` = ?, `phoneNumber` = ?, `roles` = ?, `street` = ?, `city` = ? WHERE `id` = ?',
                        [user.firstName, user.lastName, user.isActive, user.emailAdress, user.password, user.phoneNumber, user.roles, user.street, user.city, user.id],
                        function (err, results) {
                            if (err) {
                                res.status(500).json({
                                    status: 500,
                                    message: err.sqlMessage,
                                    data: {}
                                });
                                conn.release();
                                return;
                            }

                            logger.info('results: ', results); // results contains rows affected by server
                            res.status(200).json({
                                status: 200,
                                message: 'User updated with id ' + user.id,
                                data: user
                            });
                            conn.release();
                        }
                    );
                }
            );
        });
    },

    //UC-206 - Verwijderen van user
    deleteUser: (req, res, next) => {
        const loggedInUserId = req.userId; // Logged-in user ID
        const userId = parseInt(req.params.userId);

        pool.getConnection(function (err, conn) {
            if (err) {
                console.log('error');
                next('error: ' + err.message);
                return;
            }

            conn.query(
                'SELECT * FROM `user` WHERE `id` = ?',
                [userId],
                function (err, results) {
                    if (err) {
                        res.status(500).json({
                            status: 500,
                            message: err.sqlMessage,
                            data: {}
                        });
                        conn.release();
                        return;
                    }

                    if (results.length === 0) {
                        res.status(404).json({
                            status: 404,
                            message: 'User not found',
                            data: {}
                        });
                        conn.release();
                        return;
                    }

                    // Check if the logged-in user is trying to delete their own profile
                    if (loggedInUserId !== userId) {
                        res.status(403).json({
                            status: 403,
                            message: 'You cannot delete someone elses info.',
                            data: {},
                        });
                        conn.release();
                        return;
                    }

                    conn.query(
                        'DELETE FROM `user` WHERE `id` = ?',
                        [userId],
                        function (err, results) {
                            if (err) {
                                res.status(500).json({
                                    status: 500,
                                    message: err.sqlMessage,
                                    data: {}
                                });
                                conn.release();
                                return;
                            }

                            logger.info('Results: ', results); // results contains rows affected by server
                            res.status(200).json({
                                status: 200,
                                message: 'User deleted met ID ' + userId,
                                data: {}
                            });
                            conn.release();
                        }
                    );
                }
            );
        });
    },
}

module.exports = userController;