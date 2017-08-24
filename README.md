# GP Bot
A dashboard application with an embodied virtual agent to track your daily activity. GP bot is a prototype application for a research project about activity tracking in a daily personal support system.

## Demo
A demo is available on https://gp-bot-a8235.firebaseapp.com. Be sure to run it in the latest version of Google Chrome for voice recognition and text-to-speech capabilities.

## Installation
Follow these steps to install GP bot on your local machine. Make sure to have Node.js 6+ with NPM installed.

1) Install the Firebase CLI tools

```
npm install -g firebase-tools
```

2) Clone this project and cd into it

```
git clone https://github.com/ChrisTerBeke/gp-bot.git
```

3) Install the functions dependencies

```
cd gp-bot/functions
npm install
```

4) Run the Firebase local dev server

```
firebase serve
```

This will emulate the functions and public hosting on a local server, defaulting to port 5000. For more information check https://firebase.google.com/docs/functions/local-emulator.

## Technology
The following technologies are used for this demo application:

* Api.ai (for intelligent conversational behaviour): https://api.ai
* Firebase (static hosting and cloud functions): https://firebase.google.com
* Vue.js (interactive front-end components): https://vuejs.org
* Web Speech API (voice recognition and text-to-speech): https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
* Chart.js (interactive charts): http://www.chartjs.org
* Bootstrap (CSS layout): https://getbootstrap.com

## Intelligence
The conversations with the virtual agent (Robin the Robot) are powered by [Api.ai](https://api.ai). This makes Robin an intelligent asistant to get more information about your daily activity and goals. Robin remembers who you are (context aware), has access to the dashboard data to give insightful answers (step count, kilometers, personal goals).

Example questions (translated from original Dutch):
* "How many steps did I walk today?"
* "Will I reach my goal this week?"
* "How many steps should I do today?"
* "How many kilometers do I still need to walk today?"
* "What time is it?"