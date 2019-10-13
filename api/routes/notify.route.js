const express = require("express")
const router = express.Router()
const notify = require("../controllers/notify")
const authentication = require("../middlewares/auth")

router.get('/', authentication.required, notify.getNotifies)

module.exports = router