const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Transaction } = require('../../models/transactions');

router.get('/', async (req, res) => {
    try {
        const transactions = await Transaction.find().sort('transactionDates');
        res.send(transactions);
    }
    catch (err) {
        res.status(404).send('err ' + err);
    }
})

module.exports = router;
