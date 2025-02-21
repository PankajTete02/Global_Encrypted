const express = require("express");
const router = express.Router();
const CountryStateCityController = require("../controllers/country-state-city.controller");


// Apply token authentication middleware to all routes

// Retrieve countries
/**
 * @swagger
 * tags:
 *   name: Country State City
 *   description: Country State City management endpoints
 */
/**
 * @swagger
 * /api/v1/getcountry:
 *   get:
 *     summary: Get all active countries
 *     tags: [Country State City]
 *     description: Retrieves a list of all active countries with their IDs, names and country codes
 *     responses:
 *       200:
 *         description: Countries list retrieved successfully
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
 *                   example: "country fetched successfully!"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Unique identifier for the country
 *                         example: 1
 *                       name:
 *                         type: string
 *                         maxLength: 150
 *                         description: Name of the country
 *                         example: "United States"
 *                       code:
 *                         type: string
 *                         maxLength: 45
 *                         description: Country code
 *                         example: "US"
 *       400:
 *         description: Error retrieving countries list
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
router.get("/getcountry", CountryStateCityController.findAllCountry);


/**
 * @swagger
 * /api/v1/getAll/countrycode:
 *   get:
 *     summary: Get all country mobile codes
 *     tags: [Country State City]
 *     description: Retrieves a list of all country mobile codes from the database
 *     responses:
 *       200:
 *         description: Countries list retrieved successfully
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
 *                   example: "country fetched successfully!"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Unique identifier for the country
 *                         example: 1
 *                       name:
 *                         type: string
 *                         maxLength: 150
 *                         description: Name of the country
 *                         example: "United States"
 *                       code:
 *                         type: string
 *                         maxLength: 45
 *                         description: Country code
 *                         example: "US"
 *       400:
 *         description: Error retrieving countries list
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
router.get("/getAll/countrycode", CountryStateCityController.findCountryCode);


// Retrieve state by country id
/**
 * @swagger
 * /api/v1/getstate/{country_id}:
 *   get:
 *     summary: Get states by country ID
 *     tags: [Country State City]
 *     description: Retrieves all states for a given country ID
 *     parameters:
 *       - in: path
 *         name: country_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the country to get states for
 *     responses:
 *       200:
 *         description: Successful operation
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
 *                       state_name:
 *                         type: string
 *                         example: "California"
 *                       state_id:
 *                         type: integer
 *                         example: 1
 *                       country_id:
 *                         type: integer
 *                         example: 1
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "state fetched successfully!"
 *       400:
 *         description: Bad request
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
router.get("/getstate/:country_id", CountryStateCityController.findstate);
// Retrieve city by state id
/**
 * @swagger
 * /api/v1/getcity/{state_id}:
 *   get:
 *     summary: Get cities by state ID
 *     tags: [Country State City]
 *     description: Retrieves all cities for a given state ID
 *     parameters:
 *       - in: path
 *         name: state_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the state to get cities for
 *     responses:
 *       200:
 *         description: Successful operation
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
 *                       city_name:
 *                         type: string
 *                         example: "Los Angeles"
 *                       city_id:
 *                         type: integer
 *                         example: 1
 *                       country_id:
 *                         type: integer
 *                         example: 1
 *                       state_id:
 *                         type: integer
 *                         example: 1
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "city fetched successfully!"
 *       404:
 *         description: City not found
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
 *                   example: "city does not exist!"
 *       400:
 *         description: Bad request
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
router.get("/getcity/:state_id",CountryStateCityController.findcity); 


/**
 * @swagger
 * /api/v1/getDates:
 *   get:
 *     summary: Get current date and next 5 days
 *     tags: [Country State City]
 *     description: Retrieves the current date and the next 5 consecutive dates
 *     responses:
 *       200:
 *         description: Dates retrieved successfully
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
 *                       currentDate:
 *                         type: string
 *                         format: date
 *                         example: "2024-03-25"
 *                       date_plus_1:
 *                         type: string
 *                         format: date
 *                         example: "2024-03-26"
 *                       date_plus_2:
 *                         type: string
 *                         format: date
 *                         example: "2024-03-27"
 *                       date_plus_3:
 *                         type: string
 *                         format: date
 *                         example: "2024-03-28"
 *                       date_plus_4:
 *                         type: string
 *                         format: date
 *                         example: "2024-03-29"
 *                       date_plus_5:
 *                         type: string
 *                         format: date
 *                         example: "2024-03-30"
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Dates fetched successfully!"
 *       400:
 *         description: Error retrieving dates
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
router.get("/getDates",CountryStateCityController.findDates);


/**
 * @swagger
 * /api/v1/get_delegate_country:
 *   get:
 *     summary: Get all delegate countries
 *     tags: [Country State City]
 *     description: Retrieves a list of all delegate countries from the database
 *     responses:
 *       200:
 *         description: Countries retrieved successfully
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
 *                       state_name:
 *                         type: string
 *                         example: "California"
 *                         description: Name of the state
 *                       state_id:
 *                         type: integer
 *                         example: 1
 *                         description: Unique identifier for the state
 *                       country_id:
 *                         type: integer
 *                         example: 1
 *                         description: ID of the country this state belongs to
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "country fetched successfully!"
 *       400:
 *         description: Error retrieving countries
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
router.get("/get_delegate_country",CountryStateCityController.findAllCountry_delegate);

/**
 * @swagger
 * /api/v1/get_delegate_state/{country_id}:
 *   get:
 *     summary: Get delegate states by country ID
 *     tags: [Country State City]
 *     description: Retrieves all delegate states for a given country ID (includes states with country_id 0)
 *     parameters:
 *       - in: path
 *         name: country_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the country to get delegate states for
 *     responses:
 *       200:
 *         description: States retrieved successfully
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
 *                       id:
 *                         type: integer
 *                         description: Unique identifier for the state
 *                         example: 1
 *                       name:
 *                         type: string
 *                         description: Name of the state
 *                         example: "California"
 *                       country_id:
 *                         type: integer
 *                         description: ID of the country this state belongs to
 *                         example: 1
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "state fetched successfully!"
 *       400:
 *         description: Error retrieving states
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
router.get("/get_delegate_state/:country_id", CountryStateCityController.findAllstate_delegate);

/**
 * @swagger
 * /api/v1/get_delegate_city/{state_id}:
 *   get:
 *     summary: Get delegate cities by state ID
 *     tags: [Country State City]
 *     description: Retrieves all delegate cities for a given state ID (includes cities with state_id 0)
 *     parameters:
 *       - in: path
 *         name: state_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the state to get cities for
 *     responses:
 *       200:
 *         description: Cities retrieved successfully
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
 *                       id:
 *                         type: integer
 *                         description: Unique identifier for the city
 *                         example: 1
 *                       name:
 *                         type: string
 *                         description: Name of the city
 *                         example: "Los Angeles"
 *                       country_id:
 *                         type: integer
 *                         description: ID of the country this city belongs to
 *                         example: 1
 *                       state_id:
 *                         type: integer
 *                         description: ID of the state this city belongs to
 *                         example: 1
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "city fetched successfully!"
 *       404:
 *         description: City not found
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
 *                   example: "city does not exist!"
 *       400:
 *         description: Bad request
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
router.get("/get_delegate_city/:state_id",CountryStateCityController.findcity_delegate);

module.exports = router;
  






