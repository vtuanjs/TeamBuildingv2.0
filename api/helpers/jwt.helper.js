const jwt = require("jsonwebtoken");
/**
 * private function generateToken
 * @param user 
 * @param secretString 
 * @param tokenLife 
 */
module.exports.generateToken = (user, secretString, tokenLife) => {
    return new Promise((resolve, reject) => {
        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
        }

        jwt.sign(
            userData,
            secretString,
            {
                algorithm: "HS256",
                expiresIn: tokenLife,
            },
            (error, token) => {
                if (error) {
                    return reject(error)
                }
                resolve(token)
            })
    })
}
/**
 * This module used for verify jwt token
 * @param {*} token 
 * @param {*} secretKey 
 */
module.exports.verifyToken = (token, secretKey) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secretKey, (error, decoded) => {
            if (error) {
                return reject(error);
            }
            resolve(decoded);
        });
    });
}