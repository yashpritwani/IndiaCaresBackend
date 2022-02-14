const User = require('../models/user');
const {uploader, sendEmail} = require('../utils/emailAndStorage');
const Campaign = require('../models/campaign');
const jwt = require("jsonwebtoken");

exports.updateStatus = async (req, res) => {
    try {

       const {campId,status}=req.body;
       const token = req.header("Authorization");
    //    console.log(token);

        if (!token)
            return res.status(401).json({
                msg: "Token Unavailable",
            });
        const finalToken = token.split(" ")[1];
        const verified = jwt.verify(finalToken, process.env.JWT_SECRET);
        // console.log(verified);
        const admin = await User.findOne({ _id: verified.id });
        if (admin.role=="admin") {
            adminID = admin._id;
            // console.log(adminID);
            // console.log(admin.username);
            const campNew = await Campaign.findOneAndUpdate(
                { _id: campId },
                {
                    status: status,
                }
            );
            // console.log(campNew);
            const user = await User.findOne({ _id: campNew.userId });
            return res.status(200).json({
                success: "true",
                campNew,
            })

            await sendVerificationEmail(user,admin, campNew,req, res);
        } else {
            return res.status(400).json({
                msg: "You are not admin , only admin can approve the campaign.",
            });
        }
    } catch (err) {
        // console.log((err));
        res.json(err);
    }
};

async function sendVerificationEmail(user,admin,campaign,req,res){
    try{
        let subject = "Campaign Status Updated";
        let to = user.emailId;
        let from = process.env.FROM_EMAIL;
        let html = `<p>Hi ${user.name}<p><br><p>Your campaign ${campaign.name}'s status has been updated by admin ${admin.userName} and has been changed to ${campaign.status} <br> Go to <a href="http://indiacares.in/user/campaigns">Active Campaigns</a> to check your campaign</p>`;
        await sendEmail({to, from, subject, html});
        res.status(200).json(campaign);
    }catch (error) {
        res.status(500).json({message: error.message});
    }
}


exports.raiseQuery = async (req, res) => {
    try{
        // console.log("hllo")
        const token = req.header("Authorization");
        // console.log(token);
        if (!token)
            return res.status(401).json({
                msg: "Token Unavailable",
            });
        const finalToken = token.split(" ")[1];
        const verified = jwt.verify(finalToken, process.env.JWT_SECRET);
        // console.log(verified);
        const admin = await User.findOne({ _id: verified.id });
        if (admin.role=="admin") {
        const id = req.params.id
        const user = await User.findById(id)
        const campaign = await Campaign.findById(req.body.campId)
        let subject = "Query raised against your campaign by admin";
        let to = user.emailId;
        let from = process.env.FROM_EMAIL;
        let html = `<p>Hi ${user.username}<p><br><p>Query has been raised by admin ${admin.username} and it is as follow :- <p> <p> </p></p> ${req.body.message} <br>`;
        await sendEmail({to, from, subject, html});
        res.status(200).json(campaign);
        }
        else{
            res.status(500).json({message: "Only admin can raise a query"});
        }
    }catch (error) {
        res.status(500).json({message: error.message});
    }
}

