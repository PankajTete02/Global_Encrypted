const express = require('express');
const router = express.Router();
const delegate_profile_adv_controller = require('../controllers/delegate_profile_adv_controller');


router.post('/bulk_upload_delegate_file', delegate_profile_adv_controller.bulk_delegate_insert);
router.post('/get_speaker_list', delegate_profile_adv_controller.get_speaker_list);
router.post('/create-delegate-profile-online', delegate_profile_adv_controller.create_delegate_profile_online);
router.post('/create_delgate_online', delegate_profile_adv_controller.create_sample_delegate_online);
module.exports = router;