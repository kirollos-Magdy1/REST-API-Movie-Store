const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { Movie, validateMovie } = require('../../../models/movies');
const { Seller, validateSeller } = require('../../../models/sellers');
const auth = require('../../auth')
const mongoose = require('mongoose');
const Fawn = require('fawn');

Fawn.init("mongodb://127.0.0.1:27017/movie-store");


// add movie
router.post('/:id', auth, async (req, res) => {
    const { error } = validateMovie(req.body);

    if (error)
        return res.status(500).send(error.details[0].message);

    let seller = await Seller.findById(req.params.id);
    if (!seller) {
        return res.status(400).send('seller does not exist');
    }

    let movie = new Movie({
        title: req.body.title,
        genre: req.body.genre,
        owner: req.params.id,
        price: req.body.price,
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    })

    try {
        new Fawn.Task()
            .update('sellers', { _id: seller._id }, {
                $push: { movies: movie }
            })
            .save('movies', movie)
            .run();

        res.send(movie);
    }
    catch (err) {
        res.status(500).send('Something failed. ' + err);
    }

    /*
    // seller.movies.push(movie);
        try {
            movie = await movie.save()
            seller = await seller.save();
            res.status(201).send(movie);
        } catch (err) {
            res.status(400).send('err ' + err)
        }
    */

})

// login
router.post('/login', async (req, res) => {
    const { error } = validateMovie(req.body);
    if (error)
        return res.status(500).send(error.details[0].message);

    let customer = undefined
    try {
        customer = await Customer.findOne({ email: req.body.email })
        if (!customer) {
            return res.status(400).send('Invalid email or password');
        }
    }
    catch (err) {
        res.status(400).send('err ' + err);
    }
    try {
        let validPassword = await bcrypt.compare(req.body.password, customer.password);

        if (!validPassword) {
            return res.status(400).send('Invalid email or password');
        }
    }
    catch (err) {
        res.status(400).send('err ' + err);
    }

    const token = customer.generateAuthToken();

    const customerInfo = {
        name: customer.name,
        email: customer.email,
        balance: customer.balance,
        age: customer.age,
        phone: customer.phone,
        isGold: customer.isGold,
        purchases: customer.purchases
    }
    res.header('x-auth-token', token).status(201).send(customerInfo);
})


router.delete('/remove/:id', auth, async (req, res) => {
    /*
    const { error } = validateCustomer(req.body);
    if (error)
        return res.status(500).send(error.details[0].message);
*/
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);
        if (!customer) {
            res.status(404).send('the customer with the given ID is notfound');
        }
        res.status(201).send(customer);
    } catch (err) {
        res.status(400).send('err ' + err);
    }

})
module.exports = router;
