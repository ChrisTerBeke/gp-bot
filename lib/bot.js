'use strict'

// packages
const recastai = require('recastai').default
const client = new recastai(process.env.REQUEST_TOKEN)

/**
 * Handle incoming bot messages
 */
module.exports.bot = (body, response, callback) => {

	if (body.text) {

		// get token
		const conversationToken = body.conversationToken || process.env.CONVERSATION_TOKEN || null

		// converse text on Recast.io servers to find context
		client.request.converseText(body.text, { conversationToken }).then(message => {

			console.log('message', message)
			
			const reply = message.reply()

			if (message.reply()) {
				return callback(null, {
					conversationToken: message.conversationToken,
					reply: message.reply()
				})
			} else {
				return callback(null, {
					conversationToken: message.conversationToken,
					reply: 'No reply'
				})
			}

		}).catch(callback)

	} else {

		// TODO

	}

}