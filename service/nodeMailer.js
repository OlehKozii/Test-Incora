const nodemailer = require("nodemailer")
const {Code} = require("../models/userModel")

const transporter = nodemailer.createTransport(
    {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        // Пожалуйста, используйте свой собственный gmail аккаунт для рассылки
        auth: {
            user: 'levasmanager@gmail.com', // (замените звездочики на название вашего почтового ящика gmail) 
            pass: 'vnhvisunysiaqiqr' // (замените звездочики на название вашего почтового ящика) 
        }
    },
    {
        from: 'Levas Levas <levasmanager@gmail.com>' // (замените звездочики на название вашего почтового ящика gmail) 
    }
)

const mailer = async (id, email) => {
    const pin=Math.floor(100000 + Math.random() * 900000)
    const code = await Code.findOne({where:{id}})
    await code.update({confirmationCode:pin, used:false})
    const message = {
        to: `${email}`,
        subject: 'Ваш код',
        html: `
        <h1><b>${pin}</b></h1>
                    
        <p>Дане повідомлення не потребує відповіді.<p>`
    }
    transporter.sendMail(message, (err, info) => {
        if (err) return console.log(err)
        console.log('Email sent: ', info)
    })
}

module.exports = mailer