const express = require("express");
const router = express.Router();
const brochure = require("../controllers/brochure");


/**
 * @swagger
 * tags:
 *   name: Brochure
 *   description: Brochure management endpoints
 */ 
// Create a new leaves
/**
 * @swagger
 * /api/v1/brochure/create:
 *   post:
 *     summary: Create new brochure entry
 *     tags: [Brochure]
 *     description: Creates a new brochure record with contact and company information
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contact_name
 *               - email
 *               - job_tittle
 *               - company_name
 *               - country
 *               - phone_number
 *               - mobile
 *               - area_of_interest
 *             properties:
 *               contact_name:
 *                 type: string
 *                 maxLength: 225
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 maxLength: 120
 *                 format: email
 *                 example: "john.doe@example.com"
 *               job_tittle:
 *                 type: string
 *                 maxLength: 75
 *                 example: "Senior Manager"
 *               company_name:
 *                 type: string
 *                 maxLength: 115
 *                 example: "Tech Solutions Inc"
 *               country:
 *                 type: string
 *                 maxLength: 75
 *                 example: "United States"
 *               phone_number:
 *                 type: integer
 *                 format: int64
 *                 example: 12345678901
 *               mobile:
 *                 type: integer
 *                 format: int64
 *                 example: 9876543210
 *               area_of_interest:
 *                 type: string
 *                 maxLength: 95
 *                 example: "Software Development"
 *               check_whatsapp_number:
 *                 type: string
 *                 enum: ["", "1"]
 *                 example: "1"
 *               check_details:
 *                 type: string
 *                 enum: ["", "1"]
 *                 example: "1"
 *     responses:
 *       200:
 *         description: Brochure created successfully
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
 *                   example: "Details Added Successfully!"
 *       400:
 *         description: Error creating brochure
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
 *                   oneOf:
 *                     - example: "Something went wrong. Please try again."
 *                     - example: "This details already exist in this Form"
 */
router.post("/create", brochure.brochure);



/**
 * @swagger
 * /api/v1/brochure/getAll:
 *   get:
 *     summary: Get all active brochures
 *     tags: [Brochure]
 *     description: Retrieves all active brochure records ordered by creation date
 *     responses:
 *       200:
 *         description: List of brochures retrieved successfully
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
 *                   example: "details fetched successfully!"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       brochure_id:
 *                         type: integer
 *                         example: 101
 *                       contact_name:
 *                         type: string
 *                         example: "John Doe"
 *                       email:
 *                         type: string
 *                         example: "john.doe@example.com"
 *                       job_tittle:
 *                         type: string
 *                         example: "Senior Manager"
 *                       company_name:
 *                         type: string
 *                         example: "Tech Solutions Inc"
 *                       country:
 *                         type: string
 *                         example: "United States"
 *                       phone_number:
 *                         type: integer
 *                         format: int64
 *                         example: 12345678901
 *                       mobile:
 *                         type: integer
 *                         format: int64
 *                         example: 9876543210
 *                       area_of_interest:
 *                         type: string
 *                         example: "Software Development"
 *                       check_whatsaap_number:
 *                         type: integer
 *                         enum: [0, 1]
 *                         example: 1
 *                       check_details:
 *                         type: integer
 *                         enum: [0, 1]
 *                         example: 1
 *                       is_active:
 *                         type: integer
 *                         enum: [1]
 *                         example: 1
 *                       created_date:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-01T12:00:00Z"
 *                       created_by:
 *                         type: string
 *                         nullable: true
 *                         example: "admin"
 *       400:
 *         description: Error retrieving brochures
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
router.get("/getAll", brochure.findAll);


/**
 * @swagger
 * /api/v1/brochure/search:
 *   post:
 *     summary: Search brochures by contact name or email
 *     tags: [Brochure]
 *     description: Search active brochures using partial match on contact name or email
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
 *                 maxLength: 125
 *                 description: Search term to match against contact name or email
 *                 example: "john"
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
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
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       brochure_id:
 *                         type: integer
 *                         example: 101
 *                       contact_name:
 *                         type: string
 *                         example: "John Doe"
 *                       email:
 *                         type: string
 *                         example: "john.doe@example.com"
 *                       job_tittle:
 *                         type: string
 *                         example: "Senior Manager"
 *                       company_name:
 *                         type: string
 *                         example: "Tech Solutions Inc"
 *                       country:
 *                         type: string
 *                         example: "United States"
 *                       phone_number:
 *                         type: integer
 *                         format: int64
 *                         example: 12345678901
 *                       mobile:
 *                         type: integer
 *                         format: int64
 *                         example: 9876543210
 *                       area_of_interest:
 *                         type: string
 *                         example: "Software Development"
 *                       check_whatsaap_number:
 *                         type: integer
 *                         enum: [0, 1]
 *                         example: 1
 *                       check_details:
 *                         type: integer
 *                         enum: [0, 1]
 *                         example: 1
 *                       is_active:
 *                         type: integer
 *                         enum: [1]
 *                         example: 1
 *                       created_date:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-01T12:00:00Z"
 *                       created_by:
 *                         type: string
 *                         nullable: true
 *                         example: "admin"
 *       500:
 *         description: Error performing search
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error occurred while searching"
 */
router.post("/search", brochure.find_searchby_brochure);



/**
 * @swagger
 * /api/v1/brochure/delete:
 *   patch:
 *     summary: Soft delete brochure(s)
 *     tags: [Brochure]
 *     description: Soft deletes one or multiple brochures by setting is_active to 0
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - brochure_id
 *             properties:
 *               brochure_id:
 *                 type: string
 *                 description: Comma-separated list of brochure IDs to delete
 *                 example: "1,2,3"
 *     responses:
 *       200:
 *         description: Brochure(s) deleted successfully
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
 *                   example: "data deleted successfully!"
 *       400:
 *         description: Error deleting brochure(s)
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
router.patch("/delete", brochure.delete);



module.exports = router;