const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const jwt = require('jsonwebtoken');
const { object } = require('joi');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    genere: {
        type: String,
    },
    owner: {
        type: mongoose.Types.ObjectId
    },
    price: { type: Number, min: 0 },
    numberInStock: { type: Number, min: 0 },
    dailyRentalRate: { type: Number, min: 0 }
})


const Movie = mongoose.model('movies', movieSchema);

const validateMovie = (movie) => {
    const schema = Joi.object({
        title: Joi.string().min(3).max(20).required(),
        genre: Joi.string().min(3).max(15).required(),
        price: Joi.number().required().max(1000),
        numberInStock: Joi.number().required().min(0),
        dailyRentalRate: Joi.number().min(0)
    })

    return schema.validate(movie);
}

const validatePurchaseMovie = (movie) => {
    const schema = Joi.object({
        movieId: Joi.objectId().required()
    })

    return schema.validate(movie);
}

module.exports = { Movie, validateMovie, validatePurchaseMovie, movieSchema };
