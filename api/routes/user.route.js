const express = require("express")
const router = express.Router()
const user = require("../controllers/user")
const authentication = require("../middlewares/auth")
const checkPermit = require("../middlewares/permistion")

router.post("/", user.postUser)

router.post("/admin/", user.postAdmin)

router.post("/admin/:userIds/block", authentication.required, checkPermit({
    model: "user",
    role: "admin"
}), user.blockUsers)

router.post("/admin/:userIds/unlock", authentication.required, checkPermit({
    model: "user",
    role: "admin"
}), user.unlockUsers)

router.get("/", user.getUsers)

router.get("/:userId", user.getUser)

router.get("/get-by-email/:email", user.getByEmail)

router.put("/:userId", authentication.required, checkPermit({
    model: "user",
    role: "self"
}), user.updateUser)

router.delete("/admin/:userId", authentication.required, checkPermit({
    model: "user",
    role: "admin"
}), user.deleteUser)

module.exports = router

