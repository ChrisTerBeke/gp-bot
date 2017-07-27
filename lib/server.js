'use strict'

// packages
const express = require('express')
const bodyParser = require('body-parser')

// config
require('./config')

// bot lib
const bot = require('./bot').bot

// create server
const app = express()

// middleware
app.use(bodyParser.json())

// root endpoint
app.use('/', (req, res) => {
	bot (req.body, res, (err, success) => {
		if (err) {
			return res.status(500).send(err.message)
		} else if (success) {
			return res.status(200).send(success)
		}
	})
})

// start server
app.listen(process.env.PORT || 5000, () => {
    console.log('Our bot is running on port', process.env.PORT || 5000)
})
