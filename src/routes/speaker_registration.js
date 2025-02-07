const express = require("express");
const router = express.Router();
const speaker_registration = require("../controllers/speaker_registration");

// Apply token authentication middleware to all routes
// Retrieve all leaves
router.get("/getAll", speaker_registration.findAll);

// Create a new leaves
router.post("/create", speaker_registration.Speakerdetails);

// // Retrieve a single leave with id
router.get("/:email_id", speaker_registration.findById);

// // Update a departmentdetails with id
// router.put("/:departmentId", departmentdetailsController.update);

// // Delete a leave with id
// router.patch("/:form_id", speaker_registration.delete);


module.exports = router;
