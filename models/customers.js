const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const { movieSchema } = require('../models/movies');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    phone: {
        type: String,
        length: 4,
        require: true
    },
    balance: {
        type: Number,
        default: 1200,
        max: 5000
    },
    isGold: {
        type: Boolean,
        default: false
    },
    purchases: {
        type: [movieSchema],

    }
})

customerSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.jwtPrivateKey);
    return token;
}


const Customer = mongoose.model('customers', customerSchema);

const validateCustomer = (customer) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(15).required(),
        password: Joi.string().min(4).required(),
        email: Joi.string().email().required(),
        phone: Joi.string().required(),
        age: Joi.number().min(16).max(99).required(),
        balance: Joi.number().max(5000),
        isGold: Joi.boolean()
    })

    return schema.validate(customer);
}

const validateUpdatedCustomer = (customer) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(10),
        email: Joi.string().email().max(25),
        phone: Joi.string().length(4),
        age: Joi.number().min(16).max(99),
        balance: Joi.number().max(5000),
        isGold: Joi.boolean()
    })

    return schema.validate(customer);
}


module.exports = { Customer, validateCustomer, validateUpdatedCustomer, customerSchema };
