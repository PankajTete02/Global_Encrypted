const express = require("express");
const router = express.Router();
const Tracking = require("../controllers/tracking_link");

// Apply token authentication middleware to all routes
// Retrieve all leaves
router.get("/Tracking/getAll", Tracking.findAlltracking);

router.get("/Tracking/getAll/refrence", Tracking.findAllrefrences);

router.get("/Tracking/getAll/forms", Tracking.findAllform);

// Create a new leaves
router.post("/Tracking/create", Tracking.Tracking);

router.patch("/Tracking/delete", Tracking.delete);

router.post("/Tracking/search", Tracking.findBySearch_Tracking_user);


module.exports = router;