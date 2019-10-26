const User = require('../controllers/user/user.model')
const { verifyToken, TOKEN_EXPIRE_STRING } = require('../helpers/jwt.helper')
const secretString = process.env.TOKEN_SECRET

const findUser = (userId) => {
    return new Promise((resolve, reject) => {
        User.findById(userId, (error, user) => {
            if (error){
                return reject(error)
            }

            if (!user) {
                return reject("Can not find user with this token")
            }

            if (user.isBanned === 1) {
                return reject("User is blocked")
            }

            resolve(user)
        })
    })
}

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

        const user = await findUser(decodedJson._id)

        req.user = user
        return next()
    } catch (error) {
        res.status(403).json({
            message: `Token error: ` + error
        })
    }
}