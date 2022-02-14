const express = require('express');
const {check} = require('express-validator');
const passport = require('passport');
const Auth = require('../controllers/auth');
const Password = require('../controllers/password');
const validate = require('../middlewares/validate');
const router = express.Router();
const gAuth = require('../controllers/gAuth');

router.get('/', (req, res) => {
    res.status(200).json({message: "You are in the Auth Endpoint. Register or Login to test Authentication."});
});

router.post('/register', [
    check('emailId').isEmail().not().isEmpty().withMessage('Enter a valid email address'),
    check('password').not().isEmpty().isLength({min: 6}).withMessage('Must be at least 6 chars long'),
    check('firstName').not().isEmpty().withMessage('You first name is required'),
    check('username').not().isEmpty().withMessage('Your user name is required'),
    check('lastName').not().isEmpty().withMessage("lastName is required field")
], Auth.register);

router.post("/login", [
    check('emailId').isEmail().withMessage('Enter a valid email address'),
    check('password').not().isEmpty(),
], validate, Auth.login);

router.post("/registerWithPhone", validate, Auth.registerWithPhone);

router.post('/verifyOTP', Auth.verifyOTP);

router.post("/loginWithPhone", validate, Auth.registerWithPhone);

router.get('/verify/:token', Auth.verify);
router.post('/resend', Auth.resendToken);

router.post('/recover', [
    check('email').isEmail().withMessage('Enter a valid email address'),
], validate, Password.recover);

router.get('/reset/:token', Password.reset);

router.post('/reset/:token', [
    check('password').not().isEmpty().isLength({min: 8}).withMessage('Must be at least 8 chars long'),
    check('confirmPassword', 'Passwords do not match').custom((value, {req}) => (value === req.body.password)),
], validate, Password.resetPassword);
// router.post('/google/login', gAuth.signin);
router.post("/googleSignin", Auth.googleSignin);

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/'}), (req, res) => {
    res.send('Succesfully signed in with your google account');
})

module.exports = router;