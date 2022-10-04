const jwt = require('jsonwebtoken');
const {error} = require("./errorHandler")
const {User} = require("../models/userModel")

module.exports = async function checkAuth(req, res, next) {
    try {
        if (req.method === "OPTIONS") {
            next()
        }
        const token = req.header('Authorization')?.replace('Bearer ', '')?.trim();
        if (!token) {
            return next(error.unauthorized("No token"));
        }
        const decoded = jwt.verify(token, process.env.secret)
        console.log(decoded)
        const candidate = await User.findOne({where:{email:decoded.email}})
        if (!candidate) {
            return next(error.unauthorized("Corrupted token"));
        }
        next();
    } catch (e) {
        console.log(e);
        return next(error.unauthorized("Access denied for other reasons"));
    }
}