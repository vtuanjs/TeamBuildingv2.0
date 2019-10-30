
const express = require('express')
const router = express.Router()
const auth = require('../controllers/auth')
const authentication = require('../middlewares/auth')

router.post('/login', auth.login)

router.post('/logout', authentication.required, auth.logout)

router.post('/force-logout', authentication.required, auth.forceLogout)

module.exports = router