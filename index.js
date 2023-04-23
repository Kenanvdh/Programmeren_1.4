const express = require('express')
const app = express()
const port = 3000

var logger = require('tracer').console()

let database = {
    users: [
        {
            id: 0,
            firstname: 'Kenan',
            lastname: 'van der Heijden',
            email: 'kenanvdh@ziggo.nl',
            password: 'Welkom01!',
            phoneNumber: '0642108889',
            active: true
        },
        {
            id: 1,
            firstname: 'John',
            lastname: 'Doe',
            email: 'Johndoe@gmail.com',
            password: 'Welkom02!',
            phoneNumber: '0611111111',
            active: true
        },
        {
            id: 2,
            firstname: 'Jane',
            lastname: 'Doe',
            email: 'Janedoe@gmail.com',
            password: 'Welkom03!',
            phoneNumber: '0623456789',
            active: false
        }
    ]
}

app.use(express.json())
app.use('*', (req, res, next) => {
    const method = req.method
    logger.log(`Method ${method} is called with parameters ${JSON.stringify(req.params)}`)
    next()
})

app.get('/api/info', (req, res) => {
    res.status(201).json({
        status: 201,
        message: 'Server info-endpoint',
        data: {
            studentName: 'Kenan',
            studentNumber: 2197280,
            description: 'Welkom bij de server API van de share-a-meal'
        },
    })
});

app.listen(port, () => {
    logger.log(`Example app listening on port ${port}`)
})

let index = database.users.length;

//UC-201
app.post('/api/register', (req, res) => {
    const user = req.body;

    // Check for missing fields
    if (!user.firstName || !user.lastName || !user.email || !user.phoneNumber || !user.password) {
        res.status(400).json({
            status: 400,
            message: 'Fields are required!',
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
    
    const phoneRegex = /^(06)[0-9]{8}$/

    if (!phoneRegex.test(user.phoneNumber)) {
        res.status(400).json({
            status: 400,
            message: 'Invalid phone number format!',
            data: {}
        });
        return;
    }

    // Check for invalid password format
    const passwordRegex = /^(?=.[a-z])(?=.[A-Z])(?=.\d)(?=.[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/;
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
    user.id = index++;
    database.users.push(user);

    res.status(201).json({
        status: 201,
        message: `User added with id ${user.id}`,
        data: user
    });
});

//UC-202
app.get('/api/user', (req, res) => {
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
});


//UC-203
app.get('/api/user/profile', (req, res) => {
    res.status(200).json({
        status: 200,
        message: 'Functionaliteit nog niet gerealiseerd',
    })
});


//UC-204
app.get('/api/user/:userId', (req, res) => {
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
});

//UC-205

app.put('/api/user/:userId', (req, res) => {
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

    const { firstName, lastName, email, phoneNumber, password } = req.body;

    if(email === undefined){
        res.status(400).json({
            status: 400,
            message: 'Email is undefined',
            data: {}
        });
    }

    const phoneRegex = /^(06)[0-9]{8}$/
    if (!phoneRegex.test(phoneNumber)) {
        res.status(400).json({
            status: 400,
            message: 'Invalid phone number format!',
            data: {}
        });
        return;
    }

    // update user information
    user.firstName = firstName;
    user.lastName = lastName;
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
});

//UC-206
app.delete('/api/user/:userId', (req, res) => {
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
});

app.use('*', (req, res) => {
    res.status(404).json({
        status: 404,
        message: 'Endpoint not found',
        data: {}
    })
})

module.exports = app
