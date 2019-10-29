const jwt = require("jsonwebtoken");

/**
 * private function generateToken
 * @param user 
 * @param secretString 
 * @param tokenLife 
 */
const generateToken = (user, secretString, tokenLife) => {
    const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
    }
    return jwt.sign(
        userData,
        secretString,
        {
            algorithm: "HS256",
            expiresIn: tokenLife,
        }
    )
}
/**
 * This module used for verify jwt token
 * @param {*} token 
 * @param {*} secretString 
 */
const verifyToken = (tokenKey, secretString) => {
    return jwt.verify(tokenKey, secretString)
}

module.exports = {
    generateToken,
    verifyToken
}