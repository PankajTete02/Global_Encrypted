const express = require("express");
const router = express.Router();
const brochure = require("../controllers/brochure");


// Create a new leaves
router.post("/create", brochure.brochure);

router.get("/getAll", brochure.findAll);

router.post("/search", brochure.find_searchby_brochure);


router.patch("/delete", brochure.delete);



module.exports = router;