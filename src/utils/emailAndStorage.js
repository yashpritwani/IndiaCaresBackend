const Datauri = require('datauri');
const path = require('path');
const cloudinary = require('../config/cloudinary');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function uploader(img, res) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(img, (err, url) => {
            if (err) 
            {
                // res.status(401).json({message: "Image upload nai ho paa raha"});
                return reject(err);
            }
            // console.log("success");
            // res.status(401).json({message: "Ho gaya img uplaod"});
            return resolve(url);
        });
    });
}

function sendEmail(mailOptions) {

    return new Promise((resolve, reject) => {
        sgMail.send(mailOptions, (error, result) => {
            if (error){ 
                // console.log(error);
                return reject(error);
            }
            return resolve(result);
        });
    });
}

module.exports = { uploader, sendEmail };