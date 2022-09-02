const mongoose = require('mongoose');
const { movieSchema } = require('../models/movies');
const transactionSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    sellerId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    movie: {
        type: movieSchema
    },
    transactionDate: {
        type: Date,
        default: Date.now
    },
    dateReturned: {
        type: Date
    }
})

const Transaction = mongoose.model('transaction', transactionSchema);
/*
const validate = (transaction) => {
    const schema = Joi.object({
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required(),

    });

    return schema.validate(transaction);
}
*/
module.exports = { Transaction }; 
