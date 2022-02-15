const mongoose = require('mongoose');

const InvolvementSchema = new mongoose.Schema({
    emailId: {
        type: String,
        unique: false,
        required: [true, "Is required"],
        trim: true
    },
    role: {     
        type: String,
        required: true,
    },
    phoneNo: {
        type: String,
        required: false,
        max: 100
    },
    firstName: {
        type: String,
        required: [true, "Is required"],
        max: 100
    },
    lastName: {
        type: String,
        required: [true, "Is required"],
        max: 100
    },
    state: {
        type: String,
        required: false,
        max: 100
    },
    district: {
        type: String,
        required: false,
        max: 100
    },
    block: {
        type: String,
        required: false,
        max: 100
    },
    whatsappNumber: {
        type: String,
        required: false,
        max: 100
    },
    organisationName: {
        type: String,
        required: false,
        max: 100
    },
    curWork:{
        type: String,
        required: false,
    },
    profileImage: {
        type: String,
        required: false,
        max: 5000
    },
}, {timestamps: true});


module.exports = mongoose.model('Involvement', InvolvementSchema);