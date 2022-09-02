const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const { movieSchema } = require('../models/movies');
const sellereSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String
    },
    phone: {
        type: String,
        require: true
    },
    isVerified: {
        type: Boolean,
        default: true
    },
    movies: {
        type: [movieSchema]
    },
    loggedIn: {
        type: Boolean,
        default: false
    }
})

sellereSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.jwtPrivateKey);
    return token;
}


const Seller = mongoose.model('sellers', sellereSchema);

const validateSeller = (seller) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(15).required(),
        email: Joi.string().max(25).email().required(),
        password: Joi.string().min(8).max(30).required(),
        phone: Joi.string().length(4).required()
    })

    return schema.validate(seller);
}

const validateUpdatedSeller = (seller) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(15),
        email: Joi.string().email().max(25),
        phone: Joi.string().length(4)
    })

    return schema.validate(seller);
}


module.exports = { Seller, validateSeller, validateUpdatedSeller };
