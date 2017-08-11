'use strict'

// packages
const express = require('express')
const cors = require('cors')({origin: true})
const functions = require('firebase-functions')
const apiai = require('apiai')
const app = express()
const bot = apiai('e01c268c33ca43a2b5884e8977f39ef4')

// middleware
app.use(cors)

// text request handler
app.get('/textRequest', (req, res) => {

	const query = JSON.parse(req.query.q)

	const request = bot.textRequest(query.text, {
		sessionId: query.sessionId
	})

	request.on('response', function(response) {
		return res.send(response)
	})

	request.on('error', function(error) {
		return res.status(500).send(error)
	})

	request.end()

})

exports.app = functions.https.onRequest(app)
