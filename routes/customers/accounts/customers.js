const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { Customer, validateCustomer, validateUpdatedCustomer } = require('../../../models/customers');
const auth = require('../../auth')
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
    try {
        const customers = await Customer.find().select('name email age isGold');
        res.send(customers);
    }
    catch (err) {
        res.status(404).send(err);
    }
})


// signup
router.post('/', async (req, res) => {

    const { error } = validateCustomer(req.body);

    if (error)
        return res.status(500).send(error.details[0].message);

    let customer = await Customer.findOne({ email: req.body.email })
    if (customer) {
        return res.status(400).send('user already exists');
    }
    customer = new Customer({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        age: req.body.age,
        phone: req.body.phone,
        balance: req.body.balance,
        isGold: req.body.isGold
    })

    const salt = await bcrypt.genSalt(10);
    customer.password = await bcrypt.hash(customer.password, salt);

    try {
        const token = customer.generateAuthToken();
        customer.loggedIn = true;
        customer = await customer.save();
        res.header('x-auth-token', token).status(201).send({ name: customer.name, email: customer.email, _id: customer._id });
    } catch (err) {
        res.status(400).send('err ' + err)
    }
})

// login
router.post('/login', async (req, res) => {

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
        id: customer._id,
        email: customer.email,
        balance: customer.balance,
        age: customer.age,
        phone: customer.phone,
        isGold: customer.isGold,
        purchases: customer.purchases
    }
    res.header('x-auth-token', token).status(201).send(customerInfo);
})

router.patch('/edit/:id', auth, async (req, res) => {
    const { error } = validateUpdatedCustomer(req.body);

    if (error)
        return res.status(500).send(error.details[0].message);

    try {
        let customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).send('the customer with the given ID is notfound');
        }
        customer = await Customer.updateOne({ _id: req.params.id }, {
            $set: {
                name: req.body.name || customer.name,
                email: req.body.email || customer.email,
                balance: req.body.balance || customer.balance,
                age: req.body.age || customer.age,
                phone: req.body.phone || customer.phone,
                isGold: req.body.isGold || customer.isGold
            }
        })

        res.status(201).send(customer);
    } catch (err) {
        res.status(400).send('err ' + err);
    }
})

router.delete('/remove/:id', auth, async (req, res) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);
        if (!customer) {
            return res.status(404).send('the customer with the given ID is notfound');
        }
        const customerInfo = {
            name: customer.name,
            id: customer._id,
            email: customer.email,
            balance: customer.balance,
            age: customer.age,
            phone: customer.phone,
            isGold: customer.isGold,
            purchases: customer.purchases
        }
        res.status(201).send(customerInfo);
    } catch (err) {
        res.status(400).send('err ' + err);
    }

})
module.exports = router;
