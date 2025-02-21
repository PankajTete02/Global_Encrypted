const express = require("express");
const router = express.Router();
const delegate_registration = require("../controllers/delegate_registration");
// Apply token authentication middleware to all routes



 
/**
 * @swagger
 * tags:
 *   name: Delegates
 *   description: Delegate registration and management
 */

// Retrieve all leaves
router.get("/getAll", delegate_registration.findAll);



/**
 * @swagger
 * /api/v1/create:
 *   post:
 *     summary: Create new delegate registration
 *     tags: [Delegates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - registration_type
 *               - title
 *               - first_name
 *               - last_name
 *               - mobile_number
 *               - email_id
 *               - country
 *               - terms_condition
 *             properties:
 *               registration_type:
 *                 type: string
 *                 enum: ['1', '2', '3']
 *                 example: "1"
 *                 description: 1=Delegate, 2=Speaker, 3=Partner
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
 *               department:
 *                 type: string
 *                 maxLength: 150
 *                 example: "IT"
 *               designation:
 *                 type: string
 *                 maxLength: 75
 *                 example: "Manager"
 *               mobile_number:
 *                 type: string
 *                 maxLength: 10
 *                 example: "9876543210"
 *               email_id:
 *                 type: string
 *                 maxLength: 125
 *                 format: email
 *                 example: "john@example.com"
 *               company_name:
 *                 type: string
 *                 maxLength: 150
 *                 example: "Tech Corp"
 *               company_address:
 *                 type: string
 *                 maxLength: 300
 *               address_line_1:
 *                 type: string
 *                 maxLength: 250
 *               address_line_2:
 *                 type: string
 *                 maxLength: 250
 *               address_line_3:
 *                 type: string
 *                 maxLength: 250
 *               country:
 *                 type: integer
 *                 example: 1
 *               state:
 *                 type: integer
 *                 example: 1
 *               city:
 *                 type: integer
 *                 example: 1
 *               pin_code:
 *                 type: integer
 *               website:
 *                 type: string
 *                 maxLength: 225
 *               conference_day:
 *                 type: string
 *                 maxLength: 225
 *               attending_purpose:
 *                 type: string
 *                 maxLength: 455
 *               specific_solution:
 *                 type: string
 *                 maxLength: 45
 *               attended_innopack:
 *                 type: string
 *                 maxLength: 20
 *               is_whatsapp_number:
 *                 type: integer
 *                 enum: [0, 1]
 *                 example: 1
 *               terms_condition:
 *                 type: integer
 *                 enum: [0, 1]
 *                 example: 1
 *               events:
 *                 type: string
 *                 example: ""
 *               refrence_url:
 *                 type: string
 *                 maxLength: 200
 *               country_code:
 *                 type: string
 *                 maxLength: 200
 *                 example: "+91"
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     new_urn:
 *                       type: string
 *                       example: "IPDL10001"
 *       400:
 *         description: Error
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
 *                   example: "This email already exist in this Form"
 */
// Create a new leaves
router.post("/create", delegate_registration.Delegatedetails);


// // Get All Non-Registered & Approved Data in Delegate Form
/**
 * @swagger
 * /api/v1/delegate/non-registered:
 *   post:
 *     summary: Get non-registered delegates list
 *     tags: [Delegates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - page_no
 *               - size_no
 *               - admin_id
 *             properties:
 *               page_no:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *                 description: Page number
 *               size_no:
 *                 type: integer
 *                 minimum: 1
 *                 example: 10
 *                 description: Records per page
 *               admin_id:
 *                 type: integer
 *                 example: 1
 *                 description: Admin ID for validation
 *               name:
 *                 type: string
 *                 example: "John"
 *                 description: Search by delegate name
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *                 description: Search by email
 *               sort_column:
 *                 type: string
 *                 example: "created_date"
 *                 enum: [created_date, first_name]
 *               sort_order:
 *                 type: string
 *                 enum: [ASC, DESC]
 *                 example: "DESC"
 *     responses:
 *       200:
 *         description: Success
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
 *                   example: "Delegate Details fetched successfully!"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       first_name:
 *                         type: string
 *                       email_id:
 *                         type: string
 *                       refrence:
 *                         type: string
 *                       cm_name:
 *                         type: string
 *                       state_name:
 *                         type: string
 *                       city_name:
 *                         type: string
 *                       reference_no:
 *                         type: string
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Invalid page number or size."
 */
router.post("/delegate/non-registered", delegate_registration.findById);


