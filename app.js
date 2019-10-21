const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const { ACCESS_CONTROL_ORIGIN } = process.env
const cors = require('cors')

app.use(cors({ origin: ACCESS_CONTROL_ORIGIN }))
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.set('view engine', 'pug')
app.set('views', './views')
app.use(cookieParser())

app.use('/', require('./api/routes/index.route'))
app.use('/user', require('./api/routes/user.route'))
app.use('/auth', require('./api/routes/auth.route'))
app.use('/project', require('./api/routes/project.route'))
app.use('/job', require('./api/routes/job.route'))
app.use('/comment', require('./api/routes/comment.route'))
app.use('/notify', require('./api/routes/notify.route'))
app.use('/team', require('./api/routes/team.route'))

app.use((error, _req, res, _next) => {
    res.status(400).json({ message: "Something went wrong! " + error })
})

module.exports = app
