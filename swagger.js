"use strict";

const fs = require("fs");
const path = require("path");
const swaggerAutogen = require("swagger-autogen")();

// Configuration using environment variables
const HOST = process.env.API_HOST || "localhost:4000";
const BASE_PATH = process.env.API_BASE_PATH || "/api/v1";
const OUTPUT_FILE = process.env.SWAGGER_OUTPUT_FILE || path.join(__dirname, "swagger-output.json");

// Define your endpoint files here
const ENDPOINTS_FILES = [
  path.join(__dirname, "src/routes/peacekeeperRoutes.js"),
  path.join(__dirname, "src/routes/authenticate_route.js"),
  path.join(__dirname, "src/routes/delegate_registration.js"),
  path.join(__dirname, "src/routes/delegateProfileRoute.js"),
  path.join(__dirname, "src/routes/brochure.js"),
  path.join(__dirname, "src/routes/chart.js"),
  path.join(__dirname, "src/routes/contactUsRoutes.js"),
  path.join(__dirname, "src/routes/country-state-city.routes.js"),
  // path.join(__dirname, "src/routes/Router.js")

];

// Swagger documentation object
const doc = {
  info: {
    title: "Global Justice API",
    version: "1.0.0", 
    description: "API documentation for Global Justice Project"
  },
  host: HOST,
  basePath: BASE_PATH,
  schemes: ["http", "https"],
  consumes: ["application/json", "multipart/form-data"],
  produces: ["application/json"],
  tags: [
    {
      name: "Peacekeepers",
      description: "Endpoints for managing peacekeeper profiles"
    },
    // {
    //   name: "Stripe",
    //   description: "Payment processing endpoints"
    // },
    // {
    //   name: "Ambassador",
    //   description: "Ambassador management endpoints"
    // }
  ],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header'
    }
  }
  
};

// Validate that endpoint files exist
function validateEndpoints() {
  ENDPOINTS_FILES.forEach((file) => {
    if (!fs.existsSync(file)) {
      throw new Error(`Endpoint file not found: ${file}`);
    }
  });
}

// Generate Swagger documentation
(async () => {
  try {
    validateEndpoints();
    console.log("Generating Swagger documentation...");
    await swaggerAutogen(OUTPUT_FILE, ENDPOINTS_FILES, doc);
    console.log(`Swagger documentation generated successfully at: ${OUTPUT_FILE}`);
  } catch (error) {
    console.error("Error generating Swagger docs:", error);
    process.exit(1);
  }
})();




