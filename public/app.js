// speech to text
var recognition = new webkitSpeechRecognition()
recognition.lang = 'nl-NL'
recognition.continuous = false
recognition.interimResults = true
recognition.maxAlternatives = 5

// text to speech
var voices = window.speechSynthesis.getVoices()

// app
var app = new Vue({
	el: '#app',
	data: {
		username: 'Chris',
		sessionId: '1234',
		textInput: '',
		textResponse: '',
		loading: false,
		sampleQuestions: [
			'Ga ik mijn doel halen deze maand?',
			'Hoeveel stappen moet ik deze week nog?',
			'Hoeveel stappen heb ik deze week gelopen?',
			'Ben ik afgelopen maand meer actief geworden?'
		],
		data: [],
		stepsToday: 0,
		stepsGoal: 10000,
		distanceToday: 0,
		distanceGoal: 5
	},
	created() {

		// load sample data
		this.loadData()

		// start listening on boot
		this.enableRecognition()

		// parse speech recognition result
		recognition.onresult = event => {
			this.textInput = event.results[0][0].transcript
			if (event.results[0].isFinal) this.textRequest()
		}
	},
	methods: {

		loadData: function () {
			this.$http.get('./data.json').then(response => {
				this.data = response.body

				// calculate today steps
				this.stepsToday = this.data.map(dataPoint => dataPoint.steps).pop()

				// calculate today distance
				this.distanceToday = this.data.map(dataPoint => dataPoint.distance).pop() / 100

				// create charts
				this.createStepsTodayChart()
				this.createDistanceTodayChart()
				this.createStepsThisMonthChart()

			}, err => {
				console.error(err)
			})
		},

		textRequest: function () {
			this.loading = true

			// create query string
			var query = encodeURIComponent(JSON.stringify({
				text: this.textInput,
				sessionId: this.sessionId
			}))

			// request to cloud functions
			this.$http.get(`https://us-central1-gp-bot-a8235.cloudfunctions.net/app/textRequest?q=${query}`).then(response => {
				this.loading = false
				console.log('result', response.body.result)
				this.textResponse = response.body.result.fulfillment.speech
				this.speak(this.textResponse)
			}, err => {
				this.loading = false
				this.enableRecognition()
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
			msg.voice = voices[59] // Dutch femaile text to speech
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
							this.stepsToday,
							(this.stepsGoal - this.stepsToday),
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
							this.distanceToday,
							(this.distanceGoal - this.distanceToday),
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

