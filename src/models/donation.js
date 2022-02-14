const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
    role: {
        type: String,
        required: false,
    },
    userId: {
        type: String,
        required: false,
    },
    campaignId: {
        type: String,
        required: true,
    },
    emailId: {
        type: String,
        required: false,
    },
    name: {
        type: String,
        required: false,
    },
    amount: {
        type: Number,
        required: true,
    },
    phoneNo: {
        type: String,
        required: false,
        max: 100
    },
    firstName: {
        type: String,
        required: false,
        max: 100
    },
    lastName: {
        type: String,
        required: false,
        max: 100
    },
    address: {
        type: String,
        required: false,
    },
    profileImage: {
        type: String,
        required: false,
        max: 5000
    },
}, {timestamps: true});

module.exports = mongoose.model('Donations', DonationSchema);