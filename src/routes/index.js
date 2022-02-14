const auth = require('./auth');
const user = require('./user');
const authenticate = require('../middlewares/authenticate');
const admin = require('./admin');
const campaign = require('./campaign')
const payment = require('./payment')

module.exports = app => {
    app.get('/', (req, res) => {
        res.status(200).send({ message: "Sahi kam kar raha hai sab."});
    });
    app.use('/auth', auth);
    app.use('/user', user);
    app.use('/admin', admin);
    app.use('/campaign', campaign);
    app.use('/payment', payment);
};