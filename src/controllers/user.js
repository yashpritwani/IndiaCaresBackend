const User = require('../models/user');
const {uploader, sendEmail} = require('../utils/emailAndStorage');
const Campaign = require('../models/campaign');
const jwt = require("jsonwebtoken");
const cloudinary = require('../config/cloudinary');
const { mapReduce } = require('../models/campaign');

exports.index = async function (req, res) {
    const users = await User.find({});
    res.status(200).json({users});
};

exports.show = async function (req, res) {
    try {
        const id = req.params.id;
        const user = await User.findById(id);
        if (!user) 
            return res.status(401).json({message: 'User does not exist'});
        res.status(200).json({user});
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};

exports.updateDetails = async (req, res) => {
    try {
       const {name,firstName, lastName}=req.body;
       const token = req.header("Authorization");

        if (!token)
            return res.status(401).json({
                message: "Token Unavailable",
            });
        const finalToken = token.split(" ")[1];
        const verified = jwt.verify(finalToken, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: verified.id });
        let userID;
        if (user) {
            userID = user._id;
            // console.log(userID);
        } else {
            return res.status(400).json({
                message: "User not found",
            });
        }
        if(name === '' || firstName === '' || lastName === ''){
            res.status(404).json({
                message: "Please fill out all the fields"
            })
        }
       if(req.body.image !== undefined){   
           const result = await uploader(req.body.image, res);
            
            // console.log(result.url);
            const userNew = await User.findOneAndUpdate(
                { _id: userID },
                {
                    $set: { username:name, profileImage: result.url, firstName, lastName },
                }
            );
            // console.log(userNew);
            return res.status(200).json({
                message: "User has been updated Successfully"
            })
       }
       const userNew = await User.findOneAndUpdate(
        { _id: userID },
            {
                $set: { username:name, firstName, lastName },
            }
        );
        // console.log(userNew);
            res.status(200).json({
                message: "User has been updated Successfully"
            })
         await sendVerificationEmail(userNew, req, res);
    } catch (err) {
        // console.log(err)
        res.json(err);
    }
};

exports.destroy = async function (req, res) {
    try {
        const id = req.params.id;
        const user_id = req.user._id;
        if (user_id.toString() !== id.toString()) 
            return res.status(401).json({message: "No permission to delete this data."});
        await User.findByIdAndDelete(id);
        res.status(200).json({message: 'User has been deleted'});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

async function sendVerificationEmail(user, req, res){
    try{
        let subject = "User Details Updated";
        let to = user.emailId;
        let from = process.env.FROM_EMAIL;
        let html = `<p>Hi ${user.username}<p><br><p>Your details have been upated </p>`;
        await sendEmail({to, from, subject, html});
        res.status(200).json({message: 'verification email gaya hai ' + user.emailId + ' pe.'});
    }catch (error) {
        res.status(500).json({message: error.message});
    }
}

exports.createCampaign = async (req, res) => {
    try {
        // console.log(req.body);
        const result = await uploader(req.body.campaignImage, res);
        const token = req.header("Authorization");
        const images = [];
        const documents = [];
        let r;
        if(req.body.additionalImages){
            for(let i=0; i<req.body.additionalImages.length; i++){
                r = await uploader(req.body.additionalImages[i], res);
                console.log(r.url);
                images.push(r.url);
            }
        }
        if(req.body.documents){
            for(let i=0; i<req.body.documents.length; i++){
                r = await uploader(req.body.documents[i], res);
                doc = {
                    documentName: req.body.documentName[i],
                    documentUrl: r.url
                }
                console.log(doc);
                documents.push(doc);
            }
        }
        if (!token){
            // console.log("token not found");
            return res.status(401).json({
                msg: "Token Unavailable",
            });
        }
        const finalToken = token.split(" ")[1];
        // console.log(finalToken);
        const verified = jwt.verify(finalToken, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: verified.id });
        var userID;
        if (user) {
            userID = user._id;
            // console.log(userID);
        } else {
            return res.status(400).json({
                msg: "User not found",
            });
        }
        const newCampaign = new Campaign({
            title: req.body.title,
            description: req.body.description,
            targetPrice: req.body.targetPrice,
            city: req.body.city,
            category: req.body.category,
            deadline: req.body.deadline,
            campaignImage: result.url,
            moreImages: images,
            documents: documents
        });
        newCampaign.userId = user._id
        const campaignNew = await newCampaign.save();
        let campaign_ = user.campaigns
        campaign_.push({
            campaignId: campaignNew._id,
            
            });
        await User.findByIdAndUpdate(user._id, {campaigns: campaign_}, {new: true});
        await sendCampaignEmail(campaign_ , user, req, res);
        res.status(200).json({
            message: "Campaign created successfully",
            campaign_
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: error.message})
    }
};
exports.showUserId = async function (req, res) {
    try {
        const token = req.header("Authorization");
        if (token === "bearer null")
            return res.status(401).json({
                msg: "Token Unavailable",
            });
        const finalToken = token.split(" ")[1];
        const verified = jwt.verify(finalToken, process.env.JWT_SECRET);
        // console.log(verified)
        const user = await User.findOne({ _id: verified.id });
        if (!user) 
            return res.status(401).json({message: 'User does not exist'});
        res.status(200).json({user});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error.message})
    }
};

