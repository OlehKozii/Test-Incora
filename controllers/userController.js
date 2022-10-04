const argon2 = require("argon2")

const {generateAccessToken, generateRefreshToken, verifyToken} = require("../service/jwt")
const {User, Token, Code} = require("../models/userModel")
const {error} = require("../middleware/errorHandler")
const mailer = require("../service/nodeMailer")


class userController{

    async register(req, res, next){
        try {
            const {email, phone, first_name, last_name, password} = req.body
            if(!email || !phone || !first_name || !password){
                return next(error.badRequest("No data entered!"))
            }
            if(await User.findOne({where:{email}}) || await User.findOne({where:{phone}})){
                return next(error.badRequest("Such user already exist"))
            }
            const hashPassword = await argon2.hash(password)
            const candidate = await User.create(
                {
                    email: email, 
                    phone: phone, 
                    first_name: first_name, 
                    last_name: last_name, 
                    password: hashPassword 
                }
            )
            await Code.create({
                id:candidate.id
            })
            const token = await Token.create({
                id:candidate.id
            })
            const access_token = generateAccessToken(candidate.id, candidate.email, candidate.first_name)
            const refresh_token = generateRefreshToken(candidate.id)
            await token.update({refresh_token})
            res.cookie('refresh_token', refresh_token, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.send({"access_token":access_token})
        } 
        catch (err) {
            console.log(err)
            return next(error.badRequest("You entered bad data!"))
        }
    }

    async login(req, res, next){
        try {
            const {email, password} = req.body
            const candidate = await User.findOne({where:{email}})
            if(!candidate){
                return next(error.notFound("Such user doesnt exist"))
            }
            if(!await argon2.verify(candidate.password, password)){
                return next(error.forbidden("Password doest match"))
            }
            const token = await Token.findOne({where:{id:candidate.id}})
            const access_token = generateAccessToken(candidate.id, candidate.email, candidate.first_name)
            const refresh_token = generateRefreshToken(candidate.id)
            await token.update({refresh_token})
            res.cookie('refresh_token', refresh_token, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.send({"access_token":access_token})

        } catch (err) {
            console.log(err)
        }
    }

    async getOne(req, res, next){
        try {
            const id = req.params.id
            const candidate = await User.findOne({where:{id}, attributes: ['id', 'email', 'phone', 'first_name', 'last_name']})
            if(!candidate){
                return next(error.notFound("Such user doesnt exist"))
            }
            return res.send(candidate)
            
        } catch (err) {
            console.log(err)
        }
    }

    async refresh(req, res, next){
        try {
            const {refresh_token} = req.cookies;
            const {id}= req.body
            const dbtoken = await Token.findOne({where:{id}})
            const candidate = await User.findOne({where:{id}})
            if(refresh_token!==dbtoken.refresh_token || !dbtoken){
                // res.clearCookie('refresh_token');
                console.log(dbtoken.refresh_token)
                return next(error.notFound("Wrong data"))
            }
            const access_token = generateAccessToken(candidate.id, candidate.email, candidate.first_name)
            const newrefresh_token = generateRefreshToken(candidate.id)
            await dbtoken.update({refresh_token:newrefresh_token})
            res.cookie('refresh_token', newrefresh_token, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.send({"access_token":access_token})

        } catch (err) {
            console.log(err)
        }
    }

    async getCode(req, res, next){
        try {
            const id = req.params.id
            const {password} = req.body
            const candidate = await User.findOne({where:{id}})
            if(!candidate){
                return next(error.notFound("Such user doesnt exist"))
            }
            if(!password){
                return next(error.forbidden("No password entered"))
            }
            if(!await argon2.verify(candidate.password, password)){
                return next(error.forbidden("Password doest match"))
            }
            mailer(id, candidate.email)
            return res.send("Check your email")
        } catch (err) {
            
        }
    }

    async update(req, res, next){
        try {
            const {id, email, phone, first_name, last_name, password, newPassword, confcode} = req.body
            if(!confcode){
                return res.send("You didnt enter confirmation code")
            }
            if(!email && !phone && !first_name && !newPassword && !last_name){
                return next(error.badRequest("No data entered!"))
            }
            const candidate = await User.findOne({where:{id}})
            if(!await argon2.verify(candidate.password, password)){
                return next(error.forbidden("Password doest match"))
            }
            const code = await Code.findOne({where:{id:candidate.id}})
            if(confcode!=code.confirmationCode || code.used===true){
                return res.send("Wrong code. Access denied!")
            }
            await code.update({used:true})
            if(phone) await candidate.update({phone})
            if(first_name) await candidate.update({first_name})
            if(last_name) await candidate.update({last_name})
            if(newPassword){
                const hashPassword = await argon2.hash(password)
                await candidate.update({password:hashPassword})
            } 
            return res.send(candidate)
        } 
        catch (err) {
            console.log(err)
            return next(error.badRequest("You entered bad data!"))
        }
    }
}

module.exports = new userController()