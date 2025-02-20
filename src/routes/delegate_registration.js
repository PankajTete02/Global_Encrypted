const express = require("express");
const router = express.Router();
const delegate_registration = require("../controllers/delegate_registration");
// Apply token authentication middleware to all routes
// Retrieve all leaves
router.get("/getAll", delegate_registration.findAll);

// Create a new leaves
router.post("/create", delegate_registration.Delegatedetails);

// // Get All Non-Registered & Approved Data in Delegate Form
router.get("/delegate/non-registered", delegate_registration.findById);
router.get("/delegate/approved", delegate_registration.findByApproved);

// // Get All Non-Registered & Approved Data in Partner Form
router.get("/partner/non-registered", delegate_registration.findByPartner);
router.get("/partner/approved", delegate_registration.findByApprovePartner);

// // Get All Non-Registered & Approved Data in Speaker Form
router.get("/speaker/non-registered", delegate_registration.findBySpeaker);
router.get("/speaker/approved", delegate_registration.findByApproveSpeaker);

// // Update a departmentdetails with id
router.put("/approve/:user_id", delegate_registration.update_approve);

router.put('/status', delegate_registration.update_status);

// // Update a departmentdetails with id
router.put("/unapprove/:user_id", delegate_registration.update_unapprove);

// // Delete a leave with id
router.patch("/delete", delegate_registration.delete);

router.post('/search', delegate_registration.findBySearch_delegate_user);

router.post('/user/partner/search', delegate_registration.findBySearch_partner_user);

router.post('/user/speaker/search', delegate_registration.findBySearch_speaker_user);

router.post('/nonregistered/delegate/search', delegate_registration.findBySearch_delegate_nonregistered);

router.post('/nonregistered/partner/search', delegate_registration.findBySearch_partner_nonregistered);

router.post('/nonregistered/speaker/search', delegate_registration.findBySearch_speaker_nonregistered);

router.post('/delegate/already', delegate_registration.microsite_get_already_exixts_delegate);

router.post('/partner/already', delegate_registration.microsite_get_already_exixts_partner);

router.post('/speaker/already', delegate_registration.microsite_get_already_exixts_speaker);


router.post('/sendemail', delegate_registration.sendemail_Todelegte);
router.post('/generate_badge', delegate_registration.geneateBadge_delegte);

router.post('/download_badge', delegate_registration.download_badge);

router.put("/updateDetails", delegate_registration.update_details);

router.post("/user_byid", delegate_registration.userById);


router.get("/getAllCancelled/delegates", delegate_registration.findAllCancelledUsersDelegates);
router.get("/getAllCancelled/partners", delegate_registration.findAllCancelledUsersPartners);
router.get("/getAllCancelled/speakers", delegate_registration.findAllCancelledUsersSpeakers);

module.exports = router;