/**
 * @swagger
 * /api/v1/delegate/approved:
 *   post:
 *     summary: Get approved delegates with pagination, search, and sorting
 *     tags: [Delegates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - page_no
 *               - size_no
 *               - admin_id
 *             properties:
 *               page_no:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *                 description: Page number for pagination
 *               size_no:
 *                 type: integer
 *                 minimum: 1
 *                 example: 10
 *                 description: Number of records per page
 *               admin_id:
 *                 type: integer
 *                 example: 1
 *                 description: Admin ID for validation
 *               search:
 *                 type: string
 *                 example: "John"
 *                 description: Global search across multiple fields
 *               sort_column:
 *                 type: string
 *                 example: "first_name"
 *                 description: Column name to sort by
 *               sort_order:
 *                 type: string
 *                 enum: [ASC, DESC]
 *                 example: "ASC"
 *                 description: Sort direction
 *     responses:
 *       200:
 *         description: Success
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
 *                   example: "Approve Delegate Details fetched successfully!"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       first_name:
 *                         type: string
 *                       last_name:
 *                         type: string
 *                       email_id:
 *                         type: string
 *                       country_name:
 *                         type: string
 *                       state_name:
 *                         type: string
 *                       city_name:
 *                         type: string
 *                       TUD_TRANSCATION_ID:
 *                         type: string
 *                       TUD_STATUS:
 *                         type: string
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Invalid page number or size."
 */
router.post("/delegate/approved", delegate_registration.findByApproved);

// // Get All Non-Registered & Approved Data in Partner Form

/**
 * @swagger
 * /api/v1/partner/non-registered:
 *   get:
 *     summary: Get list of non-registered partners
 *     tags: [Delegates]
 *     responses:
 *       200:
 *         description: Success
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
 *                   example: "Partner Details fetched successfully!"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                       registration_type:
 *                         type: string
 *                         enum: ['1', '2', '3']
 *                       title:
 *                         type: string
 *                       first_name:
 *                         type: string
 *                       last_name:
 *                         type: string
 *                       email_id:
 *                         type: string
 *                       mobile_number:
 *                         type: string
 *                       company_name:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: ['0', '1', '2']
 *                       country_name:
 *                         type: string
 *                       state_name:
 *                         type: string
 *                       city_name:
 *                         type: string
 *                       refrence:
 *                         type: string
 *                       created_date:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Something went wrong. Please try again."
 */
router.get("/partner/non-registered", delegate_registration.findByPartner);


/**
 * @swagger
 * /api/v1/partner/approved:
 *   get:
 *     summary: Get list of approved partners
 *     tags: [Delegates]
 *     responses:
 *       200:
 *         description: Success
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
 *                   example: "Approve Partner Details fetched successfully!"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                         example: 1
 *                       registration_type:
 *                         type: string
 *                         enum: ['1', '2', '3']
 *                         example: '2'
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
 *                         example: "john@example.com"
 *                       mobile_number:
 *                         type: string
 *                         example: "9876543210"
 *                       company_name:
 *                         type: string
 *                         example: "Tech Corp"
 *                       country_name:
 *                         type: string
 *                         example: "India"
 *                       state_name:
 *                         type: string
 *                         example: "Maharashtra"
 *                       city_name:
 *                         type: string
 *                         example: "Mumbai"
 *                       refrence:
 *                         type: string
 *                       urn_no:
 *                         type: string
 *                         example: "IPDL20001"
 *                       status:
 *                         type: string
 *                         enum: ['0', '1', '2']
 *                         example: '1'
 *                       updated_date:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Something went wrong. Please try again."
 */
router.get("/partner/approved", delegate_registration.findByApprovePartner);

// // Get All Non-Registered & Approved Data in Speaker Form
/**
 * @swagger
 * /api/v1/speaker/non-registered:
 *   get:
 *     summary: Get list of non-registered speakers
 *     tags: [Delegates]
 *     responses:
 *       200:
 *         description: Success
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
 *                   example: "Speaker Details fetched successfully!"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                         example: 1
 *                       registration_type:
 *                         type: string
 *                         enum: ['1', '2', '3']
 *                         example: '3'
 *                       title:
 *                         type: string
 *                         example: "Dr"
 *                       first_name:
 *                         type: string
 *                         example: "John"
 *                       last_name:
 *                         type: string
 *                         example: "Doe"
 *                       designation:
 *                         type: string
 *                         example: "Professor"
 *                       email_id:
 *                         type: string
 *                         example: "john.doe@example.com"
 *                       mobile_number:
 *                         type: string
 *                         example: "9876543210"
 *                       company_name:
 *                         type: string
 *                         example: "University"
 *                       country_name:
 *                         type: string
 *                         example: "India"
 *                       state_name:
 *                         type: string
 *                         example: "Maharashtra"
 *                       city_name:
 *                         type: string
 *                         example: "Mumbai"
 *                       refrence:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: ['0', '1', '2']
 *                         example: '0'
 *                       created_date:
 *                         type: string
 *                         format: date-time
 *                       urn_no:
 *                         type: string
 *                         example: "IPDL30001"
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Something went wrong. Please try again."
 */
