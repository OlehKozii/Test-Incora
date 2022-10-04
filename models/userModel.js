const sequelize = require('../database')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull:false,},
    first_name: {
        type: DataTypes.STRING, 
        allowNull:false,
        validate: {
            isAlpha:true
            // validatename: function(value) {
            //     if(!/^[a-zA-Z]+$/.test(value)) {
            //         throw new Error('First name is incorrect')
            //     }
            // }   
        }
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull:true,
        validate: {
            isAlpha:true
            // validatename: function(value) {
            //     if(!/^[a-zA-Z]+$/.test(value)) {
            //         throw new Error('First name is incorrect')
            //     }
            // }   
        }
    },
    email: {
        type: DataTypes.STRING, 
        unique: true, 
        allowNull:false,
        validate: {
            isEmail:true
            // validatename: function(value) {
            //     if(!/^[a-zA-Z0-9_.+]*[a-zA-Z][a-zA-Z0-9_.+]*@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(value)) {
            //         throw new Error('Email is incorrect')
            //     }
            // }   
        }
    },
    phone: {
        type: DataTypes.STRING, 
        unique: true, 
        allowNull:false,
        validate: {
            isNumeric:true,
            validatename: function(value) {
                if(!/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(value)) {
                    throw new Error('Phone number is incorrect')
                }
            }   
        }
    },
    password: {type: DataTypes.STRING, allowNull:false},
})

const Token = sequelize.define('token', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    refresh_token: {type: DataTypes.STRING},
})

const Code = sequelize.define('code', {
    id: {type: DataTypes.INTEGER, primaryKey: true, allowNull:false},
    confirmationCode: {type: DataTypes.STRING},
    used: {type: DataTypes.BOOLEAN}
})


module.exports = {
    User,
    Token,
    Code
}
