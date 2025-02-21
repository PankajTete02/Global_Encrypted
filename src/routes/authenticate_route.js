const express = require('express');
const router = express.Router();
const authenicate=require("../controllers/authenticate_controller");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uploadPath = path.join(__dirname, '../uploads/profile_pics');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null,(file.originalname));  // Add file extension
  }
});
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']; // Only allow jpg, jpeg, and png files
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only .jpg, .jpeg, .png are allowed.'), false);  // Handle invalid file type error
  }
};
const upload = multer({
  storage: storage,
  fileFilter: fileFilter
}); 

router.post('/login-peacekeeper', authenicate.login_peacekeeper);
router.get('/download_badge/:email', authenicate.download_badge);
router.post('/amb_badge', authenicate.amb_badge);
router.put('/edit-peacekeeper',upload.single('profile_picture') ,authenicate.edit_peacekeeper);
router.post('/get_peacekeeper_details_by_id', authenicate.peacekeeper_details_id);
router.post('/get_all_delegate_details_by', authenicate.get_delegate_details_id);
module.exports = router;