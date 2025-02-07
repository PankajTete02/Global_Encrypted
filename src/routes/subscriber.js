const express = require("express");
const router = express.Router();
const Subscriber = require("../controllers/subscriber");

// Apply token authentication middleware to all routes
// Retrieve all leaves
router.get("/getAll", Subscriber.findAll);

// Create a new leaves
router.post("/create", Subscriber.Subscriber);

router.post("/search", Subscriber.findBySearch_Subscriber);

router.patch("/delete", Subscriber.delete);

module.exports = router;