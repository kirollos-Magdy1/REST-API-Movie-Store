const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Fawn = require('fawn');
const { Movie, validateMovie, validatePurchaseMovie } = require('../../../models/movies');
const { Customer, validateCustomer, customerSchema } = require('../../../models/customers');
const { Seller, validateSeller } = require('../../../models/sellers');
const { Transaction } = require('../../../models/transactions');
const auth = require('../../auth')
const mongoose = require('mongoose');

// view all movies
router.get('/', async (req, res) => {
    try {
        const movies = await Movie.find({ numberInStock: { $gt: 0 } }).sort('title price');
        res.send(movies);
    }
    catch (err) {
        res.status(404).send(err);
    }
})


// purchase a movie
router.post('/:id', auth, async (req, res) => {
    let movie, customer, seller

    const { error } = validatePurchaseMovie(req.body);

    if (error)
        return res.status(500).send(error.details[0].message);

    try {
        movie = await Movie.findById(req.body.movieId);
        if (!movie) {
            return res.status(400).send('movie is not found');
        }
        customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(400).send('user is not found');
        }
        seller = await Seller.findById(movie.owner);
    }
    catch (err) {
        res.status(400).send('err ' + err)
    }

    if (customer.balance < movie.price)
        return res.status(500).send('Not enough money');
    if (movie.numberInStock === 0)
        return res.status(500).send('movie is out of the stock');

    let transaction = new Transaction({
        customerId: customer._id,
        sellerId: seller._id,
        movie: movie,
        transactionDate: new Date()
    })


    let movieIdx = undefined;
    for (let i = 0; i < seller.movies.length; i++) {
        if (seller.movies[i]._id == req.body.movieId) {
            console.log(seller.movies[i]._id, req.body.movieId, i);
            movieIdx = i;
            break;
        }
    }

    let sellerCpy = undefined;
    try {
        sellerCpy = await Seller.findById(movie.owner);
    } catch (err) {
        res.status(400).send('err ' + err)
    }

    console.log(sellerCpy);
    sellerCpy.movies[movieIdx].numberInStock--;

    try {
        await Seller.findByIdAndDelete(seller._id)
    } catch (err) {
        res.status(400).send('err ' + err)
    }


    try {
        new Fawn.Task()

            .update('customers', { _id: customer._id }, {
                $inc: { balance: -movie.price },
                $push: { purchases: movie }
            }, { new: true })

            .save('sellers', sellerCpy)
            .update('movies', { _id: movie._id }, {
                $inc: { numberInStock: -1 }
            })
            .save('transactions', transaction)

            .run();

        res.send(transaction);
    }
    catch (err) {
        res.status(500).send('Something failed. ' + err);
    }

})


module.exports = router;
