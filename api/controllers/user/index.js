'use strict'
const bcrypt = require('bcrypt')
const User = require('./user.model')

const validatePassword = (password) => {
    const pwdRegex = new RegExp('^(?=.*[a-z])(?=.*[0-9])(?=.{8,})')
    return password.match(pwdRegex)
}

const encryptedPassword = (password) => {
    return bcrypt.hash(password, 10) //saltRounds = 10
}

module.exports.postUser = async (req, res, next) => {
    const {
        name,
        email,
        password
    } = req.body
    try {
        if (!validatePassword(password)) {
            throw "Password must be eight characters or longer, must contain at least 1 numeric character, 1 lowercase charater"
        }

        const encryptedPwd = await encryptedPassword(password)

        const user = await User.create({
            name,
            email,
            password: encryptedPwd
        })

        return res.json({
            message: `Create user ${user.name} successfully!`,
            user
        })
    } catch (error) {
        if (error.code === 11000) error = "Email already exists"
        next(error)
    }
}

const isAdminExist = () => {
    return User.findOne({
        role: "admin"
    })
}

module.exports.postAdmin = async (req, res, next) => {
    const {
        name,
        email,
        password
    } = req.body
    try {
        if (await isAdminExist()) {
            throw "This function only use one time!"
        }
        if (!validatePassword(password)) {
            throw "Password must be eight characters or longer, must contain at least 1 numeric character, 1 lowercase charater"
        }

        const encryptedPwd = await encryptedPassword(password)

        const user = await User.create({
            name,
            email,
            role: "admin",
            password: encryptedPwd
        })

        return res.json({
            message: `Create admin ${user.name} successfully!`,
            user
        })
    } catch (error) {
        next(error)
    }
}

const comparePassword = (oldPassword, password) => {
    return bcrypt.compare(oldPassword, password)
}

module.exports.updateUser = async (req, res, next) => {
    let {
        name,
        gender,
        phone,
        address,
        password,
        oldPassword
    } = req.body
    const userId = req.params.userId
    try {
        const user = await User.findById(userId)

        if (password) {
            if (!validatePassword(password)) {
                throw "Password must be eight characters or longer, must contain at least 1 numeric character, 1 lowercase charater"
            }

            const comparePwd = await comparePassword(oldPassword, user.password)
            if (!comparePwd) {
                throw "Old password wrong"
            } else {
                password = await encryptedPassword(password)
            }
        }

        const query = {
            ...(name && {
                name
            }),
            ...(gender && {
                gender
            }),
            ...(phone && {
                phone
            }),
            ...(address && {
                address
            }),
            ...(password && {
                password
            }),
        }

        Object.assign(user, query)

        await user.save()

        return res.json({
            message: `Update user with ID: ${user._id} succesfully!`,
            user
        })
    } catch (error) {
        next("Update error: " + error)
    }
}

const getArrayUsers = (userIds) => {
    return userIds.split(',').map(item => {
        return item.trim()
    })
}

const setIsBannedUsers = (userIds, status) => {
    return User.updateMany({
        _id: {
            $in: userIds
        },
        role: {
            $ne: 'admin'
        }
    }, {
        $set: {
            isBanned: status
        }
    })
}

module.exports.blockUsers = async (req, res, next) => {
    const {
        userIds
    } = req.params
    try {
        const arrayUserIds = getArrayUsers(userIds)

        const raw = await setIsBannedUsers(arrayUserIds, 1)

        return res.json({
            message: "Block users successfully!",
            raw
        })
    } catch (error) {
        next(error)
    }
}

module.exports.unlockUsers = async (req, res, next) => {
    const {
        userIds
    } = req.params
    try {
        const arrayUserIds = getArrayUsers(userIds)

        const raw = await setIsBannedUsers(arrayUserIds, 0)

        return res.json({
            message: "Unlock users successfully!",
            raw
        })
    } catch (error) {
        next(error)
    }
}

module.exports.deleteUser = async (req, res, next) => {
    const {
        userId
    } = req.params
    try {
        const raw = await User.deleteOne({
            _id: userId,
            role: {
                $ne: 'admin'
            }
        })

        return res.json({
            message: "Delete user successfully!",
            raw
        })
    } catch (error) {
        next(error)
    }
}

module.exports.getByEmail = async (req, res, next) => {
    const {
        email
    } = req.params
    try {
        const emailFormated = email.trim().toLowerCase()

        const foundUser = await User
            .findOne({
                email: emailFormated
            })
            .select("name email")

        if (!foundUser) throw "Can not find user with email"

        return res.json({
            user: foundUser
        })
    } catch (error) {
        next(error)
    }
}

module.exports.getUser = async (req, res, next) => {
    const userId = req.params.userId
    try {
        const foundUser = await User.findById(userId)
            .select("-password")

        if (!foundUser) throw "User is not exist"

        return res.json({
            user: foundUser
        })
    } catch (error) {
        next(error)
    }
}

module.exports.getUsers = async (_req, res, next) => {
    try {
        const foundUsers = await User.find().select("name email createdAt")

        if (!foundUsers) throw "Can not show list of users"

        return res.json({
            users: foundUsers
        })
    } catch (error) {
        next(error)
    }
}