const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { Seller, validateSeller, validateUpdatedSeller } = require('../../../models/sellers');
const auth = require('../../auth')
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
    try {
        const sellers = await Seller.find().select('name age isGold');
        res.send(sellers);
    }
    catch (err) {
        res.status(404).send(err);
    }
})


// signup
router.post('/', async (req, res) => {
    const { error } = validateSeller(req.body);

    if (error)
        return res.status(500).send(error.details[0].message);

    let seller = await Seller.findOne({ email: req.body.email })
    if (seller) {
        return res.status(400).send('user already exists');
    }
    seller = new Seller({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        phone: req.body.phone
    })

    const salt = await bcrypt.genSalt(10);
    seller.password = await bcrypt.hash(seller.password, salt);

    try {
        const token = seller.generateAuthToken();
        seller.loggedIn = true;
        seller = await seller.save();
        res.header('x-auth-token', token).status(201).send({ name: seller.name, email: seller.email, _id: seller._id });
    } catch (err) {
        res.status(400).send('err ' + err)
    }

})

// login
router.post('/login', async (req, res) => {

    let seller = undefined
    try {
        seller = await Seller.findOne({ email: req.body.email })
        if (!seller) {
            return res.status(400).send('Invalid email or password');
        }
    }
    catch (err) {
        res.status(400).send('err ' + err);
    }
    try {
        let validPassword = await bcrypt.compare(req.body.password, seller.password);

        if (!validPassword) {
            return res.status(400).send('Invalid email or password');
        }
    }
    catch (err) {
        res.status(400).send('err ' + err);
    }

    const token = seller.generateAuthToken();

    const sellerInfo = {
        name: seller.name,
        email: seller.email,
        id: seller._id,
        phone: seller.phone,
        movies: seller.movies
    }
    res.header('x-auth-token', token).status(201).send(sellerInfo);
})

router.patch('/edit/:id', auth, async (req, res) => {
    const { error } = validateUpdatedSeller(req.body);

    if (error)
        return res.status(500).send(error.details[0].message);

    try {
        let seller = await Seller.findById(req.params.id);
        if (!seller) {
            return res.status(404).send('the customer with the given ID is notfound');
        }
        seller = await Seller.updateOne({ _id: req.params.id }, {
            $set: {
                name: req.body.name || seller.name,
                email: req.body.email || seller.email,
                phone: req.body.phone || seller.phone,
            }
        })

        res.status(201).send(seller);
    } catch (err) {
        res.status(400).send('err ' + err);
    }
})

router.delete('/remove/:id', auth, async (req, res) => {
    try {
        const seller = await Seller.findByIdAndDelete(req.params.id);
        if (!seller) {
            return res.status(404).send('the seller with the given ID is not found');
        }
        const sellerInfo = {
            name: seller.name,
            id: seller._id,
            email: seller.email,
            phone: seller.phone,
            movies: seller.movies
        }
        res.status(201).send(sellerInfo);
    } catch (err) {
        res.status(400).send('err ' + err);
    }

})
module.exports = router;
