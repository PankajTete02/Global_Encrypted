// routes/contactUsRoutes.js
const express = require('express');
const router = express.Router();
const contactUsController = require('../controllers/contactUsController');


/**
 * @swagger
 * tags:
 *   name: Contact Us
 *   description: Contact Us management endpoints
 */
/** 
 * @swagger
 * /api/v1/contact_us:
 *   post:
 *     summary: Create a new contact us entry
 *     tags: [Contact Us]
 *     description: Submit a new contact form with user details and question
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - email
 *               - firstName
 *               - lastName
 *               - countryCode
 *               - phoneNumber
 *               - yourQuestion
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 50
 *                 description: Title/salutation of the contact person
 *                 example: "Mr"
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 100
 *                 description: Email address of the contact person
 *                 example: "john.doe@example.com"
 *               firstName:
 *                 type: string
 *                 maxLength: 100
 *                 description: First name of the contact person
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 maxLength: 100
 *                 description: Last name of the contact person
 *                 example: "Doe"
 *               countryCode:
 *                 type: string
 *                 maxLength: 45
 *                 description: Country code for phone number
 *                 example: "+1"
 *               phoneNumber:
 *                 type: string
 *                 maxLength: 15
 *                 description: Contact phone number
 *                 example: "1234567890"
 *               yourQuestion:
 *                 type: string
 *                 description: The question or message from the contact person
 *                 example: "I would like to know more about the event schedule."
 *     responses:
 *       201:
 *         description: Contact created successfully and email sent
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
 *                   example: "Contact created successfully, email sent."
 *                 data:
 *                   type: object
 *                   description: Database response
 *                 emailInfo:
 *                   type: object
 *                   description: Email sending information
 *       500:
 *         description: Error creating contact or sending email
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
 *                   example: "Error creating contact."
 *                 details:
 *                   type: object
 *                   description: Error details
 */
// POST request to create a contact form entry
router.post('/contact_us', contactUsController.createContact);

/**
 * @swagger
 * /api/v1/invite_speakers:
 *   get:
 *     summary: Get all invited speakers list
 *     tags: [Contact Us]
 *     description: Retrieves the complete list of invited speakers with their details
 *     responses:
 *       200:
 *         description: Speaker list retrieved successfully
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
 *                   example: "Details fetched successfully."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       ID:
 *                         type: integer
 *                         description: Unique identifier for the speaker
 *                         example: 1
 *                       Name:
 *                         type: string
 *                         maxLength: 100
 *                         description: Full name of the speaker
 *                         example: "John Doe"
 *                       Profession_Position:
 *                         type: string
 *                         maxLength: 100
 *                         description: Professional title or position of the speaker
 *                         example: "Chief Justice"
 *                       Is_Active:
 *                         type: boolean
 *                         description: Speaker's active status
 *                         example: true
 *                       Created_at:
 *                         type: string
 *                         format: date-time
 *                         description: Timestamp when the speaker was added
 *                         example: "2024-03-25T10:30:00Z"
 *       500:
 *         description: Error retrieving speaker list
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
 *                   example: "Error fetching invite speaker list."
 *                 details:
 *                   type: object
 *                   description: Error details
 */
router.get('/invite_speakers', contactUsController.getAllInviteSpeakers);

module.exports = router;