async function sendCampaignEmail(campaign, user, req, res){
    try{
        let subject = "Campaign created";
        let to = user.emailId;
        let from = process.env.FROM_EMAIL;
        let html = `<p>Hi ${user.username}<p><br><p>Your campaign ${campaign.title} has been created on India Cares.</p>
                    <p>Please wait for the admin to approve the campaign to view it on IndiaCares.</p>`;
        await sendEmail({to, from, subject, html});
        // res.status(200).json({message: 'Campaign Creation success email has been sent.'});
    }catch (error) {
        console.log(error);
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
        let userID
        if (user) {
            userID = user._id;
        } else {
            return res.status(400).json({
                msg: "User not found",
            });
        }
        const id = req.params.id;
        const camp = await Campaign.findById(id)
        var imgs = req.body.moreImages
        var images = [];
        var documents = [];
        var docs = req.body.documents;
        // console.log(req.body.documents[0].documentName);
        var r;
        console.log(imgs.length,docs.length)
        for(var i = 0 ; i < imgs.length ; i++){
            if (await camp.moreImages.indexOf(imgs[i])===-1){
                var j = await uploader(imgs[i], res);
                r = j.url
            }
            else r = imgs[i]
            images[i] = r;
        }
        for(var i = 0 ; i < docs.length ; i++){
            if (docs[i]._id)
            m = {documentName: docs[i].documentName,documentUrl: docs[i].documentUrl}
            else{
                var k = await uploader(docs[i].documentUrl, res);
                m = {documentName: docs[i].documentName,documentUrl: k.url}
            }
            documents[i]=m;
        }
        var update = req.body;
        if(req.body.campaignImage !== camp.campaignImage){
            const result = await uploader(req.body.campaignImage, res);
            update.campaignImage = result.url;
        }
        update.moreImages = images;
        update.documents = documents;
        const campaign = await Campaign.findByIdAndUpdate(id, {$set: update}, {new: true});
        await updateCampaignEmail(campaign , user, req, res);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }
};

async function updateCampaignEmail(campaign, user, req, res){
    try{
        let subject = "Campaign updated";
        let to = user.emailId;
        let from = process.env.FROM_EMAIL;
        let html = `<p>Hi ${user.username}<p><br><p>Your campaign ${campaign.title} has been updated on India Cares.</p>
                    <p>Please wait for the admin to approve the campaign to view it on IndiaCares.</p>`;
        await sendEmail({to, from, subject, html});
        res.status(200).json({message: 'Campaign Updation success email has been sent.'});
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
        const id = req.body.id;
        const user_id = req.user._id;
        if (user_id.toString() !== id.toString()) 
            return res.status(401).json({message: "No permission to delete this data."});
        await Campaign.findByIdAndDelete(id);
        await deletedCampaignEmail(campaign , user, req, res);
        //res.status(200).json({message: 'Campaign has been deleted'});
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
exports.getUrl= async (req,res)=>{
    // console.log(req.body)
    const result = await uploader(req.body);
    // console.log(result)
    res.status(200).json(result)
}