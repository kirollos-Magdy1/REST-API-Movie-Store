const customers = require('./routes/customers/accounts/customers');
const sellers = require('./routes/sellers/accounts/sellers');

const sallerMovies = require('./routes/sellers/movies/movies');
const customerMovies = require('./routes/customers/movies/movies');

const transactions = require('./routes/transactions/transactions');

const morgan = require('morgan');
const helmet = require('helmet');
const { json } = require('express');
const express = require('express');
const app = express();

const mongoose = require('mongoose');

console.log(process.env.mongodbUrl);

mongoose.connect(process.env.mongodbUrl)
    .then(() => console.log('connected to mongodb'))
    .catch((err) => console.log('Couldn\'t connect error ' + err))

const port = process.env.PORT || 3000;



app.use(express.json()) // parse the req.body
app.use(express.urlencoded({ extended: true }))   // for form key & value
app.use(morgan('tiny'))
app.use(helmet())
console.log(app.get('env'));


// customer account
app.use('/api/customers/accounts', customers);
app.use('/api/customers/accounts/login', customers);
app.use('/api/customers/accounts/remove', customers);
app.use('/api/customers/accounts/edit', customers);

// customer movies
app.use('/api/customers/movies', customerMovies);

// seller account
app.use('/api/sellers/accounts', sellers);
app.use('/api/sellers/accounts/login', sellers);
app.use('/api/sellers/accounts/edit', sellers);

// seller movies
app.use('/api/sellers/movies', sallerMovies);


// transactions
app.use('/api/transactions', transactions);


app.listen(port, () => console.log('run on port ' + port));

