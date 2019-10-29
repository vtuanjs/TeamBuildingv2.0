const User = require('../user/user.model')
const bcrypt = require('bcrypt')
const redis = require('../../middlewares/redis')
const tokenSecret = process.env.TOKEN_SECRET || 'secret3322'
const tokenLife = process.env.TOKEN_LIFE || 8640
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'secret3323332'
const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE || 86400
const { generateToken } = require('../../helpers/jwt.helper')

module.exports.login = async (req, res) => {
    const {
        email,
        password
    } = req.body
    try {
        const foundUser = await User.findOne({
            email: email.trim()
        })

        if (!foundUser) {
            throw "User does not exist"
        }
        if (foundUser.isBanned === 1) {
            throw "User is banned. Please contact your website admin"
        }

        const encryptedPassword = foundUser.password
        const checkPassword = await bcrypt.compare(password, encryptedPassword)

        if (checkPassword) {
            const [tokenKey, refreshTokenKey] = await Promise.all([
                generateToken(foundUser, tokenSecret, tokenLife),
                generateToken(foundUser, refreshTokenSecret, refreshTokenLife)
            ])

            return res.json({
                user: {
                    _id: foundUser._id,
                    name: foundUser.name,
                    avata: foundUser.avata,
                    tokenKey,
                    refreshTokenKey
                }
            })
        } else {
            throw "Wrong user or password"
        }
    } catch (error) {
        res.status(401).json({
            message: `Unauthorized ${error}`
        })
    }
}