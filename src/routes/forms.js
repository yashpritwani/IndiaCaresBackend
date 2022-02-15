const router = require("express").Router();
const Forms = require('../controllers/forms.js');

router.post('/contact', Forms.contact);
router.post('/involvement', Forms.involvement);
router.post('/rti', Forms.rti);

module.exports = router;