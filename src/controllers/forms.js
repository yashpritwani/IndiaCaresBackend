const {sendEmail} = require('../utils/emailAndStorage');
const Contact = require('../models/contact');
const Involvement = require('../models/involvement');
const Rti = require('../models/rti');

exports.contact = async function (req, res) {
    try {
        const newContact = new Contact({ ...req.body, role: "Query" });
        const contact_ = await newContact.save();
        let html = `<p>Hi ${contact_.name}<p><br><p>Your query has been submitted successfully</p>`;
        var resp = await sendVerificationEmail(contact_, html,req, res);
        if(resp) res.status(200).json({message: 'Contact us query email has been sent.'});
        else res.status(500).json({message: 'Email could not be sent.'});
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

exports.rti = async function (req, res) {
    try {
        const newRti = new Rti({ ...req.body, role: "RTI" });
        const rti_ = await newRti.save();
        let html = `<p>Hi ${rti_.name}<p><br><p>Your RTI request has been processed successfully on IndiaCares</p>`;
        var resp = await sendVerificationEmail(rti_,html, req, res);
        if(resp) res.status(200).json({message: 'RTI submission email has been sent.'});
        else res.status(500).json({message: 'Email could not be sent.'});
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

exports.involvement = async function (req, res) {
    try {
        const newInvolvement = new Involvement({ ...req.body });
        const involvement_ = await newInvolvement.save();
        let html = `<p>Hi ${involvement_.firstName}<p><br><p>We have succefully received your request of involvement in IndiaCares</p>`;
        var resp = await sendVerificationEmail(involvement_,html, req, res);
        if(resp) res.status(200).json({message: 'Involvement success email has been sent.'});
        else res.status(500).json({message: 'Email could not be sent.'});
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

async function sendVerificationEmail(user, html,req, res){
    try{
        let subject = "Campaign created";
        let to = user.emailId;
        let from = process.env.FROM_EMAIL;
        const resp = await sendEmail({to, from, subject, html});
        return resp
    }catch (error) {
        return error
    }
}