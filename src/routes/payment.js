const router = require("express").Router();
const Payment = require('../controllers/payment.js');

router.post('/payment', Payment.payment);
router.post('/success', Payment.success);
module.exports = router;

