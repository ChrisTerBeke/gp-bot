'use strict'

// packages
const express = require('express')
const bodyParser = require('body-parser')
const apiai = require('apiai')
const bot = apiai('e01c268c33ca43a2b5884e8977f39ef4')

// create server
const app = express()

// middleware
app.use(bodyParser.json())

// listen to text input
app.post('/', (req, res) => {

	const request = bot.textRequest(req.body.text, {
		sessionId: req.body.sessionId
	});
	
	request.on('response', function(response) {
		return res.send(response)
	})
	 
	request.on('error', function(error) {
		return res.status(500).send(error)
	})
	 
	request.end()
})

// start server
app.listen(process.env.PORT || 5000, () => {
    console.log('Our bot is running on port', process.env.PORT || 5000)
})
