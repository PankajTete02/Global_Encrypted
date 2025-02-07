const express = require("express");
const router = express.Router();
const partner_registration = require("../controllers/partner_registration");

// Apply token authentication middleware to all routes
// Retrieve all leaves
router.get("/getAll", partner_registration.findAll);

// Create a new leaves
router.post("/create", partner_registration.Partnerdetails);

// // Retrieve a single leave with id
router.get("/:email_id", partner_registration.findById);

// // Update a departmentdetails with id
// router.put("/:departmentId", departmentdetailsController.update);

// // Delete a leave with id
// router.patch("/:form_id", partner_registration.delete);


module.exports = router;