router.get("/speaker/non-registered", delegate_registration.findBySpeaker);


/**
 * @swagger
 * /api/v1/speaker/approved:
 *   get:
 *     summary: Get list of approved speakers
 *     tags: [Delegates]
 *     responses:
 *       200:
 *         description: Success
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
 *                   example: "Approve Speaker Details fetched successfully!"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                         example: 1
 *                       registration_type:
 *                         type: string
 *                         enum: ['1', '2', '3']
 *                         example: '3'
 *                       title:
 *                         type: string
 *                         example: "Dr"
 *                       first_name:
 *                         type: string
 *                         example: "John"
 *                       last_name:
 *                         type: string
 *                         example: "Doe"
 *                       designation:
 *                         type: string
 *                         example: "Professor"
 *                       email_id:
 *                         type: string
 *                         example: "john.doe@example.com"
 *                       mobile_number:
 *                         type: string
 *                         example: "9876543210"
 *                       company_name:
 *                         type: string
 *                         example: "University"
 *                       country_name:
 *                         type: string
 *                         example: "India"
 *                       state_name:
 *                         type: string
 *                         example: "Maharashtra"
 *                       city_name:
 *                         type: string
 *                         example: "Mumbai"
 *                       refrence:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: ['0', '1', '2']
 *                         example: '1'
 *                       updated_date:
 *                         type: string
 *                         format: date-time
 *                       urn_no:
 *                         type: string
 *                         example: "IPDL30001"
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Something went wrong. Please try again."
 */
router.get("/speaker/approved", delegate_registration.findByApproveSpeaker);

// // Update a departmentdetails with id

/**
 * @swagger
 * /api/v1/approve/{user_id}:
 *   put:
 *     summary: Approve user registration
 *     tags: [Delegates]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID(s) to approve. Can be single ID or comma-separated IDs
 *         example: "1,2,3"
 *     responses:
 *       200:
 *         description: Success
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
 *                   example: "Form Details Apporove Successfully!"
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Something went wrong. Please try again."
 */
router.put("/approve/:user_id", delegate_registration.update_approve);


/**
 * @swagger
 * /api/v1/status:
 *   put:
 *     summary: Update user status (approve/reject) with badge generation
 *     tags: [Delegates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - status
 *               - user_name
 *               - user_email
 *               - company
 *               - designation
 *               - updated_by
 *               - urn_no
 *               - qr_code
 *               - user_number
 *               - form_name
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: Single ID or comma-separated IDs
 *                 example: "1,2,3"
 *               status:
 *                 type: integer
 *                 enum: [1, 2]
 *                 description: 1=Approve, 2=Reject
 *                 example: 1
 *               user_name:
 *                 type: string
 *                 description: Single name or comma-separated names
 *                 example: "John Doe,Jane Smith"
 *               user_email:
 *                 type: string
 *                 description: Single email or comma-separated emails
 *                 example: "john@example.com,jane@example.com"
 *               company:
 *                 type: string
 *                 description: Single company or comma-separated companies
 *                 example: "Tech Corp,Dev Inc"
 *               designation:
 *                 type: string
 *                 description: Single designation or comma-separated designations
 *                 example: "Manager,Director"
 *               updated_by:
 *                 type: string
 *                 example: "admin"
 *               urn_no:
 *                 type: string
 *                 description: Single URN or comma-separated URNs
 *                 example: "IPDL10001,IPDL10002"
 *               qr_code:
 *                 type: string
 *                 description: Single QR code or pipe-separated QR codes
 *                 example: "QR1|QR2"
 *               user_number:
 *                 type: string
 *                 description: Single number or comma-separated numbers
 *                 example: "9876543210,9876543211"
 *               form_name:
 *                 type: string
 *                 example: "registration"
 *     responses:
 *       200:
 *         description: Success
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
 *                   example: "Status Updated Successfully!"
 *       400:
 *         description: Error
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
 *                   example: "Invalid request! Found multiple IDs but no corresponding data"
 */
router.put('/status', delegate_registration.update_status);

// // Update a departmentdetails with id

