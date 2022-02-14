const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
    status: {
        type: String,
        required: true,
        default: 'Pending'
    },
    category: {
        type: String,
        required: true,
    },
    deadline: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: false,
    },
    title: {
        type: String,
        required: true,
    },
    excerpt: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: true,
    },
    // camapaignId: {
    //     type: String,
    //     required: false,
    // },
    payments: [
        {
        paymentId: {
            type: String,
            },
        },
      ],
    targetPrice: {
        type: Number,
        required: true,
    },
    moreImages: [
        {
            type: String,
            required: false,
            max: 5000000000
        }
    ],
    documents: [{
        documentName: {
            type: String,
            required: true,
        },
        documentUrl: {
            type: String,
            required: true,
            max: 5000000000
        }
    },
    ],
    amount: {
        type: Number,
        required: true,
        default: 0
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
    campaignImage: {
        type: String,
        required: true,
        max: 5000000000
    },
}, {timestamps: true});

module.exports = mongoose.model('Campaigns', CampaignSchema);