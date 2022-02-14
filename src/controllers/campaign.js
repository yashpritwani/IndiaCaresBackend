const connection= require("../../server")
const mongoose=require('mongoose');
const collection=mongoose.connection.collection('products');
const Donation = require("../models/donation")
const Campaign = require("../models/campaign")
const User = require("../models/user")
const jwt = require("jsonwebtoken");

exports.showCampaign = async function (req, res) {
    try {
        // console.log(req.params.id);
        const id = req.params.id;
        const campaign = await Campaign.findById(id);
        if (!campaign) 
            return res.status(401).json({message: 'Campaign does not exist'});
        res.status(200).json({campaign});
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};

exports.location = async function (req, res) {
    // console.log(req.body);
    try {
        const city = req.body.city
        const campaignInCity = await Campaign.find( { city : city, category: req.body.category, title: req.body.search , status: "Active" });
        if (!campaignInCity) 
            return res.status(401).json({message: 'Campaigns in city does not exist'});
        res.status(200).json({campaignInCity});
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};

exports.city = async function (req, res) {
    let cities = []

    const campaigns = await Campaign.find({}).sort({"createdAt": -1});
    campaigns.map(async camp =>{
        cities.push(camp.city)
    })
    cities = await uniq(cities)
    res.status(200).json(cities);
}

async function uniq(a) {
    return Array.from(new Set(a));
}

exports.filter = async function (req, res) {
    // console.log(req.body);
    try {
        const category = req.body.category
        const campaignInCategory = await Campaign.find( { category : category});
        if (!campaignInCategory) 
            return res.status(401).json({message: 'Campaigns of this category does not exist'});
        res.status(200).json({campaignInCategory});
    } catch (error) {
        res.status(500).json({
            message: "Error Occured"
        })
    }
}

exports.activeCampaign = async function (req, res){
    const campaigns = await Campaign.find({ status: "Active" }).sort({"createdAt": -1});
    // console.log(campaigns)
    res.status(200).json({campaigns})
}

exports.pendingCampaign = async function(req, res){
    const token = req.header("Authorization");
    const finalToken = token.split(" ")[1];
    const verified = jwt.verify(finalToken, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: verified.id });
    if(user.role === "admin"){
        const campaigns =await Campaign.find({ status: "Pending"}).sort({"createdAt": -1});
        res.status(200).json({
            status: "success",
            campaigns
        })
    }
    else{
        res.status(403).json({
            message: "You are not permitted to access this route"
        })
    }
}

exports.search=async (request, response) =>{

    try { 
        // console.log(collection,request.query.term)
        let result = await collection.aggregate([
        {
            
            "$search": {
                "autocomplete": {
                    "query": `${request.query.term}`,
                    "path": "title",
                }
            }
        },
        {"$limit": 10}
    ]).toArray();
//   console.log(result);
    response.send(result);
} catch (e) {
    try{
        Campaign.getAll(req.query).then(campaigns =>{
            response.status(200).json(campaigns)
        }).catch(() => res.status(500).end())
    }
    catch{
        response.status(500).json("Searched Product Not Found.");
    }
}
};
async function getAll(query) {
let campaigns = await Campaign.find({}).lean()
if (query.search) 
    campaigns = Campaign.filter(x => x.name.toLowerCase().includes(query.search))
return campaigns;
}

exports.showAll = async function (req, res) {

    const campaigns = await Campaign.find({}).sort({"createdAt": -1});
    res.status(200).json({campaigns});
};

exports.show= async (req,res)=>{
    const id = req.params.id;


    const campaigns = await Campaign.find({ userId: id});
    res.status(200).json({
        status: "success",
        campaigns
    })
}
exports.showPaidUsers= async (req,res)=>{
    // console.log(req.body);
    const campId = req.body.ID
    // console.log(campId);
    const paidUsers = await Donation.find( { campaignId : campId}).sort({"createdAt": -1});
    // console.log(paidUsers);
    
        res.status(200).json(paidUsers);
}
exports.completeFilter=async (req, res) =>{
    // console.log(req.body);
    try { 
var regex1=new RegExp(req.body.search,'i');
var regex2 = new RegExp(req.body.category, 'i');
var regex3 = new RegExp(req.body.city, 'i');

Campaign.find({title:regex1, city: regex3, category: regex2, status: "Active"}).sort({"createdAt": -1}).then((result)=>{
    // console.log(result)
    res.status(200).json(result)
})
} catch (e) {
    try{
        Campaign.getAll(req.body.search).then(campaigns =>{
            res.status(200).json(campaigns)
        }).catch(() => res.status(500).end())
    }
    catch{
        res.status(500).json("Searched Product Not Found.");
    }
}
};

async function getAll(query) {
let campaigns = await Campaign.find({}).lean()
if (query) 
    campaigns = Campaign.filter(x => x.name.toLowerCase().includes(query))
return campaigns;
}