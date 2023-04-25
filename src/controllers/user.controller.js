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
        const method = req.method
        logger.info(`Method ${method} is called with parameters ${JSON.stringify(req.params)}`)


        const userId = parseInt(req.params.userId); // convert userId to an integer
        const user = database.users.find(user => user.id === userId);

        if (!user) {
            res.status(404).json({
                status: 404,
                message: 'User not found, cannot update',
                data: {}
            });
            return;
        }

        const { firstname, lastname, email, phoneNumber, password } = req.body;
        if (!firstname || typeof firstname !== 'string') {
            res.status(400).json({
                status: 400,
                message: 'firstname (string) is invalid!',
                data: {}
            });
            return;
        }

        if (!lastname || typeof lastname !== 'string') {
            res.status(400).json({
                status: 400,
                message: 'lastname (string) is invalid!',
                data: {}
            });
            return;
        }

        if (!email || typeof email !== 'string') {
            res.status(400).json({
                status: 400,
                message: 'email (string) is invalid!',
                data: {}
            });
            return;
        }

        if (!password || typeof password !== 'string') {
            res.status(400).json({
                status: 400,
                message: 'password (string) is invalid!',
                data: {}
            });
            return;
        }

        // Check for invalid email format
        const emailRegex = /\S+@\S+.\S+/;
        if (!emailRegex.test(user.email)) {
            res.status(400).json({
                status: 400,
                message: 'Invalid email format!',
                data: {}
            });
            return;
        }

        // if (!phoneRegex.test(user.phoneNumber)) {
        //     res.status(400).json({
        //         status: 400,
        //         message: 'Invalid phone number format!',
        //         data: {}
        //     });
        //     return;
        // }

        // // Check for invalid password format
        // const passwordRegex = /^(?=.[a-z])(?=.[A-Z])(?=.\d)(?=.[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/;
        // if (!passwordRegex.test(user.password)) {
        //     res.status(400).json({
        //         status: 400,
        //         message: 'Invalid password format!',
        //         data: {}
        //     });
        //     return;
        // }

        // update user information
        user.firstname = firstname;
        user.lastname = lastname;
        user.email = email;
        user.phoneNumber = phoneNumber;
        user.password = password;

        res.status(200).json({
            status: 200,
            message: 'User updated successfully',
            data: {
                user
            }
        });
    },

    deleteUser: (req, res) => {
        const method = req.method
        logger.info(`Method ${method} is called with parameters ${JSON.stringify(req.params)}`)


        const userId = parseInt(req.params.userId)
        const user = database.users.find(user => user.id === userId);

        if (!user) {
            res.status(404).json({
                status: 404,
                message: 'User not found, cannot delete',
                data: {}
            });
            return;
        }

        database.users.splice(user, 1);
        res.status(200).json({
            status: 200,
            message: 'User met ID ' + userId + ' deleted'

        });
    }
}

module.exports = userController;