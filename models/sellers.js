const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const { movieSchema } = require('../models/movies');
const sellereSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
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
        length: 4,
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
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        phone: Joi.string().required()
    })

    return schema.validate(seller);
}


module.exports = { Seller, validateSeller };
