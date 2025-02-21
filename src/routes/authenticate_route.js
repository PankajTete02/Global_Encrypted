const express = require('express');
const router = express.Router();
const authenicate = require("../controllers/authenticate_controller");
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
    cb(null, (file.originalname));  // Add file extension
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


/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication and user management endpoints
 */
 
/**
 * @swagger
 * /api/v1/login-peacekeeper:
 *   post:
 *     summary: Authenticate peacekeeper login
 *     tags: [Authentication]
 *     description: Login endpoint for peacekeepers with encrypted data and JWT token generation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - encrypted_data
 *             properties:
 *               encrypted_data:
 *                 type: string
 *                 description: Encrypted JSON containing email
 *                 example: "encrypted_string_containing_email"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: string
 *                   description: Encrypted user details
 *                   example: "encrypted_user_data"
 *                 token:
 *                   type: string
 *                   description: Encrypted JWT token
 *                   example: "encrypted_jwt_token"
 *       500:
 *         description: Login failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "email_id is required"
 *     security: []
 *     components:
 *       schemas:
 *         DecryptedUserData:
 *           type: object
 *           properties:
 *             peacekeeper_id:
 *               type: integer
 *               example: 123
 *             full_name:
 *               type: string
 *               example: "John Doe"
 *             country:
 *               type: string
 *               example: "USA"
 *             email_id:
 *               type: string
 *               format: email
 *               example: "john.doe@example.com"
 *             mobile_number:
 *               type: string
 *               example: "+1234567890"
 *             dob:
 *               type: string
 *               example: "1990-01-01"
 *             file_name:
 *               type: string
 *               format: uri
 *               example: "https://example.com/uploads/profile.jpg"
 *             country_code:
 *               type: string
 *               example: "US"
 *             Id_no:
 *               type: string
 *               example: "PK123456"
 *             url:
 *               type: string
 *               format: uri
 *               example: "https://example.com/uploads/batch/photo/CODE123.png"
 *             QR_CODE:
 *               type: string
 *               example: "QR123456"
 *             coupon_code:
 *               type: string
 *               example: "CODE123"
 */
router.post('/login-peacekeeper', authenicate.login_peacekeeper);

/**
 * @swagger
 * /api/v1/download_badge/{email}:
 *   get:
 *     summary: Download peacekeeper badge
 *     tags: [Authentication]
 *     description: Retrieves badge photo URL for a peacekeeper based on email
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Peacekeeper's email address
 *         example: "john.doe@example.com"
 *     responses:
 *       200:
 *         description: Badge URLs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 badge_photo_url:
 *                   type: string
 *                   format: uri
 *                   example: "https://example.com/uploads/batch/photo/CODE123.png"
 *       404:
 *         description: Peacekeeper not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "No details Found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   oneOf:
 *                     - example: "email_id is required"
 *                     - example: "Internal Server Error"
 */
router.get('/download_badge/:email', authenicate.download_badge);

/**
 * @swagger
 * /api/v1/amb_badge:
 *   post:
 *     summary: Generate ambassador badge
 *     tags: [Authentication]
 *     description: Generates badge image and PDF for ambassador with QR code
 *     responses:
 *       201:
 *         description: Badge generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Peacekeeper profile created successfully."
 *                 QR_code:
 *                   type: string
 *                   format: uri
 *                   example: "https://example.com/uploads/delegates/COTU-0000001-A.png"
 *                 batch:
 *                   type: string
 *                   format: uri
 *                   example: "https://example.com/uploads/batch/photo/COTU-0000001-A.png"
 *                 Data:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                       example: "Abdesattar Ben Moussa"
 *                     country:
 *                       type: string
 *                       example: "TUNISIA"
 *                     email:
 *                       type: string
 *                       example: ""
 *                     idNo:
 *                       type: string
 *                       example: "TU-0000001-A"
 *                     file_name:
 *                       type: string
 *                       example: "Abdesattar Ben Moussa.png"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Error generating badge"
 */
router.post('/amb_badge', authenicate.amb_badge);


