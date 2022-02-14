const express = require('express');
const Campaign = require('../controllers/campaign');
const router = express.Router();

router.get('/getAllCampaigns',  Campaign.showAll);
router.get("/getActiveCampaigns", Campaign.activeCampaign);
router.get("/getPendingCampaigns", Campaign.pendingCampaign);

router.get('/getUserCampaigns/:id',  Campaign.show);
router.post("/showDonors", Campaign.showPaidUsers);

router.get('/showCampaign/:id',  Campaign.showCampaign);

// router.get('/getFilteredCampaigns',  Campaign.filter);

router.post('/getSearchedCampaign',  Campaign.completeFilter);
router.get('/getCity',  Campaign.city);
router.post('/getFilteredCampaigns',  Campaign.filter);
router.post("/locationFilter", Campaign.location);

// router.get('/getRecentCampaigns',  Campaign.recent);

// router.get('/getPopularCampaigns',  Campaign.popular);

// router.get('/getUnpaidCampaigns',  Campaign.unpaid);

// router.get('/getMostPaidCampaigns',  Campaign.paid);

module.exports = router;