require('dotenv').config({path:"../.env"})
const jwt = require("jsonwebtoken")

const generateAccessToken = (id, email, first_name) => {
    return jwt.sign(
        { id, email, first_name},
        process.env.secret,
        { expiresIn: 60 * 60 }
    )
}

const generateRefreshToken = (id) => {
    return jwt.sign(
        {id},
        process.env.secret,
        { expiresIn: 7 * 24 * 60 * 60 }
    )
}

const verifyToken = (token) => {
    return jwt.verify(token, process.env.secret)
}

module.exports = {generateAccessToken, generateRefreshToken, verifyToken}