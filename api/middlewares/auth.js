const User = require('../controllers/user/user.model')
const { verifyToken } = require('../helpers/jwt.helper')
const secretString = process.env.TOKEN_SECRET


/**
 * private function generateToken
 * @param user 
 * @param secretString 
 * @param tokenLife 
 */
module.exports.required = async (req, res, next) => {
    let tokenKey = req.headers['x-access-token']
    try {
        const decodedJson = await verifyToken(tokenKey, secretString)

        const user = await User.findById(decodedJson._id)
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