/**
 * @swagger
 * /api/v1/unapprove/{user_id}:
 *   put:
 *     summary: Unapprove user registration(s)
 *     tags: [Delegates]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID(s) to unapprove. Can be single ID or comma-separated IDs
 *         example: "1,2,3"
 *     responses:
 *       200:
 *         description: Success
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
 *                   example: "Form Details Unapporove Successfully!"
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Something went wrong. Please try again."
 */
router.put("/unapprove/:user_id", delegate_registration.update_unapprove);

// // Delete a leave with id
/**
 * @swagger
 * /api/v1/delete:
 *   patch:
 *     summary: Soft delete user by setting is_active to 0
 *     tags: [Delegates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID of the user to delete
 *                 example: 1
 *     responses:
 *       200:
 *         description: Success
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
 *                   example: "User deleted successfully!"
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
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User does not exist with this id!"
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Something went wrong. Please try again."
 */
router.patch("/delete", delegate_registration.delete);

/**
 * @swagger
 * /api/v1/search:
 *   post:
 *     summary: Search for approved delegates
 *     tags: [Delegates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - search
 *             properties:
 *               search:
 *                 type: string
 *                 description: Search term to match against multiple fields
 *                 example: "john"
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum: ["Data exists", "Data does not exist"]
 *                   example: "Data exists"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                       first_name:
 *                         type: string
 *                       last_name:
 *                         type: string
 *                       email_id:
 *                         type: string
 *                       mobile_number:
 *                         type: string
 *                       designation:
 *                         type: string
 *                       department:
 *                         type: string
 *                       company_name:
 *                         type: string
 *                       registration_type:
 *                         type: string
 *                         enum: ['1', '2', '3']
 *                         example: '1'
 *                       status:
 *                         type: string
 *                         enum: ['0', '1', '2']
 *                         example: '1'
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error message"
 */
router.post('/search', delegate_registration.findBySearch_delegate_user);



/**
 * @swagger
 * /api/v1/user/partner/search:
 *   post:
 *     summary: Search for approved partners
 *     tags: [Delegates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - search
 *             properties:
 *               search:
 *                 type: string
 *                 description: Search term to match against multiple fields
 *                 example: "tech"
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum: ["Data exists", "Data does not exist"]
 *                   example: "Data exists"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                       first_name:
 *                         type: string
 *                       last_name:
 *                         type: string
 *                       email_id:
 *                         type: string
 *                       mobile_number:
 *                         type: string
 *                       designation:
 *                         type: string
 *                       department:
 *                         type: string
 *                       company_name:
 *                         type: string
 *                       registration_type:
 *                         type: string
 *                         enum: ['1', '2', '3']
 *                         example: '2'
 *                       status:
 *                         type: string
 *                         enum: ['0', '1', '2']
 *                         example: '1'
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error message"
 */
router.post('/user/partner/search', delegate_registration.findBySearch_partner_user);


/**
 * @swagger
 * /api/v1/user/speaker/search:
 *   post:
 *     summary: Search for approved speakers
 *     tags: [Delegates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - search
 *             properties:
 *               search:
 *                 type: string
 *                 description: Search term to match against multiple fields
 *                 example: "professor"
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum: ["Data exists", "Data does not exist"]
 *                   example: "Data exists"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                       first_name:
 *                         type: string
 *                       last_name:
 *                         type: string
 *                       email_id:
 *                         type: string
 *                       mobile_number:
 *                         type: string
 *                       designation:
 *                         type: string
 *                       department:
 *                         type: string
 *                       company_name:
 *                         type: string
 *                       registration_type:
 *                         type: string
 *                         enum: ['1', '2', '3']
 *                         example: '3'
 *                       status:
 *                         type: string
 *                         enum: ['0', '1', '2']
 *                         example: '1'
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error message"
 */
router.post('/user/speaker/search', delegate_registration.findBySearch_speaker_user);



/**
 * @swagger
 * /api/v1/nonregistered/delegate/search:
 *   post:
 *     summary: Search for non-registered delegates (pending or rejected)
 *     tags: [Delegates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - search
 *             properties:
 *               search:
 *                 type: string
 *                 description: Search term to match against multiple fields
 *                 example: "john"
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum: ["Data exists", "Data does not exist"]
 *                   example: "Data exists"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                       first_name:
 *                         type: string
 *                       last_name:
 *                         type: string
 *                       email_id:
 *                         type: string
 *                       mobile_number:
 *                         type: string
 *                       designation:
 *                         type: string
 *                       department:
 *                         type: string
 *                       company_name:
 *                         type: string
 *                       registration_type:
 *                         type: string
 *                         enum: ['1', '2', '3']
 *                         example: '1'
 *                       status:
 *                         type: string
 *                         enum: ['0', '1', '2']
 *                         description: '0=Pending, 2=Rejected'
 *                         example: '0'
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error message"
 */
