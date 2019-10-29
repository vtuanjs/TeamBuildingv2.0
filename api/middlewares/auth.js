const User = require('../controllers/user/user.model')
const { verifyToken, generateToken } = require('../helpers/jwt.helper')
const tokenSecret = process.env.TOKEN_SECRET || 'secret3322'
const tokenLife = process.env.TOKEN_LIFE || 8640
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'secret3323332'
const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE || 86400

const findUser = (userId) => {
    return new Promise((resolve, reject) => {
        User.findById(userId, (error, user) => {
            if (error) {
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
    const tokenKey = req.headers['x-access-token']
    try {
        const decodedJson = await verifyToken(tokenKey, tokenSecret)

        const user = await findUser(decodedJson._id)

        req.user = user
        return next()
    } catch (error) {
        const refreshTokenKey = req.headers['x-refresh-token']
        if (refreshTokenKey){
            try {
                const decodedJson = await verifyToken(refreshTokenKey, refreshTokenSecret)

                const user = await findUser(decodedJson._id)

                const [newToken, newRefreshToken] = await Promise.all([
                    generateToken(user, tokenSecret, tokenLife),
                    generateToken(user, refreshTokenSecret, refreshTokenLife)
                ])
                res.set('x-access-token', newToken)
                res.set('x-refresh-token', newRefreshToken)

                req.user = user
                return next()
            } catch (err) {
                return res.status(403).json({
                    message: `Token error: ` + err
                })
            }
        }

        return res.status(403).json({
            message: `Token error: ` + error
        })
    }
}