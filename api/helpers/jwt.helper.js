const jwt = require("jsonwebtoken");

/**
 * private function generateToken
 * @param user 
 * @param secretString 
 * @param tokenLife 
 */
const generateToken = (user, secretString, tokenLife) => {
    return new Promise((resolve, reject) => {
        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email
        }

        jwt.sign(
            userData,
            secretString,
            {
                algorithm: "HS256",
                expiresIn: tokenLife,
            },
            (error, tokenKey) => {
                if (error) {
                    return reject(error)
                }
                resolve(tokenKey)
            })
    })
}
/**
 * This module used for verify jwt token
 * @param {*} token 
 * @param {*} secretString 
 */
const verifyToken = (tokenKey, secretString) => {
    return new Promise((resolve, reject) => {
        jwt.verify(tokenKey, secretString, (error, decoded) => {
            if (error) {
                return reject(error);
            }

            resolve(decoded);
        })
    })
}

module.exports = {
    generateToken,
    verifyToken
}