router.post('/nonregistered/delegate/search', delegate_registration.findBySearch_delegate_nonregistered);


/**
 * @swagger
 * /api/v1/nonregistered/partner/search:
 *   post:
 *     summary: Search for non-registered partners (pending or rejected)
 *     tags: [Delegates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - search
 *             properties:
 *               search:
 *                 type: string
 *                 description: Search term to match against multiple fields
 *                 example: "tech"
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum: ["Data exists", "Data does not exist"]
 *                   example: "Data exists"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                       first_name:
 *                         type: string
 *                       last_name:
 *                         type: string
 *                       email_id:
 *                         type: string
 *                       mobile_number:
 *                         type: string
 *                       designation:
 *                         type: string
 *                       department:
 *                         type: string
 *                       company_name:
 *                         type: string
 *                       registration_type:
 *                         type: string
 *                         enum: ['1', '2', '3']
 *                         example: '2'
 *                       status:
 *                         type: string
 *                         enum: ['0', '1', '2']
 *                         description: '0=Pending, 2=Rejected'
 *                         example: '0'
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error message"
 */
router.post('/nonregistered/partner/search', delegate_registration.findBySearch_partner_nonregistered);

/**
 * @swagger
 * /api/v1/nonregistered/speaker/search:
 *   post:
 *     summary: Search for non-registered speakers (pending or rejected)
 *     tags: [Delegates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - search
 *             properties:
 *               search:
 *                 type: string
 *                 description: Search term to match against multiple fields
 *                 example: "professor"
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum: ["Data exists", "Data does not exist"]
 *                   example: "Data exists"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                       first_name:
 *                         type: string
 *                       last_name:
 *                         type: string
 *                       email_id:
 *                         type: string
 *                       mobile_number:
 *                         type: string
 *                       designation:
 *                         type: string
 *                       department:
 *                         type: string
 *                       company_name:
 *                         type: string
 *                       registration_type:
 *                         type: string
 *                         enum: ['1', '2', '3']
 *                         example: '3'
 *                       status:
 *                         type: string
 *                         enum: ['0', '1', '2']
 *                         description: '0=Pending, 2=Rejected'
 *                         example: '0'
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error message"
 */
router.post('/nonregistered/speaker/search', delegate_registration.findBySearch_speaker_nonregistered);




/**
 * @swagger
 * /api/v1/delegate/already:
 *   post:
 *     summary: Check if delegate already exists with given email, mobile or URN
 *     tags: [Delegates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - registration_type
 *               - email_id
 *               - mobile_number
 *               - urn_no
 *             properties:
 *               registration_type:
 *                 type: string
 *                 enum: ['1', '2', '3']
 *                 description: 1=Delegate, 2=Partner, 3=Speaker
 *                 example: '1'
 *               email_id:
 *                 type: string
 *                 format: email
 *                 maxLength: 125
 *                 example: "john@example.com"
 *               mobile_number:
 *                 type: string
 *                 maxLength: 10
 *                 example: "9876543210"
 *               urn_no:
 *                 type: string
 *                 maxLength: 20
 *                 example: "URN123456"
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Data is already exists."
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
 *                       user_id:
 *                         type: integer
 *                       first_name:
 *                         type: string
 *                       last_name:
 *                         type: string
 *                       email_id:
 *                         type: string
 *                       mobile_number:
 *                         type: string
 *                       country_name:
 *                         type: string
 *       400:
 *         description: Error or Not Found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Record not found. Please enter correct details."
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: boolean
 *                   example: true
 */
router.post('/delegate/already', delegate_registration.microsite_get_already_exixts_delegate);



/**
 * @swagger
 * /api/v1/partner/already:
 *   post:
 *     summary: Check if partner already exists with given email, mobile or URN
 *     tags: [Delegates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email_id
 *               - mobile_number
 *               - urn_no
 *             properties:
 *               email_id:
 *                 type: string
 *                 format: email
 *                 maxLength: 125
 *                 example: "partner@company.com"
 *               mobile_number:
 *                 type: string
 *                 maxLength: 10
 *                 example: "9876543210"
 *               urn_no:
 *                 type: string
 *                 maxLength: 20
 *                 example: "URN123456"
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Data is already exists"
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
 *                       user_id:
 *                         type: integer
 *                       first_name:
 *                         type: string
 *                       last_name:
 *                         type: string
 *                       email_id:
 *                         type: string
 *                       mobile_number:
 *                         type: string
 *                       company_name:
 *                         type: string
 *                       registration_type:
 *                         type: string
 *                         enum: ['1', '2', '3']
 *                         example: '2'
 *       400:
 *         description: Error or Not Found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Record not found. Please enter correct details."
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: boolean
 *                   example: true
 */
