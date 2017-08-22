// speech to text
var recognition = new webkitSpeechRecognition()
recognition.lang = 'nl-NL'
recognition.continuous = false
recognition.interimResults = true
recognition.maxAlternatives = 5

// init voices
var voices = window.speechSynthesis.getVoices()

// generate random session ID
function uuid () {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

// app
var app = new Vue({
	el: '#app',
	data: {
		userData: {},
		textInput: '',
		textResponse: '',
		loading: false,
		sampleQuestions: [
			'Hoeveel stappen heb ik vandaag gelopen?',
			'Ga ik mijn doel deze week halen?',
			'Hoeveel stappen moet ik ook al weer zetten?',
			'Hoeveel kilometer moet ik vandaag nog?',
			'Ben ik actiever geworden de laatste tijd?',
			'Hoe laat is het?'
		],
		data: [],
		contexts: []
	},
	created() {

		// load user data
		this.loadUserData()

		// load sample data
		this.loadData()

		// parse speech recognition result
		recognition.onresult = event => {
			this.textInput = event.results[0][0].transcript
			if (event.results[0].isFinal) this.textRequest()
		}

		// start listening on boot
		this.enableRecognition()
	},
	methods: {

		loadUserData: function () {
			if (localStorage.getItem('userdata')) {
				this.userData = JSON.parse(localStorage.getItem('userdata'))
			} else {
				this.createSession()
			}
		},

		createSession: function () {
			this.userData = {
				username: '',
				sessionId: uuid()
			}
			this.saveUserData()
		},

		saveUserData: function () {
			localStorage.setItem('userdata', JSON.stringify(this.userData))
		},

		loadData: function () {
			this.$http.get('./data.json').then(response => {

				// set data
				this.data = response.body

				// calculate contexts
				this.calculateContexts(this.data)

				// create charts
				this.createStepsTodayChart()
				this.createDistanceTodayChart()
				this.createStepsThisMonthChart()

			}, err => {
				console.error(err)
			})
		},

		calculateContexts: function (data) {

			var steps_goal = 10000
			var distance_goal = 5
			var days_done = 4
			var days_left = 7 - days_done
			var steps = data.map(dataPoint => dataPoint.steps).pop()
			var distance = data.map(dataPoint => dataPoint.distance).pop() / 100
			var steps_week = data.slice(data.length - days_done).map(dataPoint => dataPoint.steps).reduce((a, b) => a + b)
			var steps_week_goal = steps_goal * 7
			var steps_week_left = steps_week_goal - steps_week
			var steps_left_per_day = Math.ceil(steps_week_left / days_left)

			this.contexts = [
				{
					name: 'today',
					parameters: {
						steps: steps,
						steps_goal: steps_goal,
						steps_left: steps_goal - steps,
						distance: distance,
						distance_goal: distance_goal,
						distance_left: distance_goal - distance
					}
				},
				{
					name: 'goal',
					parameters: {
						days_left: days_left,
						steps_week: steps_week,
						steps_week_goal: steps_week_goal,
						steps_week_left: steps_week_left,
						steps_left_per_day: steps_left_per_day
					}
				},
				{
					name: 'user',
					parameters: {
						username: this.userData.username,
						sessionId: this.userData.sessionId
					}
				},
				{
					name: 'datetime',
					parameters: {
						time: new Date().toLocaleTimeString()
					}
				}
			]

			console.log('contexts', this.contexts)
		},

		textRequest: function () {
			this.loading = true

			// create query string
			var query = encodeURIComponent(JSON.stringify({
				text: this.textInput,
				sessionId: this.userData.sessionId,
				contexts: this.contexts
			}))

			// request to cloud functions
			this.$http.get(`https://us-central1-gp-bot-a8235.cloudfunctions.net/app/textRequest?q=${query}`).then(response => {
				this.loading = false
				console.log('result', response.body.result)
				this.textResponse = response.body.result.fulfillment.speech
				this.speak(this.textResponse)
			}, err => {
				this.loading = false
				console.error(err)
			})

		},

		buttonRequest: function (event) {
			this.textInput = event.toElement.innerText
			this.textRequest()
		},

		enableRecognition: function () {
			console.log('enable')
			recognition.start()
		},

		disableRecognition: function () {
			console.log('disable')
			recognition.stop()
		},

		speak: function (text) {

			// create message
			var voices = window.speechSynthesis.getVoices()
			var msg = new SpeechSynthesisUtterance()
			msg.voice = voices[41] // Dutch text to speech
			msg.text = text

			// disable voice recognition during speech
			msg.onstart = () => {
				this.disableRecognition()
			}

			// re-enable voice recognition after speech
			msg.onend = () => {
				this.enableRecognition()
			}

			// re-enable voice recognition when speech fails
			msg.onerror = () => {
				this.enableRecognition()
			}

			// speak
			window.speechSynthesis.speak(msg)
		},

		createStepsTodayChart: function () {
			var ctx = document.getElementById('chart-steps-today').getContext('2d')

			var chart = new Chart(ctx, {
				type: 'doughnut',
				data: {
					labels: ['Stappen gelopen', 'Stappen om doel te bereiken'],
					datasets: [{
						label: 'Stappen',
						data: [
							this.contexts[0].parameters.steps,
							(this.contexts[0].parameters.steps_goal - this.contexts[0].parameters.steps),
						],
						backgroundColor: [
							'rgba(100, 102, 255, 0.3)',
							'rgba(100, 102, 255, 0.1)'
						],
						borderColor: [
							'rgba(100, 102, 255, 1)',
							'rgba(100, 102, 255, 0.5)'
						],
						borderWidth: 1
					}]
				},
				options: {
					layout: {
						padding: 50
					},
					legend: {
						display: false
					}
				}
			})
		},

		createDistanceTodayChart: function () {
			var ctx = document.getElementById('chart-distance-today').getContext('2d')
			
			var chart = new Chart(ctx, {
				type: 'doughnut',
				data: {
					labels: ['Afstand gelopen', 'Afstand af te leggen tot doel'],
					datasets: [{
						label: 'Stappen',
						data: [
							this.contexts[0].parameters.distance,
							(this.contexts[0].parameters.distance_goal - this.contexts[0].parameters.distance),
						],
						backgroundColor: [
							'rgba(100, 102, 255, 0.3)',
							'rgba(100, 102, 255, 0.1)'
						],
						borderColor: [
							'rgba(100, 102, 255, 1)',
							'rgba(100, 102, 255, 0.5)'
						],
						borderWidth: 1
					}]
				},
				options: {
					layout: {
						padding: 50
					},
					legend: {
						display: false
					}
				}
			})
		},

		createStepsThisMonthChart: function () {
			var ctx = document.getElementById('chart-steps-month').getContext('2d')

			var chart = new Chart(ctx, {
				type: 'bar',
				data: {
					labels: this.data.map(dataPoint => dataPoint.date),
					datasets: [{
						label: 'Stappen',
						data: this.data.map(dataPoint => dataPoint.steps),
						backgroundColor: 'rgba(100, 102, 255, 0.4)',
						borderColor: 'rgba(100, 102, 255, 1)',
						borderWidth: 1
					}]
				},
				options: {
					layout: {
						padding: 10
					},
					legend: {
						display: false
					}
				}
			})
		}
	}
})

