const User = require('../models/user');
const Token = require('../models/token');

const {uploader, sendEmail} = require('../utils/emailAndStorage');

// const {sendEmail} = require('../utils/emailAndStorage');
const jwt = require("jsonwebtoken");
const {OAuth2Client} = require('google-auth-library');
var crypto = require("crypto");
const client = new OAuth2Client(process.env.CLIENT_ID);

exports.register = async (req, res) => {
    try {
        if(req.body.profileImage !== undefined){
            const result = await uploader(req.body.profileImage, res);
            console.log(result.url)
            const { emailId } = req.body;
            const user = await User.findOne({ emailId });
            if (user) return res.status(401).json({message: 'Email pehle se register ho rakha hai.'});
            const {username, password, firstName, lastName } = req.body;
            console.log(username, password, firstName, lastName)
            const newUser = new User({
                role : 'basic',
                emailId,
                username,
                password,
                firstName,
                lastName,
                profileImage: result.url
            });
            const user_ = await newUser.save();
            await sendVerificationEmail(user_, req, res);
        }
        else{
            const { emailId } = req.body;

            if(emailId===''){
                return res.status(404).json({
                    message: "Please provide a valid email address"
                })
            }
            let user = await User.findOne({ emailId });
            // console.log(user);
            if (user) return res.status(401).json({message: 'Email pehle se register ho rakha hai.'});
            const {username, password, firstName, lastName } = req.body;
            if(username==='') return res.status(404).json({
                message: "Please provide a username"
            })
            user = await User.findOne({ username });
            if (user) return res.status(401).json({message: 'There already exists a user with this username'});
            console.log(username, password, firstName, lastName)
            const newUser = new User({
                role : 'basic',
                emailId,
                username,
                password,
                firstName,
                lastName,
            });
            const user_ = await newUser.save();
            await sendVerificationEmail(user_, req, res);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: error.message})
    }
};

