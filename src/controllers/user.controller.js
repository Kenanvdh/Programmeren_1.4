const logger = require('../util/utils').logger;
const assert = require('assert')
const database = require('../util/database')

const userController = {

    getAllUsers: (req, res) => {
        const method = req.method
        logger.info(`Method ${method} is called with parameters ${JSON.stringify(req.params)}`)
    
        const active = req.query.active;
        const firstName = req.query.firstName;
        let filteredUsers = database.users;
    
        const allowedFilters = ['active', 'firstName'];
        const invalidFilters = Object.keys(req.query).filter(key => !allowedFilters.includes(key));
        if (invalidFilters.length) {
            res.status(400).json({
                status: 400,
                message: 'No valid filter(s) found',
                data: []
            });
            return;
        }
    
        if (firstName) {
            const pattern = new RegExp(firstName, 'i');
            filteredUsers = filteredUsers.filter(user => pattern.test(user.firstname));
        }
    
        if (active === 'true') {
            filteredUsers = filteredUsers.filter(user => user.active === true);
        } else if (active === 'false') {
            filteredUsers = filteredUsers.filter(user => user.active === false);
        }
    
        // return the filtered user list in the response
        res.status(200).json({
            status: 200,
            message: 'User list',
            data: filteredUsers
        });
    },

    createUser: (req, res) => {
        const user = req.body;
        const method = req.method
        logger.info(`Method ${method} is called with parameters ${JSON.stringify(req.params)}`)
    
        // Check for missing fields
        if (!user.firstname || typeof user.firstname !== 'string') {
            res.status(400).json({
                status: 400,
                message: 'firstname (string) is invalid!',
                data: {}
            });
            return;
        }
    
        if (!user.lastname || typeof user.lastname !== 'string') {
            res.status(400).json({
                status: 400,
                message: 'lastname (string) is invalid!',
                data: {}
            });
            return;
        }
    
        if (!user.email || typeof user.email !== 'string') {
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
    
        // Check for invalid email format
        const emailRegex = /\S+@\S+.\S+/;
        if (!emailRegex.test(user.email)) {
            res.status(400).json({
                status: 400,
                message: 'Invalid email format!',
                data: {}
            });
            return
        }
    
        const phoneRegex = /^(06)[0-9]{8}$/;
        if (!phoneRegex.test(user.phoneNumber)) {
            res.status(400).json({
                status: 400,
                message: 'Invalid phone number format!',
                data: {}
            });
            return;
        }
    
        // Check for invalid password format
        // const passwordRegex = /^(?=.[a-z])(?=.[A-Z])(?=.\d)(?=.[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/;
        const passwordRegex = /^[A-Z]$/;
        if (!passwordRegex.test(user.password)) {
            res.status(400).json({
                status: 400,
                message: 'Invalid password format!',
                data: {}
            });
            return;
        }
    
        // Check for existing user with the same email
        const existingUser = database.users.find(u => u.email === user.email);
        if (existingUser) {
            res.status(403).json({
                status: 403,
                message: 'User email adres already exists',
                data: {}
            });
            return;
        }
    
        // Add the new user
        user.active = true;
        user.id = database.index++;
        database.users.push(user);
    
        res.status(201).json({
            status: 201,
            message: `User added with id ${user.id}`,
            data: user
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
        const user = database.users.find(user => user.id === userId)
    
        if (!user) {
            res.status(404).json({
                status: 404,
                message: 'User not found',
                data: {}
            });
            return;
        }
    
        res.status(200).json({
            status: 200,
            message: 'user id info endpoint',
            data: user
        })
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