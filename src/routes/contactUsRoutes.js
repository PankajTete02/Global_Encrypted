// routes/contactUsRoutes.js
const express = require('express');
const router = express.Router();
const contactUsController = require('../controllers/contactUsController');

// POST request to create a contact form entry
router.post('/contact_us', contactUsController.createContact);

router.get('/invite_speakers', contactUsController.getAllInviteSpeakers);

module.exports = router;