router.post('/partner/already', delegate_registration.microsite_get_already_exixts_partner);


/**
 * @swagger
 * /api/v1/speaker/already:
 *   post:
 *     summary: Check if speaker already exists with given email, mobile or URN
 *     tags: [Delegates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email_id
 *               - mobile_number
 *               - urn_no
 *             properties:
 *               email_id:
 *                 type: string
 *                 format: email
 *                 maxLength: 125
 *                 example: "speaker@university.com"
 *               mobile_number:
 *                 type: string
 *                 maxLength: 10
 *                 example: "9876543210"
 *               urn_no:
 *                 type: string
 *                 maxLength: 20
 *                 example: "URN123456"
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Data is already exists"
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
 *                       user_id:
 *                         type: integer
 *                       first_name:
 *                         type: string
 *                       last_name:
 *                         type: string
 *                       email_id:
 *                         type: string
 *                       mobile_number:
 *                         type: string
 *                       designation:
 *                         type: string
 *                       company_name:
 *                         type: string
 *                       registration_type:
 *                         type: string
 *                         enum: ['1', '2', '3']
 *                         example: '3'
 *       400:
 *         description: Error or Not Found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Record not found. Please enter correct details."
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: boolean
 *                   example: true
 */
router.post('/speaker/already', delegate_registration.microsite_get_already_exixts_speaker);

/**
 * @swagger
 * /api/v1/sendemail:
 *   post:
 *     summary: Send email with generated badge PDF to delegate
 *     tags: [Delegates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - user_name
 *               - user_email
 *               - company
 *               - designation
 *               - urn_no
 *               - qr_code
 *               - user_number
 *               - form_name
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *               user_name:
 *                 type: string
 *                 example: "John Doe"
 *               user_email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               company:
 *                 type: string
 *                 example: "Tech Corp"
 *               designation:
 *                 type: string
 *                 example: "Senior Developer"
 *               urn_no:
 *                 type: string
 *                 example: "URN123456"
 *               qr_code:
 *                 type: string
 *                 description: Base64 encoded QR code
 *                 example: "data:image/png;base64,..."
 *               user_number:
 *                 type: string
 *                 example: "9876543210"
 *               form_name:
 *                 type: string
 *                 example: "delegate_form"
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email sent successfully!"
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 error:
 *                   type: boolean
 *                   example: false
 *       500:
 *         description: PDF Generation Error
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "An error occurred during PDF generation."
 */
router.post('/sendemail', delegate_registration.sendemail_Todelegte);


/**
 * @swagger
 * /api/v1/generate_badge:
 *   post:
 *     summary: Generate badge PDF with QR code
 *     tags: [Delegates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - user_name
 *               - user_email
 *               - company
 *               - designation
 *               - urn_no
 *               - qr_code
 *               - user_number
 *               - form_name
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *               user_name:
 *                 type: string
 *                 example: "John Doe"
 *               user_email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               company:
 *                 type: string
 *                 example: "Tech Corp"
 *               designation:
 *                 type: string
 *                 example: "Senior Developer"
 *               urn_no:
 *                 type: string
 *                 example: "URN123456"
 *               qr_code:
 *                 type: string
 *                 description: Base64 encoded QR code
 *                 example: "data:image/png;base64,..."
 *               user_number:
 *                 type: string
 *                 example: "9876543210"
 *               form_name:
 *                 type: string
 *                 enum: ["delegate", "partner", "speaker"]
 *                 description: Type of badge template to use
 *                 example: "delegate"
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Badge generated successfully!"
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 error:
 *                   type: boolean
 *                   example: false
 *       500:
 *         description: PDF Generation Error
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "An error occurred during PDF generation."
 */
router.post('/generate_badge', delegate_registration.geneateBadge_delegte);


