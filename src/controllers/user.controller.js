const logger = require('../util/utils').logger;
const assert = require('assert')
const database = require('../util/inmem-db')
const pool = require('../util/mysql-db')

const userController = {
    getAllUsers: (req, res) => {
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

    createUser: (req, res) => {
        const user = req.body;
        const method = req.method
        logger.info(`Method ${method} is called with parameters ${JSON.stringify(req.params)}`)

        pool.getConnection(function (err, conn) {
            if (err) {
                console.log('error')
                next('error: ' + err.message)
            }
            if (conn) {
                conn.query(
                    'SELECT COUNT(*) AS count FROM `user`',
                    function (err, results) {
                        if (err) {
                            res.status(500).json({
                                status: 500,
                                message: err.sqlMessage,
                                data: {}
                            });
                            return;
                        }

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
                            city: req.body.city
                        };

                        // Check for missing fields
                        if (!user.firstName || typeof user.firstName !== 'string') {
                            res.status(400).json({
                                status: 400,
                                message: 'firstName (string) is invalid!',
                                data: {}
                            });
                            return;
                        }

                        if (!user.lastName || typeof user.lastName !== 'string') {
                            res.status(400).json({
                                status: 400,
                                message: 'lastName (string) is invalid!',
                                data: {}
                            });
                            return;
                        }

                        if (!user.emailAdress || typeof user.emailAdress !== 'string') {
                            res.status(400).json({
                                status: 400,
                                message: 'email (string) is invalid!',
                                data: {}
                            });
                            return;
                        }

                        if (!user.password || typeof user.password !== 'string') {
                            res.status(400).json({
                                status: 400,
                                message: 'password (string) is invalid!',
                                data: {}
                            });
                            return;
                        }
                        conn.query(
                            'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `phoneNumber`, `roles`, `street`, `city`) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                            [user.id, user.firstName, user.lastName, user.emailAdress, user.password, user.phoneNumber, user.roles, user.street, user.city],
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
                                    message: 'User added with id ' + user.id,
                                    data: results
                                });
                            }
                        );
                    }
                );
                pool.releaseConnection(conn);
            }
        });
    },

    getProfile: (req, res) => {
        const method = req.method
        logger.info(`Method ${method} is called with parameters ${JSON.stringify(req.params)}`)

        const user = {
            id: 3,
            firstname: 'Test',
            lastname: 'Tester',
            email: 'test@ziggo.com',
            password: 'Welkom04!',
            phoneNumber: '0612345789',
            active: false
        }

        res.status(200).json({
            status: 200,
            message: 'Functionaliteit nog niet gerealiseerd',
            data: user
        })
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
module.exports = userController;