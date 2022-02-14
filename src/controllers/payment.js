const shortid = require("shortid");
const Razorpay = require("razorpay");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const {uploader, sendEmail} = require('../utils/emailAndStorage');
require('dotenv').config();
const Donation = require("../models/donation")
const Campaign = require("../models/campaign");
const User = require("../models/user");
const express = require('express');
const {check} = require('express-validator');
const multer = require('multer');
const validate = require('../middlewares/validate');
const router = express.Router();
const upload = multer().single('profileImage');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.payment = async (req, res) => {
    // console.log(req.body.amount)
    const {amount, userId, campaignId, name, address, email , phoneNo} = req.body;
    const reciept = shortid.generate();
    let donationDate = `${moment().format("llll")}`;
    let country_number = `+91${phoneNo}`;
    // console.log(country_number);
    // console.log(campaignId)
    let newDonation = new Donation({
        role: "basic",
        phoneNo: country_number,
        userID: userId,
        name: name,
        campaignId: campaignId,
        email: email,
        amount: amount,
        address: address,
        donationDate: Date.now(),
        reciept
    });
    
    const newDonation_ = await newDonation.save();
    const campaign = await Campaign.findById(campaignId);
    
    const user = await User.findById(userId);
    // console.log(user);

    if(user)
    {
        let payment_ = user.payments
        payment_.push({
            paymentId: newDonation_._id,
            userId: userId
            });
    await User.findByIdAndUpdate(user._id, {payments: payment_}, {new: true});
    }
    const findTotalPrice = amount;
    
        const payment_capture = 1;
        const currency = "INR";
        // console.log(currency);
        const options = {
            amount: findTotalPrice *100 ,
            currency,
            receipt: reciept,
            payment_capture,
        };
        console.log(options);
        try {
            const response = await razorpay.orders.create(options);
            // console.log(response)
            if (response.id) {
            // console.log(c.amount);
            res.json({
                paymentId: newDonation_._id,
                id: response.id,
                currency: response.currency,
                amount: response.amount,
            });
        }
        } catch (error) {
            console.log(error);
        }

}

exports.success = async (req, res) => {
    const payment_ = await Donation.findById(req.body.paymentId)
    payment_.role = "success"
    await payment_.save();
    const campaign = await Campaign.findById(req.body.campaignId)
    let payment = campaign.payments
    payment.push({
        paymentId: req.body.paymentId,
        });
    await Campaign.findByIdAndUpdate(campaign._id, {payments: payment}, {new: true});
    const upd = await Campaign.findByIdAndUpdate(req.body.campaignId, {amount: parseInt(campaign.amount) + parseInt(req.body.amount)});
    const resp = await DonationSuccess(req.body.name,req.body.email)
    if(resp) res.status(202).json({message: 'Donation has been made successfully to the campaign'});
}

async function DonationSuccess(name,email, req,res){
    try{
        let subject = "Donation has been made successfully";
        let to = email;
        let from = process.env.FROM_EMAIL;
        let html = `<p>Hi ${name}<p><br><p>Donation has been made successfully.</p>`;
        // console.log(to, from, subject, html)
        const resp = await sendEmail({to, from, subject, html});
        return resp
    }catch (error) {
        console.log(error)
        res.status(500).json({message: error.message});
    }
}