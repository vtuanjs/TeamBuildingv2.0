const User = require('../user/user.model')
const bcrypt = require('bcrypt')
const redis = require('../../middlewares/redis')
const secretString = process.env.TOKEN_SECRET
const tokenLife = process.env.TOKEN_LIFE
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
            const tokenKey = await generateToken(foundUser, secretString, tokenLife)

            return res.json({
                user: { tokenKey }
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