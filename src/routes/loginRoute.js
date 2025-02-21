const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

router.post('/send-otp', loginController.sendOtp);  // API to send OTP
router.post('/verify-otp', loginController.verifyOtp); // API to verify OTP
router.post('/generatePassword', loginController.updatePassword);
// router.post('/insertPassword', loginController.insertPassword);
// router.post('/forgetPassword', loginController.forgetPassword);
router.post('/getLookupData',loginController.fetchLookupData);
router.delete('/delete-user', loginController.deactivateUser);


module.exports = router;
