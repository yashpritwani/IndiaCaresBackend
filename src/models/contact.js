const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    emailId: {
        type: String,
        unique: false,
        required: [true, "Is required"],
        trim: true
    },
    phoneNo: {
        type: String,
        required: false,
        max: 100
    },
    name: {
        type: String,
        required: [true, "Is required"],
        max: 100
    },
    query: {
        type: String,
        required: false,
        max: 500000
    },
}, {timestamps: true});


module.exports = mongoose.model('Contact', ContactSchema);