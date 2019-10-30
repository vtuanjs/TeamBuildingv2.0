const bcrypt = require('bcrypt')
const publicIp = require('public-ip')
const geoip = require('geoip-lite')
const User = require('../user/user.model')
const redis = require('../../middlewares/redis')
const tokenSecret = process.env.TOKEN_SECRET || 'secret3322'
const tokenLife = process.env.TOKEN_LIFE || 8640
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'secret3323332'
const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE || 86400
const redisLife = process.env.REDIS_LIFE || 600000
const { generateToken } = require('../../helpers/jwt.helper')

module.exports.login = async (req, res) => {
    const {
        email,
        password
    } = req.body
    try {
        let foundUser = await User.findOne({
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

            // Find location signed in user and save to database user
            const ip = await publicIp.v4()
            const geo = geoip.lookup(ip)

            foundUser.signedDevice.push({
                ip,
                refreshTokenKey,
                location: {
                    ...geo
                }
            })

            // Save token key to redis cache and save location infomation user login
            await Promise.all([
                redis.setex(refreshTokenKey, redisLife, tokenKey),
                foundUser.save()
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

const pullSignedDeviceByTokens = (userId, tokens) => {
    // Convert token
    if (typeof tokens === 'string') {
        tokens = [tokens]
    }

    return User.findByIdAndUpdate(userId, {
        $pull: {
            signedDevice: {
                refreshTokenKey: {
                    $in: tokens
                }
            }
        }
    })
}

module.exports.logout = async (req, res, next) => {
    const refreshTokenKey = req.headers['x-refresh-token']
    const user = req.user
    try {
        await Promise.all([
            pullSignedDeviceByTokens(user._id, refreshTokenKey),
            redis.del(refreshTokenKey)
        ])

        return res.json({ message: 'Log out success' })
    } catch (error) {
        next(error)
    }
}

const splitTokenKeys = (tokenKeys) => {
    // Check token keys is array or string
    // If token keys is string, convert it to array
    if (typeof tokenKeys === 'string') {
        return tokenKeys.split(',').map(item => {
            return item.trim()
        })
    } else {
        return tokenKeys
    }
}

/**
 * Fource - Logout user in multi device
 */
module.exports.forceLogout = async (req, res, next) => {
    // Force logout by array of refresh token keys
    const signedInUser = req.user
    const tokenKeys = req.body.refreshTokenKeys

    try {
        const arrayTokens = splitTokenKeys(tokenKeys)
        if (arrayTokens.length === 0) {
            throw 'Can not find any refresh token key'
        }

        await Promise.all([
            pullSignedDeviceByTokens(signedInUser._id, arrayTokens),
            redis.del(arrayTokens)
        ])

        return res.json({
            message: 'Force logout success'
        })
    } catch (error) {
        next(error)
    }
}