/**
 * @swagger
 * /api/v1/download_badge:
 *   post:
 *     summary: Download generated badge PDF
 *     tags: [Delegates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - filepath
 *             properties:
 *               filepath:
 *                 type: string
 *                 description: Path to the badge PDF file
 *                 example: "src/uploads/badges/URN123456.pdf"
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - filepath
 *             properties:
 *               filepath:
 *                 type: string
 *                 description: Path to the badge PDF file
 *                 example: "src/uploads/badges/URN123456.pdf"
 *     responses:
 *       200:
 *         description: Returns the PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Type:
 *             schema:
 *               type: string
 *               example: application/pdf
 *           Content-Disposition:
 *             schema:
 *               type: string
 *               example: attachment; filename=downloaded.pdf
 *       404:
 *         description: File not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: File not found
 *       500:
 *         description: Server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Internal Server Error
 */
router.post('/download_badge', delegate_registration.download_badge); 

/**
 * @swagger
 * /api/v1/updateDetails:
 *   put:
 *     summary: Update user details
 *     tags: [Delegates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: User ID to update
 *                 example: 1
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
 *               department:
 *                 type: string
 *                 maxLength: 150
 *                 example: "IT Department"
 *               designation:
 *                 type: string
 *                 maxLength: 75
 *                 example: "Senior Developer"
 *               mobile_number:
 *                 type: string
 *                 maxLength: 10
 *                 example: "9876543210"
 *               email_id:
 *                 type: string
 *                 maxLength: 125
 *                 example: "john.doe@example.com"
 *               company_name:
 *                 type: string
 *                 maxLength: 150
 *                 example: "Tech Corp"
 *               company_address:
 *                 type: string
 *                 maxLength: 300
 *                 example: "123 Tech Street"
 *               address_line_1:
 *                 type: string
 *                 maxLength: 250
 *                 example: "Building A"
 *               address_line_2:
 *                 type: string
 *                 maxLength: 250
 *                 example: "Floor 5"
 *               address_line_3:
 *                 type: string
 *                 maxLength: 250
 *                 example: "Suite 502"
 *               country:
 *                 type: integer
 *                 example: 1
 *               state:
 *                 type: integer
 *                 example: 1
 *               city:
 *                 type: integer
 *                 example: 1
 *               pin_code:
 *                 type: integer
 *                 example: 400001
 *               website:
 *                 type: string
 *                 maxLength: 225
 *                 example: "www.example.com"
 *               conference_day:
 *                 type: string
 *                 maxLength: 225
 *                 example: "Day 1"
 *               attending_purpose:
 *                 type: string
 *                 maxLength: 455
 *                 example: "Networking"
 *               specific_solution:
 *                 type: string
 *                 maxLength: 45
 *                 example: "Cloud Solutions"
 *               attended_innopack:
 *                 type: string
 *                 maxLength: 20
 *                 example: "Yes"
 *               is_whatsapp_number:
 *                 type: integer
 *                 enum: [0, 1]
 *                 example: 1
 *               terms_condition:
 *                 type: integer
 *                 enum: [0, 1]
 *                 example: 1
 *               events:
 *                 type: integer
 *                 enum: [0, 1]
 *                 example: 1
 *               updated_by:
 *                 type: string
 *                 maxLength: 45
 *                 example: "admin"
 *               country_code:
 *                 type: string
 *                 maxLength: 200
 *                 example: "+91"
 *     responses:
 *       200:
 *         description: Success
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
 *                   example: "Details Updated Successfully!"
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Something went wrong. Please try again."
 */
router.put("/updateDetails", delegate_registration.update_details);


/**
 * @swagger
 * /api/v1/user_byid:
 *   post:
 *     summary: Get user details by ID with related information
 *     tags: [Delegates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID of the user to fetch
 *                 example: 1
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                       registration_type:
 *                         type: string
 *                         enum: ['1', '2', '3']
 *                       title:
 *                         type: string
 *                       first_name:
 *                         type: string
 *                       last_name:
 *                         type: string
 *                       department:
 *                         type: string
 *                       designation:
 *                         type: string
 *                       mobile_number:
 *                         type: string
 *                       email_id:
 *                         type: string
 *                       company_name:
 *                         type: string
 *                       company_address:
 *                         type: string
 *                       country_name:
 *                         type: string
 *                       state_name:
 *                         type: string
 *                       city_name:
 *                         type: string
 *                       tracking_ref:
 *                         type: string
 *                       urn_no:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: ['0', '1', '2']
 *                       qr_code:
 *                         type: string
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Details fetched successfully!"
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Something went wrong. Please try again."
 */
router.post("/user_byid", delegate_registration.userById);

