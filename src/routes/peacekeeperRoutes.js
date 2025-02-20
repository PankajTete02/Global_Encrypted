const express = require('express');
const router = express.Router();
const peacekeeperController = require('../controllers/peacekeeperController');

// Route to create a peacekeeper with file upload
router.post('/create-peacekeeper', peacekeeperController.createPeacekeeper);

router.get('/peacekeeper/:id', peacekeeperController.getPeacekeeperData);

router.get('/getAllpeacekeeper', peacekeeperController.getAllPeacekeeperData);

router.get('/getAllContactUsData', peacekeeperController.getAllContactUsData);

router.post('/update_peacekeeper', peacekeeperController.update_Peacekeeper);

router.post('/resend_email', peacekeeperController.getAllEmailData);

router.post('/delete_peacekeeper', peacekeeperController.deletePeacekeeperData);

router.post('/mail_discount_code', peacekeeperController.discountPeacekeeperData);

router.post('/create_session_stripe', peacekeeperController.session_status);

router.get('/getAllpeacekeeperDropdown', peacekeeperController.getAllPeacekeeperDropdown);


// router.post('/amb_badge', peacekeeperController.amb_badge);

module.exports = router;
