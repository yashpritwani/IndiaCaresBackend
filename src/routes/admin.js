const express = require('express');
const User = require('../controllers/user');
const Admin = require('../controllers/admin');
const router = express.Router();

router.get('/', User.index);

router.get('/:id',  User.show);

router.put('/campaignStatus', Admin.updateStatus);

router.put('/editCampaign/:id', Admin.updateCampaign);

router.post('/raiseQuery/:id', Admin.raiseQuery);

router.delete('/deleteUser/:id', Admin.deleteUser);

router.delete('/deleteCampaign/:id', Admin.deleteCampaign);

router.put('/upgrade/:id', Admin.upgradeUser);

module.exports = router;