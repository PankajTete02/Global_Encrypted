const express = require('express');
const router = express.Router();
const peacekeeperController = require('../controllers/peacekeeperController');



/**
 * @swagger
 * tags:
 *   name: Peacekeepers
 *   description: Endpoints for managing peacekeeper profiles
 */


/**
 * @swagger
 * /api/v1/create-peacekeeper:
 *   post:
 *     summary: Create a new peacekeeper profile
 *     tags: [Peacekeepers]
 *     description: Creates a new peacekeeper with profile image and generates QR code badge
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - email_id
 *               - mobile_number
 *               - dob
 *             properties:
 *               full_name:
 *                 type: string
 *                 maxLength: 200
 *                 example: "John Doe"
 *               country:
 *                 type: string
 *                 maxLength: 100
 *                 example: "India"
 *               email_id:
 *                 type: string
 *                 maxLength: 255
 *                 format: email
 *                 example: "john.doe@example.com"
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *               mobile_number:
 *                 type: string
 *                 maxLength: 20
 *                 pattern: "^\\+\\d{1,6} \\d+$"
 *                 example: "+91 9876543210"
 *               country_code:
 *                 type: string
 *                 maxLength: 5
 *                 example: "IN"
 *               profile_image:
 *                 type: string
 *                 format: binary
 *                 description: Profile image (.jpg, .jpeg, .png only)
 *               Check_email:
 *                 type: boolean
 *                 example: true
 *               url:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com"
 *               is_active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Peacekeeper created successfully
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
 *                 message1:
 *                   type: string
 *                   example: "success"
 *                 peacekeeper_id:
 *                   type: integer
 *                   example: 123
 *                 QR_code:
 *                   type: string
 *                   format: uri
 *                   example: "https://example.com/uploads/delegates/CO-IN-0000123-W.png"
 *                 batch:
 *                   type: string
 *                   format: uri
 *                   example: "https://example.com/uploads/batch/photo/CO-IN-0000123-W.png"
 *       400:
 *         description: Validation error or duplicate entry
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
 *                   example: "Email ID already exists."
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
 *                   example: "Server error"
 */
// Route to create a peacekeeper with file upload
router.post('/create-peacekeeper', peacekeeperController.createPeacekeeper);


/**
 * @swagger
 * /api/v1/peacekeeper/{id}:
 *   get:
 *     summary: Get peacekeeper details by ID
 *     tags: [Peacekeepers]
 *     description: Retrieves peacekeeper information based on Check_email flag
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Peacekeeper ID
 *         example: 123
 *     responses:
 *       200:
 *         description: Peacekeeper data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Peacekeeper data retrieved successfully"
 *                 QR_code:
 *                   type: string
 *                   format: uri
 *                   example: "https://example.com/uploads/delegates/CO-IN-0000123-W.png"
 *                 data:
 *                   type: object
 *                   properties:
 *                     Name:
 *                       type: string
 *                       example: "John Doe"
 *                     Country:
 *                       type: string
 *                       example: "India"
 *                     Email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                       description: Only included if Check_email is 1
 *                     Phone:
 *                       type: string
 *                       example: "+91 9876543210"
 *                       description: Only included if Check_email is 1
 *                     DOB:
 *                       type: string
 *                       example: "1990-01-01"
 *                     File_Name:
 *                       type: string
 *                       example: "profile123.jpg"
 *                     ID_NO:
 *                       type: string
 *                       example: "IN-0000123-W"
 *                     coupon_code:
 *                       type: string
 *                       example: "COIN-0000123-W"
 *                     file_urls:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "https://example.com/uploads/profile123.jpg"
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Peacekeeper ID is required"
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
 *                 message:
 *                   type: string
 *                   example: "Peacekeeper not found"
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
 *                 message:
 *                   type: string
 *                   example: "Server error, please try again later"
 */
router.get('/peacekeeper/:id', peacekeeperController.getPeacekeeperData);


/**
 * @swagger
 * /api/v1/getAllpeacekeeper:
 *   get:
 *     summary: Get all peacekeeper data with pagination, sorting and search
 *     tags: [Peacekeepers]
 *     description: Retrieves a paginated list of all active peacekeepers with optional search and sorting
 *     parameters:
 *       - in: query
 *         name: page_no
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 1
 *         description: Page number
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Number of records per page
 *       - in: query
 *         name: admin_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the admin making the request
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Global search term for name, email, mobile, country, or DOB
 *       - in: query
 *         name: sort_column
 *         schema:
 *           type: string
 *           enum: [created_at, full_name, email_id, country]
 *         description: Column to sort by
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Sort direction
 *     responses:
 *       200:
 *         description: Peacekeeper data fetched successfully
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
 *                   type: array
 *                   items:
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
 *                         type: array
 *                         items:
 *                           type: string
 *                           format: uri
 *                       Check_email:
 *                         type: string
 *                       is_active:
 *                         type: integer
 *                         enum: [1]
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       country_code:
 *                         type: string
 *                       Id_no:
 *                         type: string
 *                       QR_CODE:
 *                         type: string
 *                       coupon_code:
 *                         type: string
 *                 message:
 *                   type: string
 *                   example: "Peacekeeper data fetched successfully."
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
 *                   example: "Server error."
 *                 details:
 *                   type: object
 */
router.post('/getAllpeacekeeper', peacekeeperController.getAllPeacekeeperData);

router.post('/getAllContactUsData', peacekeeperController.getAllContactUsData);