const twilio = require("twilio")(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

exports.registerWithPhone = async (req, res) => {
    const { phoneNo } = req.body;
    // console.log("ph is",phoneNo)
    try {
        const code = Math.floor(100000 + Math.random() * 900000);
        const exists = await User.findOne({ phoneNo: phoneNo });
        if (exists) {
            exists.code = code;
            exists.codeGenTime = Date.now();
            const savedUser = await exists.save();
            res.status(200).json({
                msg: "OTP Sent successfully",
            });
        } else {
            const user = new User({
                phoneNo: req.body.phoneNo,
                code,
                codeGenTime: Date.now(),
            });
            const savedUser = await user.save();
            // console.log("savedUser is",savedUser)
            res.status(201).json({
                msg: "OTP Sent successfully",
            });
        }
        twilio.messages
            .create({
                body: `Welcome ! Your verification code is ${code}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: req.body.phoneNo,
            })
            // .then((message) => console.log(message.sid));
            // console.log(" twilio ")
    } catch (err) {
        // console.log(err)
        res.json(err);
    }
};
exports.googleSignin = async (req, res) => {
    // console.log(req.body);
    try{
        const {tokenId} = req.body;
        if(tokenId)
        {
            client.verifyIdToken({idToken: tokenId, audience: process.env.CLIENT_ID}).then(async response => {
            const {email_verified, name, given_name, family_name, sub, email, picture} = response.payload;
            if(email_verified === true) {
                const user = await User.findOne({ emailId: email });
                console.log(user)
                if(user) {
                    res.status(200).json({token: user.generateJWT(), user: user});
                }
                else{
                    var Password = crypto.randomBytes(10).toString('hex');
                    const newUser = new User({
                        username:name,
                        password: Password,
                        firstName: given_name,
                        lastName: family_name,
                        profileImage: picture,
                        emailId: email,
                        role: "basic"
                    });
                    const user_ = await newUser.save();
                    await sendVerificationEmail(user_, req, res);
                }
            }
            else{
                res.status(500).json({ message: "Email ID is not verified , please verify to continue"})
            }
        })
    }
    else{
        res.status(500).json({ message: "No token Provided"})
    }
    } catch(err){
        res.status(500).json({success: false, message: err.message})
    }
}

exports.verifyOTP = async (req, res) => {
    const { phoneNo, OTP } = req.body;
    // console.log(OTP)
    const userExists = await User.findOne({ phoneNo: phoneNo });
    if (!userExists) {
        return res.status(400).json({
            msg: "Something went wrong... Try again",
        });
    }
    let timestamp = new Date(userExists.codeGenTime).getTime() + 5 * 60 * 1000;
    const futureDate = new Date(timestamp);
    const currentDate = Date.now();
    if (currentDate > futureDate) {
        return res.status(400).json({
            msg: "OTP Expired... Try Again",
        });
    } else {
        if (userExists.code != OTP) {
            return res.status(400).json({
                msg: "Invalid Code... Try Again",
            });
        } else {
            const token = jwt.sign({ id: userExists.id }, process.env.JWT_SECRET, { expiresIn: '1d' }); 
            res.status(200).json({
                token:token,id:userExists.id
            });
        }
    }
};

exports.login = async (req, res) => {
    try {
        // console.log(req.body);
        const { emailId, password } = req.body;
        const user = await User.findOne({ emailId });
        if (!user) 
            return res.status(401).json({msg: 'yeh ' + email + ' galat email hai'});
        if (!user.comparePassword(password)) 
            return res.status(401).json({message: 'galat hai email/pass'});
        if (!user.isVerified) 
            return res.status(401).json({ type: 'not-verified', message: 'Verify nai hua.' });
        res.status(200).json({token: user.generateJWT(), user: user});
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};

exports.verifyToken= async  (req,res) =>{
    const token = req.header("Authorization");
    // console.log("token from auth",token)
    if (!token)
        return res.status(401).json({
            msg: "Token Unavailable",
        });
    try {
        // console.log("secret is",process.env.JWT_SECRET)
        const finalToken = token.split(" ")[1];
        const verified = jwt.verify(finalToken, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: verified.id });
        if (user) {
            return res.status(200).json(user._id);
        } else {
            return res.status(400).json({
                msg: "User not found",
            });
        }
    } catch (err) {
        // console.log(err)
        return res.status(403).json({ message: err });
    }
};

exports.verify = async (req, res) => {
    if(!req.params.token) 
        return res.status(400).json({message: "aisa koi nai hai"});
    try {
        const token = await Token.findOne({ token: req.params.token });
        if (!token) 
            return res.status(400).json({ message: 'link expire ho gaya' });
        User.findOne({ _id: token.userId }, (err, user) => {
            if (!user) 
                return res.status(400).json({ message: 'aisa koi nai hai' });
            if (user.isVerified) 
                return res.status(400).json({ message: 'verified hai already' });
            user.isVerified = true;
            user.save(function (err) {
                if (err) 
                    return res.status(500).json({message:err.message});
                res.status(200).send("Verify ho gaya login karlo.");
            });
        });
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};

exports.resendToken = async (req, res) => {
    try {
        const { emailId } = req.body;
        const user = await User.findOne({ emailId });
        if (!user) 
            return res.status(401).json({ message: 'yeh ' + req.body.email + ' email register nai hua hai'});
        if (user.isVerified) 
            return res.status(400).json({ message: 'Verify ho gaya , login kar lo'});
        await sendVerificationEmail(user, req, res);
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};

async function sendVerificationEmail(user, req, res){
    try{
        const token = user.generateVerificationToken();
        // console.log(token);
        await token.save();
        let subject = "Account Verification Token";
        let to = user.emailId;
        let from = process.env.FROM_EMAIL;
        let link="http://"+req.headers.host+"/auth/verify/"+token.token;
        let html = `<p>Hi ${user.username}<p><br><p>Click on the following <a href="${link}">link</a> to verify your account.</p>`;
        // console.log(link);
        await sendEmail({to, from, subject, html});
        res.status(201).json({message: 'Email has been sent ' + link});
    }catch (error) {
        res.status(500).json({message: error.message});
    }
}