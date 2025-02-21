// const express = require("express");
// const router = express.Router();
// const delegate_registration = require("../controllers/delegate_registration");
// // Apply token authentication middleware to all routes
// // Retrieve all leaves


// // Create a new leaves
// // router.post("/create", delegate_registration.Delegatedetails);

// // // Get All Non-Registered & Approved Data in Delegate Form

// module.exports = router;
const express = require('express');
const router = express.Router();
const delegateProfileController = require('../controllers/delegateProfileController');


/**
 * @swagger
 * tags:
 *   name: Delegates profile
 *   description: Delegate Profile and management
 */


// Define the route for creating delegate profile
/**
 * @swagger
 * /api/v1/delegate/create-delegate-profile:
 *   post:
 *     summary: Create new delegate profile
 *     tags: [Delegates profile]
 *     description: Creates a new delegate profile with validation and email notification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - first_name
 *               - last_name
 *               - country_code
 *               - mobile_number
 *               - email_id
 *               - dob
 *               - profession_1
 *               - country
 *               - city
 *               - attendee_purpose
 *               - conference_lever_interest
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 15
 *                 example: "Mr"
 *               first_name:
 *                 type: string
 *                 maxLength: 115
 *                 example: "John"
 *               last_name:
 *                 type: string
 *                 maxLength: 115
 *                 example: "Doe"
 *               country_code:
 *                 type: string
 *                 maxLength: 45
 *                 example: "+1"
 *               mobile_number:
 *                 type: string
 *                 maxLength: 45
 *                 pattern: '^\d+$'
 *                 example: "1234567890"
 *               email_id:
 *                 type: string
 *                 maxLength: 125
 *                 format: email
 *                 example: "john.doe@example.com"
 *               linkedIn_profile:
 *                 type: string
 *                 maxLength: 100
 *                 example: "linkedin.com/in/johndoe"
 *               instagram_profile:
 *                 type: string
 *                 maxLength: 100
 *                 example: "instagram.com/johndoe"
 *               dob:
 *                 type: string
 *                 format: date
 *                 pattern: '^\d{4}-\d{2}-\d{2}$'
 *                 example: "1990-01-01"
 *               profession_1:
 *                 type: string
 *                 maxLength: 250
 *                 example: "Software Engineer"
 *               profession_2:
 *                 type: string
 *                 maxLength: 250
 *                 example: "Project Manager"
 *               website:
 *                 type: string
 *                 maxLength: 225
 *                 example: "www.example.com"
 *               organization_name:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Tech Corp"
 *               address:
 *                 type: string
 *                 maxLength: 250
 *                 example: "123 Main St"
 *               country:
 *                 type: string
 *                 maxLength: 100
 *                 example: "United States"
 *               state:
 *                 type: string
 *                 maxLength: 100
 *                 example: "California"
 *               city:
 *                 type: string
 *                 maxLength: 100
 *                 example: "San Francisco"
 *               pin_code:
 *                 type: integer
 *                 example: 94105
 *               attend_summit:
 *                 type: integer
 *                 enum: [0, 1]
 *                 example: 1
 *               attendee_purpose:
 *                 type: string
 *                 enum: ['0', '1', '2', '3', '4']
 *                 example: "1"
 *               conference_lever_interest:
 *                 type: string
 *                 maxLength: 250
 *                 example: "Technology"
 *               created_by:
 *                 type: string
 *                 maxLength: 45
 *                 example: "system"
 *               status:
 *                 type: string
 *                 enum: ['0', '1', '2']
 *                 example: "1"
 *               passport_no:
 *                 type: string
 *                 maxLength: 15
 *                 example: "A1234567"
 *               passport_issue_by:
 *                 type: string
 *                 maxLength: 45
 *                 example: "USA"
 *               reference_no:
 *                 type: string
 *                 maxLength: 50
 *                 example: "REF123"
 *               country_id:
 *                 type: integer
 *                 example: 1
 *               state_id:
 *                 type: integer
 *                 example: 1
 *               city_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Delegate profile created successfully
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
 *                 url:
 *                   type: string
 *                   format: uri
 *                   example: "https://payment.gateway.com/session/123"
 *                 message:
 *                   type: string
 *                   example: "Delegate profile registered successfully.You are now being redirected to the payment gateway."
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
 *                   oneOf:
 *                     - example: "email_id is required"
 *                     - example: "mobile_number should be a valid number"
 *                     - example: "dob should be in the format YYYY-MM-DD"
 *                     - example: "dob should be a past date"
 *                     - example: "This details already exist in this Form"
 *                     - example: "Coupon code invalid"
 *                     - example: "Unknown error occurred."
 */
router.post('/create-delegate-profile', delegateProfileController.createDelegateProfile);
router.post('/create-nomination-profile', delegateProfileController.createNominateProfile);

/** 
 * @swagger
 * /api/v1/delegate/verify_session_stripe_payment:
 *   post:
 *     summary: Verify Stripe payment session and generate delegate QR code
 *     tags: [Delegates profile]
 *     description: Verifies payment status, generates QR code, and creates delegate ticket
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: Stripe checkout session ID
 *                 example: "cs_test_a1b2c3d4e5f6g7h8i9j0"
 *     responses:
 *       200:
 *         description: Payment verified and ticket generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   enum: ["inserted successfully", "No details found"]
 *                   example: "inserted successfully"
 *                 status_id:
 *                   type: integer
 *                   enum: [0, 1]
 *                   example: 1
 *                 delegate_id:
 *                   type: integer
 *                   example: 123
 *                 first_name:
 *                   type: string
 *                   example: "John"
 *                 last_name:
 *                   type: string
 *                   example: "Doe"
 *                 qr_url:
 *                   type: string
 *                   format: uri
 *                   example: "https://devglobaljusticeapis.cylsys.com/uploads/ticket/photo/ABC123.png"
 *                 random_id:
 *                   type: string
 *                   example: "ABC123"
 *                 title:
 *                   type: string
 *                   example: "Mr"
 *                 nominations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       TND_NOMINATION_NAME:
 *                         type: string
 *                         example: "Jane Doe"
 *                       TND_EMAIL:
 *                         type: string
 *                         format: email
 *                         example: "jane.doe@example.com"
 *                       TND_Nomination_id:
 *                         type: string
 *                         example: "NOM123"
 *                 parent_details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         example: "Mr"
 *                       first_name:
 *                         type: string
 *                         example: "John"
 *                       last_name:
 *                         type: string
 *                         example: "Doe"
 *                       email_id:
 *                         type: string
 *                         format: email
 *                         example: "john.doe@example.com"
 *                       random_id:
 *                         type: string
 *                         example: "ABC123"
 *       400:
 *         description: Error processing payment or generating ticket
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error processing payment or generating ticket"
 */
router.post('/verify_session_stripe_payment', delegateProfileController.verify_session_status);

module.exports = router;