/**
 * @swagger
 * /api/v1/update_peacekeeper:
 *   post:
 *     summary: Update peacekeeper details and generate QR code badge
 *     tags: [Peacekeepers]
 *     description: Updates peacekeeper details, generates QR code, badge image, PDF, and sends email
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
 *                 description: Peacekeeper ID to update
 *                 example: 123
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
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     full_name:
 *                       type: string
 *                       example: "John Doe"
 *                     email_id:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     ID_NO:
 *                       type: string
 *                       example: "IN-0000123-W"
 *                     response:
 *                       type: string
 *                       example: "success"
 *                     qr_code:
 *                       type: string
 *                       example: "https://globaljusticeuat.cylsys.com/delegate-registration?code=COIN-0000123-W"
 *                     coupon_code:
 *                       type: string
 *                       example: "COIN-0000123-W"
 *                     mobile_number:
 *                       type: string
 *                       example: "+91 9876543210"
 *                     country_code:
 *                       type: string
 *                       example: "IN"
 *                     file_name:
 *                       type: string
 *                       example: "profile123.jpg"
 *                     check_email:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Invalid request
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
 *                   example: "All field are required"
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
 *                   example: "Server error"
 *                 errorMessage:
 *                   type: string
 */
router.post('/update_peacekeeper', peacekeeperController.update_Peacekeeper);


/**
 * @swagger
 * /api/v1/resend_email:
 *   post:
 *     summary: Resend email to peacekeeper
 *     tags: [Peacekeepers]
 *     description: Retrieves peacekeeper details and resends registration email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *                 description: Peacekeeper ID
 *                 example: 123
 *     responses:
 *       200:
 *         description: Email resent successfully
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
 *                   type: object
 *                   properties:
 *                     peacekeeper_id:
 *                       type: integer
 *                       example: 123
 *                     full_name:
 *                       type: string
 *                       example: "John Doe"
 *                     email_id:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     mobile_number:
 *                       type: string
 *                       example: "+91 9876543210"
 *                     url:
 *                       type: string
 *                       format: uri
 *                       example: "https://example.com/registration"
 *                     coupon_code:
 *                       type: string
 *                       example: "COIN-0000123-W"
 *                     QR_CODE:
 *                       type: string
 *                       format: uri
 *                       example: "https://example.com/qr/COIN-0000123-W"
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
 *                   example: "No details found"
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
 *                   example: "Server error."
 *                 details:
 *                   type: object
 */
router.post('/resend_email', peacekeeperController.getAllEmailData);



/**
 * @swagger
 * /api/v1/delete_peacekeeper:
 *   post:
 *     summary: Soft delete peacekeeper(s)
 *     tags: [Peacekeepers]
 *     description: Soft deletes one or multiple peacekeepers by setting is_active to 0
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - p_peace_id
 *             properties:
 *               p_peace_id:
 *                 type: string
 *                 description: Comma-separated list of peacekeeper IDs to delete
 *                 example: "1,2,3"
 *     responses:
 *       200:
 *         description: Peacekeeper(s) deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Updated Successfully"
 *                 error:
 *                   type: boolean
 *                   example: false
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Peacekeeper ID is required"
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
 *                 message:
 *                   type: string
 *                   example: "Server error, please try again later"
 */
router.post('/delete_peacekeeper', peacekeeperController.deletePeacekeeperData);


/**
 * @swagger
 * /api/v1/mail_discount_code:
 *   post:
 *     summary: Send discount code email to user
 *     tags: [Peacekeepers]
 *     description: Updates user status and sends discount code via email
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
 *                 description: User ID to send discount code
 *                 example: 123
 *     responses:
 *       200:
 *         description: Discount code sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     first_name:
 *                       type: string
 *                       example: "John"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "john.doe@example.com"
 *                     reference_no:
 *                       type: string
 *                       example: "REF123456"
 *                     response:
 *                       type: string
 *                       example: "success"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: object
 *                   properties:
 *                     result:
 *                       type: string
 *                       example: "No details found"
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
 *                   example: "Server error"
 */
router.post('/mail_discount_code', peacekeeperController.discountPeacekeeperData);


/**
 * @swagger
 * /api/v1/create_session_stripe:
 *   post:
 *     summary: Create Stripe payment session
 *     tags: [Peacekeepers]
 *     description: Creates a Stripe checkout session based on user email and reference number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "john.doe@example.com"
 *     responses:
 *       200:
 *         description: Stripe session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   format: uri
 *                   description: Stripe checkout session URL
 *                   example: "https://checkout.stripe.com/c/pay/cs_test_xxx"
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User mail is required"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   example: "No details found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Error creating Stripe session"
 */
router.post('/create_session_stripe', peacekeeperController.session_status);


/**
 * @swagger
 * /api/v1/getAllpeacekeeperDropdown:
 *   get:
 *     summary: Get all active peacekeepers for dropdown
 *     tags: [Peacekeepers]
 *     description: Retrieves a list of active peacekeepers with basic information for dropdown menus
 *     responses:
 *       200:
 *         description: Peacekeeper data fetched successfully
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       peacekeeper_id:
 *                         type: integer
 *                         example: 123
 *                       full_name:
 *                         type: string
 *                         example: "John Doe"
 *                       coupon_code:
 *                         type: string
 *                         example: "PEACE123"
 *                 message:
 *                   type: string
 *                   example: "Peacekeeper data fetched successfully."
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
 *                   example: "Server error."
 *                 details:
 *                   type: object
 */
router.get('/getAllpeacekeeperDropdown', peacekeeperController.getAllPeacekeeperDropdown);



// router.post('/amb_badge', peacekeeperController.amb_badge);

module.exports = router;
