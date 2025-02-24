// const express = require("express");
// const router = express.Router();
// const delegate_registration = require("../controllers/delegate_registration");
// // Apply token authentication middleware to all routes
// // Retrieve all leaves


// // Create a new leaves
// // router.post("/create", delegate_registration.Delegatedetails);

// // // Get All Non-Registered & Approved Data in Delegate Form

// module.exports = router;
const express = require('express');
const router = express.Router();
const delegateProfileController = require('../controllers/delegateProfileController');

// Define the route for creating delegate profile
router.post('/create-delegate-profile', delegateProfileController.createDelegateProfile);
router.post('/create-nomination-profile', delegateProfileController.createNominateProfile);
router.post('/verify_session_stripe_payment', delegateProfileController.verify_session_status);
router.get('/download_badge/:email', delegateProfileController.download_badge);
router.post('/create-delegate-profile-whatapp', delegateProfileController.createDelegateProfile_whatapp);

module.exports = router;
