const express = require('express');
const router = express.Router();
const delegate_profile_adv_controller = require('../controllers/delegate_profile_adv_controller');


router.post('/bulk_upload_delegate_file', delegate_profile_adv_controller.bulk_delegate_insert);
// router.post('/get_speaker_list', delegate_profile_adv_controller.bulk_delegate_insert);

module.exports = router;