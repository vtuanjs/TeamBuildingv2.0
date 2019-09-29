const express = require('express')
const router = express.Router()

router.get('/', function (req, res) {
    // res.render('index', { title: 'Hey', message: 'Hello there!' })
    res.json({ message: "Success" })
})

module.exports = router