const express = require('express');
const {check} = require('express-validator');
const multer = require('multer');
const User = require('../controllers/user');
const validate = require('../middlewares/validate');
const router = express.Router();
const upload = multer().single('profileImage');

router.get('/', User.index);

router.get('/:id',  User.show);

router.put('/:id', upload, User.updateDetails);

router.delete('/:id', User.destroy);
router.post('/showUser',  User.showUserId);
router.post("/getImage", User.getUrl);

router.post("/createCampaign", User.createCampaign);

router.put('/updateCampaign/:id', User.updateCampaign);

router.delete('/deleteCampaign', User.deleteCampaign);

module.exports = router;