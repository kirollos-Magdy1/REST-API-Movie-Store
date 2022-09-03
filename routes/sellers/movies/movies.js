const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { Movie, validateMovie, validatePurchaseMovie } = require('../../../models/movies');
const { Seller, validateSeller } = require('../../../models/sellers');
const auth = require('../../auth')
var ObjectId = require('mongoose').Types.ObjectId;
const mongoose = require('mongoose');
const Fawn = require('fawn');
const { validateUpdatedCustomer } = require('../../../models/customers');


Fawn.init(process.env.mongodbUrl);


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

})


module.exports = router;
