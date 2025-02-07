const express = require("express");
const router = express.Router();
const sales_brochure = require("../controllers/sales_brochure");

// Apply token authentication middleware to all routes
// Retrieve all leaves
router.get("/getAll", sales_brochure.findAll);

// Create a new leaves
router.post("/create", sales_brochure.sales_brochure);

router.post("/search", sales_brochure.findBySearch_sales_brochure);

router.patch("/delete", sales_brochure.delete);


module.exports = router;