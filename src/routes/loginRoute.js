const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

router.post('/send-otp', loginController.sendOtp);  // API to send OTP
router.post('/verify-otp', loginController.verifyOtp); // API to verify OTP
router.post('/genratePassword', loginController.updatePassword);
router.post('/getLookupData',loginController.fetchLookupData);
router.post('/deactivate-user', loginController.deactivateUser);


module.exports = router;
