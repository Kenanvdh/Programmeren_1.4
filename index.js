const express = require('express')
const app = express()
const port = 3000
const logger = require('./src/util/utils').logger;
const routes = require('./src/routes/user.routes')

app.use(express.json())
app.use('*', (req, res, next) => {
    const method = req.method
    logger.info(`Method ${method} is called with parameters ${JSON.stringify(req.params)}`)
    next()
})

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

//Routes van Use cases
app.use('/api/user', routes)

app.use('*', (req, res) => {
    res.status(404).json({
        status: 404,
        message: 'Endpoint not found',
        data: {}
    })
})

module.exports = app
