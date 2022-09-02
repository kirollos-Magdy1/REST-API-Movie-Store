const jwt = require('jsonwebtoken');
const ObjectId = require('mongoose').Types.ObjectId;

module.exports = function (req, res, next) {
    process.on('uncaughtException', (ex) => {
        return res.status(401).send('ex ' + ex);

    })

    const token = req.header('x-auth-token');
    if (!token)
        return res.status(401).send('Access denied. No token provided');
    jwt.verify(token, process.env.jwtPrivateKey, (err, decoded) => {

        if ((err) || (decoded._id !== req.params.id))
            return res.status(404).send('Invalid token or id ' + err);

        next();
    })
}