/**
 * @swagger
 * /api/v1/edit-peacekeeper:
 *   put:
 *     summary: Update peacekeeper details
 *     tags: [Authentication]
 *     description: Update peacekeeper information including profile picture and generate new badge
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: profile_picture
 *         type: file
 *         description: Profile picture file
 *       - in: formData
 *         name: encrypted_data
 *         type: string
 *         required: true
 *         description: Encrypted JSON containing peacekeeper details
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               description: Peacekeeper ID
 *             full_name:
 *               type: string
 *               maxLength: 250
 *             mobile_number:
 *               type: string
 *               maxLength: 20
 *             dob:
 *               type: string
 *               maxLength: 20
 *     responses:
 *       201:
 *         description: Peacekeeper updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Peacekeeper edit created successfully."
 *                 QR_code:
 *                   type: string
 *                   format: uri
 *                   example: "https://example.com/uploads/delegates/CODE123.png"
 *                 batch:
 *                   type: string
 *                   format: uri
 *                   example: "https://example.com/uploads/batch/photo/CODE123.png"
 *                 Data:
 *                   type: object
 *                   properties:
 *                     result:
 *                       type: string
 *                       example: "Updated successfully"
 *                     full_name:
 *                       type: string
 *                     mobile_no:
 *                       type: string
 *                     dob:
 *                       type: string
 *                     file_name:
 *                       type: string
 *                     file_path:
 *                       type: string
 *                     file_type:
 *                       type: string
 *                     p_id_no:
 *                       type: string
 *                     check_email:
 *                       type: integer
 *                     p_coupon_code:
 *                       type: string
 *                     qr_code:
 *                       type: string
 *                     country_code:
 *                       type: string
 *                     email_id:
 *                       type: string
 *                     mobile_number:
 *                       type: string
 *       500:
 *         description: Error updating peacekeeper
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "All field is required"
 */
router.put('/edit-peacekeeper', upload.single('profile_picture'), authenicate.edit_peacekeeper);

/**
 * @swagger
 * /api/v1/get_peacekeeper_details_by_id:
 *   post:
 *     summary: Get peacekeeper details by ID
 *     tags: [Authentication]
 *     description: Retrieves detailed information about a peacekeeper by their ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - peace_id
 *             properties:
 *               peace_id:
 *                 type: integer
 *                 description: Peacekeeper ID
 *                 example: 123
 *     responses:
 *       200:
 *         description: Peacekeeper details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: string
 *                   description: Encrypted peacekeeper details containing
 *                   example: "encrypted_string_containing_details"
 *                   schema:
 *                     type: object
 *                     properties:
 *                       peacekeeper_id:
 *                         type: integer
 *                       full_name:
 *                         type: string
 *                       country:
 *                         type: string
 *                       email_id:
 *                         type: string
 *                       mobile_number:
 *                         type: string
 *                       dob:
 *                         type: string
 *                       file_name:
 *                         type: string
 *                         format: uri
 *                       Id_no:
 *                         type: string
 *                       QR_CODE:
 *                         type: string
 *                       coupon_code:
 *                         type: string
 *                         format: uri
 *                       url:
 *                         type: string
 *       500:
 *         description: Error retrieving peacekeeper details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   oneOf:
 *                     - example: "All field is required"
 *                     - example: "No details found"
 *                     - example: "Internal Server Error"
 */
router.post('/get_peacekeeper_details_by_id', authenicate.peacekeeper_details_id);

/**
 * @swagger
 * /api/v1/get_all_delegate_details_by:
 *   post:
 *     summary: Get delegate details by reference code
 *     tags: [Authentication]
 *     description: Retrieves delegate information based on reference number with pagination
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reference_code
 *               - p_limit
 *             properties:
 *               reference_code:
 *                 type: string
 *                 maxLength: 20
 *                 description: Reference number of the delegate
 *                 example: "REF123456"
 *               p_limit:
 *                 type: integer
 *                 description: Number of records to return
 *                 example: 10
 *     responses:
 *       200:
 *         description: Delegate details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: string
 *                   description: Encrypted array of delegate details containing
 *                   example: "encrypted_string_containing_details"
 *                   schema:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         title:
 *                           type: string
 *                         first_name:
 *                           type: string
 *                         last_name:
 *                           type: string
 *                         department:
 *                           type: string
 *                         designation:
 *                           type: string
 *                         mobile_number:
 *                           type: string
 *                         email_id:
 *                           type: string
 *                         company_name:
 *                           type: string
 *                         country:
 *                           type: string
 *                         state:
 *                           type: string
 *                         city:
 *                           type: string
 *       500:
 *         description: Error retrieving delegate details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   oneOf:
 *                     - example: "All field is required"
 *                     - example: "No details found"
 *                     - example: "Internal Server Error"
 */
router.post('/get_all_delegate_details_by', authenicate.get_delegate_details_id);
router.post('/QR_CODE', authenicate.tinyurl_QR_code);
module.exports = router;