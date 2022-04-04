const User = require('../models/user');
const Token = require('../models/token');
const {sendEmail} = require('../utils/emailAndStorage');
const express = require('express');
const app = express();
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

exports.signin = async(req, res) => {
    try{
        let token = req.body.token;
        async function verify() {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.CLIENT_ID,
            });
            const payload = ticket.getPayload();
            const userid = payload['sub'];
            const newUser = new User({
                emailId: payload.email,
                username: payload.name,
                firstName: payload.given_name,
                lastName: payload.family_name,
                password: payload.sub
            });
            try{
                const user = await User.findOne({emailId: payload.email});
                // console.log(user)
                if(!user){
                    const user_ = await newUser.save();
                    await sendVerificationEmail(user_, req, res);
                    // console.log("user saved");
                }
                else{
                    res.status(503).json({message: "You are already registered"});
                }
            } catch(err){
                res.status(500).json({message: err.message});
            }
        }
        verify().catch(console.error);
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
}

async function sendVerificationEmail(user, req, res){
    try{
        const token = user.generateVerificationToken();
        await token.save();
        // console.log(token);
        let subject = "Account Verification Token";
        let to = user.emailId;
        let from = process.env.FROM_EMAIL;
        let link="http://"+req.headers.host+"/auth/verify/"+token.token;
        let html = `<p>Hi ${user.username}<p><br><p>Click on the following <a href="${link}">link</a> to verify your account.</p>`;
        // console.log(link);
        await sendEmail({to, from, subject, html});
        res.status(200).json({message: 'verification email gaya hai ' + user.emailId + ' pe.'});
    }catch (error) {
        res.status(500).json({message: error.message});
    }
}