exports.updateCampaign = async function (req, res) {
    try {
        const token = req.header("Authorization");
        if (!token)
            return res.status(401).json({
                msg: "Token Unavailable",
            });
        const finalToken = token.split(" ")[1];
        const verified = jwt.verify(finalToken, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: verified.id });
        if (user) {
            let userID = user._id;
            // console.log(userID);
        } else {
            return res.status(400).json({
                msg: "User not found",
            });
        }
        const update = req.body;
        const id = req.params.id;
        const campaign = await Campaign.findByIdAndUpdate(id, {$set: update}, {new: true});
        res.status(200).json({
            message: "Camapign Updated Successfully"
        })

        await updateCampaignEmail(campaign , user, req, res);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

async function updateCampaignEmail(user, req, res){
    try{
        let subject = "Campaign updated";

        let to = user.emailId;
        let from = process.env.FROM_EMAIL;
        let html = `<p>Hi ${user.username}<p><br><p>Your campaign ${campaign.title} has been updated on India Cares.</p>
                    <p>Please wait for the admin to approve the campaign to view it on IndiaCares.</p>`;
        await sendEmail({to, from, subject, html});
        res.status(200).json({message: 'Campaign Creation success email has been sent.'});
    }catch (error) {
        res.status(500).json({message: error.message});
    }
}

exports.deleteCampaign = async function (req, res) {
    try {
        const token = req.header("Authorization");
        if (!token)
            return res.status(401).json({
                msg: "Token Unavailable",
            });
        const finalToken = token.split(" ")[1];
        const verified = jwt.verify(finalToken, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: verified.id });
        if (user) {
            userID = user._id;
            // console.log(userID);
        } else {
            return res.status(400).json({
                msg: "User not found",
            });
        }
        const id = req.params.id;
        const user_id = user._id;
        // console.log(user._id);
        // console.log(id);
        // if (user_id.toString() !== id.toString()) 
            // return res.status(401).json({message: "No permission to delete this data."});
        await Campaign.findByIdAndDelete(id);
        await deletedCampaignEmail(campaign , user, req, res);
        res.status(200).json({message: 'Campaign has been deleted'});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

async function deletedCampaignEmail(user, req, res){
    try{
        let subject = "Campaign deleted";

        let to = user.emailId;
        let from = process.env.FROM_EMAIL;
        let html = `<p>Hi ${user.username}<p><br><p>Your campaign ${campaign.title} has been dropped down from India Cares.</p>`;
        await sendEmail({to, from, subject, html});
        res.status(200).json({message: 'Campaign Creation success email has been sent.'});
    }catch (error) {
        res.status(500).json({message: error.message});
    }
}

exports.deleteUser = async function (req, res) {
    try {
        const token = req.header("Authorization");
        if (!token)
            return res.status(401).json({
                msg: "Token Unavailable",
            });
        const finalToken = token.split(" ")[1];
        const verified = jwt.verify(finalToken, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: verified.id });
        if (user) {
            userID = user._id;
            // console.log(userID);
        } else {
            return res.status(400).json({
                msg: "User not found",
            });
        }
        const id = req.params.id;
        const userDel = await User.findById(id);
        await User.findByIdAndDelete(id);
        res.status(200).json({
            status:"success",
            message: "user Deleted Successfully",
        })
        await deletedUserEmail(userDel, req, res);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

async function deletedUserEmail(userDel, req, res){
    try{
        let subject = "Campaign deleted";
        let to = userDel.email;
        let from = process.env.FROM_EMAIL;
        let html = `<p>Hi ${userDel.username}<p><br><p>Your User ID has been deleted from India Cares.</p>`;
        await sendEmail({to, from, subject, html});
        res.status(200).json({message: 'User has been successfully dleted.'});
    }catch (error) {
        res.status(500).json({message: error.message});
    }
}

exports.upgradeUser = async function (req, res) {
    try {
        const id = req.params.id;
        const user_ = await User.findById(id) 
        if (!user_) 
            return res.status(401).json({message: 'User does not exist'});
        user_.role = 'admin'
        await user_.save();
        res.status(200).json({
            message: "user has been upgraded to admin",
            user_
        })
    }
    catch (error) {
        res.status(500).json({message: error.message});
    }
}

async function upgradedUserEmail(user, req, res){
    try{
        let subject = "User update to admin";

        let to = user.emailId;
        let from = process.env.FROM_EMAIL;
        let html = `<p>Hi ${user.username}<p><br><p>Your User ID has been upgraded to Admin for India Cares.</p>`;
        await sendEmail({to, from, subject, html});
        res.status(200).json({message: 'User has been successfully upgraded to admin.'});
    }catch (error) {
        res.status(500).json({message: error.message});
    }
}