// routes/sponsershipRoute.js
const express = require('express');
const router = express.Router();

const sponsorshipController = require('../controllers/sponsorshipController');
const validateSponsorship = require('../middleware/validation');

router.get('/list', sponsorshipController.getAllSponsorships);
router.get('/get/:id', sponsorshipController.getSponsorshipById);
router.post('/add', validateSponsorship, sponsorshipController.createSponsorship);
router.put('/edit/:id', validateSponsorship, sponsorshipController.updateSponsorship);
router.delete('/delete/:id', sponsorshipController.deleteSponsorship);

module.exports = router;