const logger = require('../util/utils').logger;
const assert = require('assert')
const pool = require('../util/mysql-db')
const jwt = require('jsonwebtoken');

const userController = {
    getAllUsers: (req, res, next) => {
        const method = req.method
        logger.info(`Method ${method} is called with parameters ${JSON.stringify(req.params)}`)

        pool.getConnection(function (err, conn) {
            if (err) {
                console.log('error');
            }
            if (conn) {
                conn.query('SELECT * FROM `user` ',
                    function (err, results) {
                        if (err) {
                            res.status(500).json(
                                {
                                    status: 500,
                                    message: err.sqlMessage,
                                    data: {}
                                });
                        }
                        //logger.info('Results: ', results); // results contains rows returned by server
                        res.status(200).json(
                            {
                                status: 200,
                                message: 'User getAll endpoint',
                                data: results
                            });
                    }
                );
            }
            pool.releaseConnection;
        });
    },

    getProfile: (req, res, next) => {
        logger.trace('Get user profile for user', req.userId);

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
                            code: 200,
                            message: 'Get User profile',
                            data: results[0]
                        });
                    }
                });
                pool.releaseConnection(conn);
            }
        });
    },

    createUser: (req, res, next) => {
        pool.getConnection(function (err, conn) {
            if (err) {
                console.log('error');
                next('error: ' + err.message);
            } else {
                conn.query(
                    'SELECT COUNT(*) AS count FROM `user`',
                    function (err, results) {
                        if (err) {
                            res.status(500).json({
                                status: 500,
                                message: err.sqlMessage,
                                data: {},
                            });
                        } else {
                            const count = results[0].count;
                            const userId = count + 1;

                            const user = {
                                id: userId,
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

                            if (
                                !validateField('firstName', 'string', user.firstName) ||
                                !validateField('lastName', 'string', user.lastName) ||
                                !validateField('emailAdress', 'string', user.emailAdress) ||
                                !validateField('password', 'string', user.password) ||
                                !validateField('phoneNumber', 'string', user.phoneNumber)
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
                                            message: 'User added with id ' + user.id,
                                            data: user,
                                        });
                                    }
                                }
                            );
                        }
                        pool.releaseConnection(conn);
                    }
                );
            }
        });
    },

    getUser: (req, res) => {
        const method = req.method
        logger.info(`Method ${method} is called with parameters ${JSON.stringify(req.params)}`)

        const userId = parseInt(req.params.userId);

        pool.getConnection(function (err, conn) {
            if (err) {
                console.log('error');
            }
            if (conn) {
                conn.query('SELECT * FROM `user` WHERE `id` = ?', [userId], // use `?` as a placeholder
                    function (err, results) {
                        if (err) {
                            res.status(500).json(
                                {
                                    status: 500,
                                    message: err.sqlMessage,
                                    data: {}
                                });
                        }
                        if (results.length === 0) {
                            res.status(404).json({
                                status: 404,
                                message: 'User not found',
                                data: {}
                            });
                            return;
                        }
                        if (results) {
                            //logger.info('Results: ', results); // results contains rows returned by server

                            res.status(200).json(
                                {
                                    status: 200,
                                    message: 'User endpoint',
                                    data: results
                                });
                        }

                    }
                );
            }
            pool.releaseConnection;
        });
    },

    updateUser: (req, res) => {
        const user = req.body;
        const userId = parseInt(req.params.userId)
        const method = req.method
        logger.info(`Method ${method} is called with parameters ${JSON.stringify(req.params)}`)

        pool.getConnection(function (err, conn) {
            if (err) {
                console.log('error')
                next('error: ' + err.message)
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
                city: req.body.city
            };

            // Check for missing fields
            function validateField(fieldName, fieldType, fieldValue) {
                if (!fieldValue || typeof fieldValue !== fieldType) {
                    res.status(400).json({
                        status: 400,
                        message: `${fieldName} (${fieldType}) is invalid!`,
                        data: {}
                    });
                    return false;
                }
                return true;
            }

            if (!validateField('firstName', 'string', user.firstName) ||
                !validateField('lastName', 'string', user.lastName) ||
                !validateField('email', 'string', user.emailAdress) ||
                !validateField('password', 'string', user.password) ||
                !validateField('phoneNumber', 'string', user.phoneNumber) ||
                !validateField('isActive', 'number', user.isActive)
            ) {
                return;
            }

            conn.query(
                'UPDATE `user` SET `firstName` = ?, `lastName` = ?, `isActive` = ?, `emailAdress` = ?, `password` = ?, `phoneNumber` = ?, `roles` = ?, `street` = ?, `city` = ? WHERE `id` = ?',
                [user.firstName, user.lastName, user.isActive, user.emailAdress, user.password, user.phoneNumber, user.roles, user.street, user.city, userId],
                function (err, results) {
                    if (err) {
                        res.status(500).json({
                            status: 500,
                            message: err.sqlMessage,
                            data: {}
                        });
                        return;
                    }

                    logger.info('results: ', results); // results contains rows returned by server
                    res.status(200).json({
                        status: 200,
                        message: 'User updated with id ' + user.id,
                        data: user
                    });
                    pool.releaseConnection(conn);
                }
            );
        });
    },

    deleteUser: (req, res, next) => {
        const method = req.method
        const userId = parseInt(req.params.userId)

        logger.info(`Method ${method} is called with parameters ${JSON.stringify(req.params)}`)

        pool.getConnection(function (err, conn) {
            if (err) {
                console.log('Error')
                next('Error: ' + err.message)
            }

            if (conn) {
                conn.query('DELETE FROM `user` WHERE `id` = ? ', [userId],
                    function (err, results) {
                        if (err) {
                            res.status(500).json(
                                {
                                    status: 500,
                                    message: err.sqlMessage,
                                    data: {}
                                });
                            return;
                        }
                        res.status(200).json(
                            {
                                status: 200,
                                message: 'User deleted with id ' + userId,
                                data: results
                            });
                    }
                );
            }
            pool.releaseConnection;
        });
    }
}

//wachtwoord: minstens 1 cijfer, 1 hoofdletter, 8 chars
//email: n.lastname@domain.com -> 1 of meer letters voor @, 2 of meer letters na @, 2 of 3 na .
module.exports = userController;