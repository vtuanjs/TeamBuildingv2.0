const User = require('../controllers/user/user.model')
const jwt = require('jsonwebtoken')
const {
    SECRET_STRING
} = process.env
module.exports.required = async (req, res, next) => {
    let tokenKey = req.headers['x-access-token']
    try {
        const decodedJson = await jwt.verify(tokenKey, SECRET_STRING)
        if (Date.now() / 1000 > decodedJson.exp) {
            throw "Token expire, please login again"
        }

        const user = await User.findById(decodedJson.id)
        if (!user) {
            throw "Can not find user with this token"
        }
        if (user.isBanned === 1) {
            throw "User is blocked"
        }

        req.user = user
        return next()
    } catch (error) {
        next("Token error: " + error)
    }
}