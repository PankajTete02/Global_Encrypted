const express = require("express");
const router = express.Router();
const chart = require("../controllers/chart");


/**
 * @swagger
 * tags:
 *   name: Charts
 *   description: Charts management endpoints
 */ 


/**
 * @swagger
 * /api/v1/chart/delegate/piechart:
 *   get:
 *     summary: Get delegate registration status statistics
 *     tags: [Charts]
 *     description: Retrieves count of delegates grouped by registration status (Pending, Completed, Cancel)
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 *                       registration_status:
 *                         type: string
 *                         enum: ["Pending", "Completed", "Cancel"]
 *                         description: Status of delegate registration
 *                         example: "Completed"
 *                       count:
 *                         type: integer
 *                         description: Number of delegates in this status
 *                         example: 25
 *       400:
 *         description: Error retrieving statistics
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
router.get("/delegate/piechart", chart.findpiechartdelegate);


/**
 * @swagger
 * /api/v1/chart/partner/piechart:
 *   get:
 *     summary: Get partner registration status statistics
 *     tags: [Charts]
 *     description: Retrieves count of partners grouped by registration status (Pending, Completed, Cancel)
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 *                       registration_status:
 *                         type: string
 *                         enum: ["Pending", "Completed", "Cancel"]
 *                         description: Status of partner registration
 *                         example: "Completed"
 *                       count:
 *                         type: integer
 *                         description: Number of partners in this status
 *                         example: 15
 *       400:
 *         description: Error retrieving statistics
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
router.get("/partner/piechart", chart.findpiechartpartner);



/**
 * @swagger
 * /api/v1/chart/speaker/piechart:
 *   get:
 *     summary: Get speaker registration status statistics
 *     tags: [Charts]
 *     description: Retrieves count of speakers grouped by registration status (Pending, Completed, Cancel)
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 *                       registration_status:
 *                         type: string
 *                         enum: ["Pending", "Completed", "Cancel"]
 *                         description: Status of speaker registration
 *                         example: "Completed"
 *                       count:
 *                         type: integer
 *                         description: Number of speakers in this status
 *                         example: 10
 *       400:
 *         description: Error retrieving statistics
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
router.get("/speaker/piechart", chart.findpiechartspeaker);


/**
 * @swagger
 * /api/v1/chart/delegate/piechart/currentDate:
 *   get:
 *     summary: Get delegate registration trends for last 30 days
 *     tags: [Charts]
 *     description: Retrieves daily registration counts for delegates over the past month, separated by status
 *     responses:
 *       200:
 *         description: Registration trends retrieved successfully
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
 *                       date_range:
 *                         type: string
 *                         description: Registration date in DD/MM/YYYY format
 *                         example: "25/03/2024"
 *                       complete_count:
 *                         type: integer
 *                         description: Number of completed registrations (status = 1)
 *                         example: 5
 *                       pending_count:
 *                         type: integer
 *                         description: Number of pending/cancelled registrations (status = 0 or 2)
 *                         example: 3
 *       400:
 *         description: Error retrieving registration trends
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
router.get("/delegate/piechart/currentDate", chart.findchart_delegateby_currentDate);


/**
 * @swagger
 * /api/v1/chart/partner/piechart/currentDate:
 *   get:
 *     summary: Get partner registration trends for last 30 days
 *     tags: [Charts]
 *     description: Retrieves daily registration counts for partners over the past month, separated by status
 *     responses:
 *       200:
 *         description: Registration trends retrieved successfully
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
 *                       date_range:
 *                         type: string
 *                         description: Registration date in DD/MM/YYYY format
 *                         example: "25/03/2024"
 *                       complete_count:
 *                         type: integer
 *                         description: Number of completed partner registrations (status = 1)
 *                         example: 3
 *                       pending_count:
 *                         type: integer
 *                         description: Number of pending/cancelled partner registrations (status = 0 or 2)
 *                         example: 2
 *       400:
 *         description: Error retrieving registration trends
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
router.get("/partner/piechart/currentDate", chart.findchart_partnerby_currentDate);


/**
 * @swagger
 * /api/v1/chart/speaker/piechart/currentDate:
 *   get:
 *     summary: Get speaker registration trends for last 30 days
 *     tags: [Charts]
 *     description: Retrieves daily registration counts for speakers over the past month, separated by status
 *     responses:
 *       200:
 *         description: Registration trends retrieved successfully
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
 *                       date_range:
 *                         type: string
 *                         description: Registration date in DD/MM/YYYY format
 *                         example: "25/03/2024"
 *                       complete_count:
 *                         type: integer
 *                         description: Number of completed speaker registrations (status = 1)
 *                         example: 2
 *                       pending_count:
 *                         type: integer
 *                         description: Number of pending/cancelled speaker registrations (status = 0 or 2)
 *                         example: 1
 *       400:
 *         description: Error retrieving registration trends
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
router.get("/speaker/piechart/currentDate", chart.findchart_speakerby_currentDate);



/**
 * @swagger
 * /api/v1/chart/delegate/refrence/piechart:
 *   get:
 *     summary: Get delegate registration reference statistics
 *     tags: [Charts]
 *     description: Retrieves count of completed delegate registrations grouped by reference source
 *     responses:
 *       200:
 *         description: Reference statistics retrieved successfully
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
 *                       ref:
 *                         type: string
 *                         description: Reference source identifier or 'No Refrence'
 *                         example: "social_media"
 *                       count_s:
 *                         type: integer
 *                         description: Number of registrations from this reference source
 *                         example: 15
 *       400:
 *         description: Error retrieving reference statistics
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
router.get("/delegate/refrence/piechart", chart.findchart_delegate_refrence_chart);



/**
 * @swagger
 * /api/v1/chart/partner/refrence/piechart:
 *   get:
 *     summary: Get partner registration reference statistics
 *     tags: [Charts]
 *     description: Retrieves count of completed partner registrations grouped by reference source
 *     responses:
 *       200:
 *         description: Reference statistics retrieved successfully
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
 *                       ref:
 *                         type: string
 *                         description: Reference source identifier or 'No Refrence'
 *                         example: "partner_network"
 *                       count_s:
 *                         type: integer
 *                         description: Number of partner registrations from this reference source
 *                         example: 8
 *       400:
 *         description: Error retrieving reference statistics
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
router.get("/partner/refrence/piechart", chart.findchart_partner_refrence_chart);


/**
 * @swagger
 * /api/v1/chart/speaker/refrence/piechart:
 *   get:
 *     summary: Get speaker registration reference statistics
 *     tags: [Charts]
 *     description: Retrieves count of completed speaker registrations grouped by reference source
 *     responses:
 *       200:
 *         description: Reference statistics retrieved successfully
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
 *                       ref:
 *                         type: string
 *                         description: Reference source identifier or 'No Refrence'
 *                         example: "speaker_invite"
 *                       count_s:
 *                         type: integer
 *                         description: Number of speaker registrations from this reference source
 *                         example: 5
 *       400:
 *         description: Error retrieving reference statistics
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
router.get("/speaker/refrence/piechart", chart.findchart_speaker_refrence_chart);

module.exports = router;