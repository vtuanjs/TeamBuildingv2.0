const User = require('../controllers/user/user.model')
const redis = require('./redis')
const { verifyToken, generateToken } = require('../helpers/jwt.helper')
const tokenSecret = process.env.TOKEN_SECRET || 'secret3322'
const tokenLife = process.env.TOKEN_LIFE || 8640
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'secret3323332'
const redisLife = process.env.REDIS_LIFE


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
                const tokenFromRedis = await redis.get(refreshTokenKey)

                if (tokenFromRedis === tokenKey){
                    // Generate new token
                    const decodedJson = await verifyToken(refreshTokenKey, refreshTokenSecret)
                    const user = await findUser(decodedJson._id)
                    const newToken = await generateToken(user, tokenSecret, tokenLife)

                    res.set('x-access-token', newToken)

                    await redis.setex(refreshTokenKey, redisLife, newToken)
    
                    req.user = user
                    return next()
                } else {
                    throw 'Refresh Token Expires, Please Login'
                }
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