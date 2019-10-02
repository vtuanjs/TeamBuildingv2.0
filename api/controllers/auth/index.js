const User = require('../user/user.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const secretString = process.env.SECRET_STRING

module.exports.login = async (req, res, next) => {
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

        let encryptedPassword = foundUser.password
        let checkPassword = await bcrypt.compare(password, encryptedPassword)

        if (checkPassword) {
            let jsonObject = {
                id: foundUser._id
            }

            let tokenKey = await jwt.sign(
                jsonObject,
                secretString,
                {
                    expiresIn: 86400
                }
            )

            //Return user infomation with token key
            let userObject = foundUser.toObject()
            userObject.tokenKey = tokenKey

            return res.json({
                user: userObject
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