/**
 * @swagger
 * /api/v1/getAllCancelled/delegates:
 *   get:
 *     summary: Get all cancelled delegate users
 *     tags: [Delegates]
 *     description: Retrieves all cancelled delegates (registration_type='1', status='2', is_active=1)
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                       registration_type:
 *                         type: string
 *                         enum: ['1']
 *                       title:
 *                         type: string
 *                       first_name:
 *                         type: string
 *                       last_name:
 *                         type: string
 *                       department:
 *                         type: string
 *                       designation:
 *                         type: string
 *                       mobile_number:
 *                         type: string
 *                       email_id:
 *                         type: string
 *                       company_name:
 *                         type: string
 *                       company_address:
 *                         type: string
 *                       country_name:
 *                         type: string
 *                       state_name:
 *                         type: string
 *                       city_name:
 *                         type: string
 *                       refrence:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: ['2']
 *                       is_active:
 *                         type: integer
 *                         enum: [1]
 *                       created_date:
 *                         type: string
 *                         format: date-time
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 count:
 *                   type: integer
 *                   description: Total number of cancelled delegates
 *                   example: 10
 *                 message:
 *                   type: string
 *                   example: "details fetched successfully!"
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Something went wrong. Please try again."
 */
router.get("/getAllCancelled/delegates", delegate_registration.findAllCancelledUsersDelegates);


/**
 * @swagger
 * /api/v1/getAllCancelled/partners:
 *   get:
 *     summary: Get all cancelled partner users
 *     tags: [Delegates]
 *     description: Retrieves all cancelled partners (registration_type='2', status='2', is_active=1)
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                       registration_type:
 *                         type: string
 *                         enum: ['2']
 *                       title:
 *                         type: string
 *                       first_name:
 *                         type: string
 *                       last_name:
 *                         type: string
 *                       department:
 *                         type: string
 *                       designation:
 *                         type: string
 *                       mobile_number:
 *                         type: string
 *                       email_id:
 *                         type: string
 *                       company_name:
 *                         type: string
 *                       company_address:
 *                         type: string
 *                       country_name:
 *                         type: string
 *                       state_name:
 *                         type: string
 *                       city_name:
 *                         type: string
 *                       refrence:
 *                         type: string
 *                         description: Reference from tracking link
 *                       status:
 *                         type: string
 *                         enum: ['2']
 *                       is_active:
 *                         type: integer
 *                         enum: [1]
 *                       created_date:
 *                         type: string
 *                         format: date-time
 *                       urn_no:
 *                         type: string
 *                       qr_code:
 *                         type: string
 *                       country_code:
 *                         type: string
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 count:
 *                   type: integer
 *                   description: Total number of cancelled partners
 *                   example: 5
 *                 message:
 *                   type: string
 *                   example: "details fetched successfully!"
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Something went wrong. Please try again."
 */
router.get("/getAllCancelled/partners", delegate_registration.findAllCancelledUsersPartners);


/**
 * @swagger
 * /api/v1/getAllCancelled/speakers:
 *   get:
 *     summary: Get all cancelled speaker users
 *     tags: [Delegates]
 *     description: Retrieves all cancelled speakers (registration_type='3', status='2', is_active=1)
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                       registration_type:
 *                         type: string
 *                         enum: ['3']
 *                       title:
 *                         type: string
 *                       first_name:
 *                         type: string
 *                       last_name:
 *                         type: string
 *                       department:
 *                         type: string
 *                       designation:
 *                         type: string
 *                       mobile_number:
 *                         type: string
 *                       email_id:
 *                         type: string
 *                       company_name:
 *                         type: string
 *                       company_address:
 *                         type: string
 *                       country_name:
 *                         type: string
 *                       state_name:
 *                         type: string
 *                       city_name:
 *                         type: string
 *                       refrence:
 *                         type: string
 *                         description: Reference from tracking link
 *                       status:
 *                         type: string
 *                         enum: ['2']
 *                       is_active:
 *                         type: integer
 *                         enum: [1]
 *                       created_date:
 *                         type: string
 *                         format: date-time
 *                       urn_no:
 *                         type: string
 *                       qr_code:
 *                         type: string
 *                       country_code:
 *                         type: string
 *                       linkedIn_profile:
 *                         type: string
 *                       instagram_profile:
 *                         type: string
 *                       profession_1:
 *                         type: string
 *                       profession_2:
 *                         type: string
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 count:
 *                   type: integer
 *                   description: Total number of cancelled speakers
 *                   example: 3
 *                 message:
 *                   type: string
 *                   example: "details fetched successfully!"
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Something went wrong. Please try again."
 */
router.get("/getAllCancelled/speakers", delegate_registration.findAllCancelledUsersSpeakers);

module.exports = router;
