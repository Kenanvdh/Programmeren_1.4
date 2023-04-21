const express = require('express')
const app = express()
const port = 3000

var logger = require('tracer').console()
let userIdCounter = 0;

app.use(express.json())
app.use('*', (req, res, next) => {
    const method = req.method
    const parameters = req.params
    logger.log(`Method ${method} is called with parameters ${JSON.stringify(req.params)}`)
    next()
})

app.get('/api/info', (req, res) => {
    // let path = req.request.path
    // console.log(`op route ${path}`)
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

let database = {
    users: [
        {
            id: 1,
            firstname: 'Kenan',
            lastname: 'van der Heijden',
            email: 'kenanvdh@ziggo.nl',
            password: 'Welkom01!'
        },
        {
            id: 2,
            firstName: 'John',
            lastName: 'Doe',
            email: 'Johndoe@gmail.com',
            password: 'Welkom02!'
        },
        {
            id: 3,
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'Janedoe@gmail.com',
            password: 'Welkom03!'
        }
    ]
}

let index = database.users.length;



//UC-201
app.post('/api/register', (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        res.status(400).json({
            status: 400,
            message: 'All fields are required!',
            data: {}
        })
        return
    };

    const emailRegex = /\S+@\S+.\S+/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

    if (!emailRegex.test(email)) {
        res.status(400).json({ message: 'Invalid email format!' });
        return;
    }

    if (!passwordRegex.test(password)) {
        res.status(400).json({ message: 'Invalid password!' });
        return;
    }

    const user = database.users.find(u => u.email === email);

    if (user) {
        res.status(403).json({
            status: 403,
            message: 'User already exists!',
            data: {}
        });
        return;
    }

    user.id = index++;
    const newUser = { id, firstName, lastName, email, password };

    database['users'].push(newUser);

    res.status(201).json({
        status: 201,
        message: 'User registered',
        data: {
            newUser
        }
    })
});

//UC-202
app.get('/api/user', (req, res) => {
    res.status(200).json({
        status: 200,
        message: 'user lijst',
        data: database.users
    })
});


//UC-203
app.get('/api/user/profile', (req, res) => {
    const user = { id: 1, name: 'John Doe', email: 'john.doe@example.com', password: 'joe' };
    res.status(200).json({
        status: 200,
        message: 'user profiel',
        data: user
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
            message: 'User not found',
            data: {}
        });
        return;
    }

    const { firstName, lastName, email, password } = req.body;

    // update user information
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
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
            message: 'User not found',
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
