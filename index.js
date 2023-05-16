const express = require('express')
const logger = require('./src/util/utils').logger;
const userRoutes = require('./src/routes/user.routes')
const mealRoutes = require('./src/routes/meal.routes');
const authRoutes = require('./src/routes/auth.routes')
const app = express()
const port = process.env.PORT || 3000;

app.use(express.json()) 
app.listen(port, () => {
    logger.info(`Example app listening on port ${port}`)
})

app.get('/api/info', (req, res) => {
    const method = req.method
    logger.info(`Method ${method} is called with parameters ${JSON.stringify(req.params)}`)

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

//Routes
app.use('/api/user', userRoutes)
app.use('/api/meal', mealRoutes)
app.use('/api', authRoutes)

app.use('*', (req, res) => {
    res.status(404).json({
        status: 404,
        message: 'Endpoint not found',
        data: {}
    })
})

app.use('*', (req, res, next) => {
    const method = req.method
    logger.info(`Method ${method} is called with parameters ${JSON.stringify(req.params)}`)
    next()
})

module.exports = app
