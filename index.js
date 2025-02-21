const express = require('express');
const bodyParser = require('body-parser');
// const doenv = require("dotenv");
const path = require("path");
const dbConn = require("./db.config");
require("dotenv").config();
const nodemailer = require('nodemailer');
const qrcode = require('qrcode');
const shortid = require('shortid');
const axios = require('axios');
var cron = require('node-cron');
const wspMsg = require("./middlewares/whatsapp");
const SAVEQR = require('././src/middleware/qr_code');

// const file1 = require('./src/middleware/i-card3.html');
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require('swagger-ui-express');

const fs = require('fs');
// const routes = require('./Route/register_routes');
// create express app
const app = express();
app.set('view engine', 'ejs');

const cors = require("cors");
// app.use(
//   cors({
//     origin: [
//       "https://justice-love-peace.com",
//       "https://www.justice-love-peace.com",
//       "https://admin.justice-love-peace.com",
//       "https://api.justice-love-peace.com",
//     ],
//   })
// );

// Setup server port
const port = process.env.PORT || 4000;
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// parse requests of content-type - application/json
app.use(bodyParser.json())
// const Pending_report = require('./src/routes/PendingReport.routes')
// app.use((err, req, res, next) => {
//   // console.log(err);
//   err.statusCode = err.statusCode || 500;
//   err.message = err.message || "Internal Server Error";
//   res.status(err.statusCode).json({
//     message: err.message,
//   });
// });
// app.use(routes);
// listen for requests



const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: "Global Justice API",
      version: "1.0.0",
      description: `API documentation for Global Justice Project.`
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: [
    "src/routes/peacekeeperRoutes.js",
    "src/routes/authenticate_route.js",
    "src/routes/delegateProfileRoute.js",
    "src/routes/delegate_registration.js",
    "src/routes/brochure.js",
    "src/routes/chart.js",
    "src/routes/contactUsRoutes.js",
    "src/routes/country-state-city.routes.js",
    // "src/routes/Router.js"

    
    
    
    // path to your route files
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Update your swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-with, Content-Type, Accept");
  next();
});


app.use(
  cors({
    origin: 
    [
     "http://localhost:4200", 
     "https://justice-love-peace.com",
     "https://www.justice-love-peace.com",
     "https://admin.justice-love-peace.com",
     "https://api.justice-love-peace.com"
    ],
  })
);

const CountryStateCity = require("./src/routes/country-state-city.routes");
const delegate_registration = require("./src/routes/delegate_registration");
const sales_brochure = require("./src/routes/sales_brochure");
const brochure = require("./src/routes/brochure");
const subscriber = require("./src/routes/subscriber");
const Router = require("./src/routes/Router");
const Tracking = require("./src/routes/tracking_link");
const chart = require("./src/routes/chart");
const delegateProfileRoute = require("./src/routes/delegateProfileRoute");
const contactUsRoutes = require("./src/routes/contactUsRoutes");
const peacekeeperRoutes = require("./src/routes/peacekeeperRoutes");
const authenicate=require("./src/routes/authenticate_route");
const invitationRoute=require("./src/routes/invitationRoute");
const loginRoute=require("./src/routes/loginRoute");

app.get('/', (req, res) => {

  res.json("hello world");
});

app.use("/api/v1", chart);
app.use("/api/v1", Tracking);
app.use("/api/v1", CountryStateCity);
app.use("/api/v1/registration", delegate_registration);
app.use("/api/v1/sales_brochure", sales_brochure);
app.use("/api/v1/brochure", brochure);
app.use("/api/v1/subscriber", subscriber);
app.use("/api/v1/registration", delegateProfileRoute);
app.use("/api/v1", contactUsRoutes);
app.use("/api/v1", authenicate);
// app.use("/api/v1", Router);
app.use("/uploads", express.static("src/uploads/profile_pics"));
app.use("/uploads", express.static("src/uploads/qrcodes"));
app.use("/uploads/delegates", express.static("src/uploads/delegate_qr"));
app.use("/uploads/batch", express.static("src/uploads/batch"));
app.use("/uploads/batch/photo", express.static("src/uploads/batch_photo"));
app.use("/uploads/batch_pdf", express.static("src/uploads/batch_pdf"));
app.use("/middle_ware/photo", express.static("src/middleware/assets/images"));
app.use("/api/v1", invitationRoute);
app.use("/api/v1", loginRoute);
app.use('/api/v1/sponsorships', require('./src/routes/sponsorshipRoutes'));
app.use('/api/v1/collaborators', require('./src/routes/collaboratorRoutes'));

// Use the peacekeeper routes
app.use('/api/v1', peacekeeperRoutes);
app.use("/api/v1", Router);

// --------------------------------------Join Mailing Captcha----------------------------------------------------------------------------

const crypto = require('crypto');
const { log } = require('handlebars');

// Generate a random six-digit number CAPTCHA
function generateCaptcha() {
  const randomBytes = crypto.randomBytes(3); // Generate 3 random bytes (for a 6-digit number)
  const captcha = parseInt(randomBytes.toString('hex'), 16) % 900000 + 100000; // Ensure it's a six-digit number
  return captcha;
}

app.get('/api/v1/captcha', (req, res) => {
  const captcha = generateCaptcha();
  res.json({ captcha });
});

//-------------------------------------------------------------------------------------------------------------------------


//----------------------------------------------- API route to unsubscribe a subscriber---------------------------------
app.post('/unsubscribe', (req, res) => {
  const email = req.body.email;

  // --Call the MySQL stored procedure-----
  dbConn.query('CALL microsite_statuschange(?)', [email], (err, results) => {
    if (err) {
      console.error('Error executing the stored procedure:', err);
      return res.status(500).json({
        success: false,
        error: true,
        message: 'Something went wrong. Please try again.'
      });
    }

    const result = results[0][0];
    if (result.result === 'Subscriber unsubscribed successfully') {
      return res.json({
        success: true,
        error: false,
        message: 'Subscriber unsubscribed successfully.'
      });
    } else {
      return res.json({
        success: false,
        error: true,
        message: 'Subscriber not found.'
      });
    }
  });
});

//   --------------------------------------------------------------------------------------------------------------------

app.post('/api/v1/forgot-password', (req, res) => {
  const { email } = req.body;
  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  // Save OTP in the database
  dbConn.query('call microsite_generate_otp(?,?)', [otp, email], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Something went wrong' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Send OTP to user's email
    const transporter = nodemailer.createTransport({
      // service: 'your_email_service_provider',
      host: "smtp-mail.outlook.com",
      secureConnection: false, // TLS requires secureConnection to be false
      port: 587,
      auth: {
        user: "asma.bano@cylsys.com",
        pass: "Password@2",
      },
    });

    const mailOptions = {
      from: "asma.bano@cylsys.com",
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to send OTP' });
      }
      res.status(200).json({ message: 'OTP sent successfully' });
    });
  });
});

// =====================================================================================================

// app.post('/generate-qrcode', (req, res) => {
//   const { data } = req.body;

//   const options = {
//     errorCorrectionLevel: 'H',
//     type: 'image/png',
//     quality: 0.92,
//     margin: 1,
//   };

//   qrcode.toDataURL(data, options, (err, url) => {
//     if (err) {
//       res.status(500).send('Error generating QR code');
//     } else {
//       res.send({ qrcodeUrl: url });
//     }
//   });
// });

// Serve the generated QR code image
// app.get('/qrcode-image', (req, res) => {
//   const qrcodeUrl = req.query.qrcodeUrl;
//   res.redirect(qrcodeUrl);
// });

app.get('/qrcode', (req, res) => {
  const data = req.query.data; // Get the data from the query parameter

  if (!data) {
    return res.status(400).json({ error: 'Data parameter is missing' });
  }

  qrcode.toDataURL(data, (err, url) => {
    if (err) {
      console.error('Error generating QR code:', err);
      res.status(500).json({ error: 'Error generating QR code' });
    } else {
      // Send the QR code image as a response
      res.contentType('image/png');
      const base64Data = url.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      res.end(buffer, 'binary');
    }
  });
});

//============================================================================================================ 


// Bitly API Access Token (Hardcoded)
const BITLY_ACCESS_TOKEN = '2078be59bd3a221d6dfabc887b698a77004bb2f8';

app.use(bodyParser.json());

// Route to save the short URL
app.post('/api/v1/saveShortURL', async (req, res) => {
  const { tracking_link_id, longURL } = req.body;

  try {
    // Shorten the URL using Bitly API
    const response = await axios.post(
      'https://api-ssl.bitly.com/v4/shorten',
      {
        long_url: longURL
      },
      {
        headers: {
          Authorization: `Bearer ${BITLY_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const shortURL = response.data.link;

    // Update the tracking URL in the database
    const sql = 'UPDATE tbl_tracking_link SET tiny_url = ? WHERE tracking_link_id = ?';

    dbConn.query(sql, [shortURL, tracking_link_id], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Error saving short URL' });
      } else {
        console.log('Short URL saved successfully');
        res.status(200).json({ message: 'Short URL saved successfully' });
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error shortening URL' });
  }
});

// Function to fetch user data from a database or other source
async function fetchUserData() {
  // Replace this with your actual data retrieval logic
  // For example, you can use a database query or an API call
  return new Promise((resolve, reject) => {
    dbConn.query("call microsite_get_approved_delegate_forReminder()", function (err, res) {
      if (err) {
        console.error("Error fetching user data:", err);
        reject(err);
      } else {
        // console.log(res[0]);
        const userData = res[0];
        resolve(res[0]);

      }
    });
  });
}
// Initialize an empty data array
const data = [];
const batchSize = 50; // Set the batch size to 10
let sentUsers = []; // Array to track users who have received messages

// Function to send messages to a batch of users
async function sendMessagesToBatch(batch, days, template_id, date) {
  for (const user of batch) {
    const { user_id, user_name, urn_no, mobile_number } = user;
    console.log("template_id", template_id);
    // Log the message details in the database
    const status = 'pending'; // You can update this when you receive a confirmation

    // Log the message details in the database
    if (template_id === 1) {
      dbConn.query('INSERT INTO tbl_whatsappcampaingdetails (user_id,urn_number,mobile_number,template_id,days_left,status,sending_datetime) VALUES (?, ?, ?,?,?,?,?)',
        [user_id, urn_no, mobile_number, template_id, days, status, new Date()],
        (err, result) => {
          if (err) {
            console.error('Error logging message:', err);
          } else {
            console.log('Message logged successfully');
          }
        });
    }
    if (template_id === 2) {
      dbConn.query('INSERT INTO tbl_whatsappcampaingdetails_2 (user_id,urn_number,mobile_number,template_id,days_left,status,sending_datetime) VALUES (?, ?, ?,?,?,?,?)',
        [user_id, urn_no, mobile_number, template_id, days, status, new Date()],
        (err, result) => {
          if (err) {
            console.error('Error logging message:', err);
          } else {
            console.log('Message logged successfully');
          }
        });
    }
    if (template_id === 3) {
      dbConn.query('INSERT INTO tbl_whatsappcampaingdetails_3 (user_id,urn_number,mobile_number,template_id,days_left,status,sending_datetime) VALUES (?, ?, ?,?,?,?,?)',
        [user_id, urn_no, mobile_number, template_id, days, status, new Date()],
        (err, result) => {
          if (err) {
            console.error('Error logging message:', err);
          } else {
            console.log('Message logged successfully');
          }
        });
    }
    if (template_id === 4) {
      dbConn.query('INSERT INTO tbl_whatsappcampaingdetails_4 (user_id,urn_number,mobile_number,template_id,days_left,status,sending_datetime) VALUES (?, ?, ?,?,?,?,?)',
        [user_id, urn_no, mobile_number, template_id, days, status, new Date()],
        (err, result) => {
          if (err) {
            console.error('Error logging message:', err);
          } else {
            console.log('Message logged successfully');
          }
        });
    }
    if (template_id === 5) {
      dbConn.query('INSERT INTO tbl_whatsappcampaingdetails_5 (user_id,urn_number,mobile_number,template_id,days_left,status,sending_datetime) VALUES (?, ?, ?,?,?,?,?)',
        [user_id, urn_no, mobile_number, template_id, days, status, new Date()],
        (err, result) => {
          if (err) {
            console.error('Error logging message:', err);
          } else {
            console.log('Message logged successfully');
          }
        });
    }
    // Log the message details in a text file
    const logData = `${new Date().toISOString()} - urn_number: ${urn_no}, mobile_number: ${mobile_number},template_id:${template_id},days:${days}\n`;
    const logFileName = `${date}.txt`; // Different file for each template_id
    fs.appendFile(logFileName, logData, (err) => {
      if (err) {
        console.error('Error writing to text file:', err);
      } else {
        console.log('Message logged to text file successfully');
      }
    });

    await wspMsg.sendWhatsAppMessage_onSceduleTime(mobile_number, days, { timeout: 600000 })
      .then((message) => {
        console.log(`WhatsApp message sent to ${user_name} with SID: ${message.sid}`);
        sentUsers.push(user_id);
        // Assuming you received a confirmation from the messaging service
        // Update the status in the database
        if (template_id === 1) {
          dbConn.query('UPDATE tbl_whatsappcampaingdetails SET status = ? WHERE user_id = ? AND days_left=?',
            ['delivered', user_id, days],
            (err, result) => {
              if (err) {
                console.error('Error updating message status:', err);
              } else {
                console.log('Message status updated successfully');
              }
            });
        }
        if (template_id === 2) {
          dbConn.query('UPDATE tbl_whatsappcampaingdetails_2 SET status = ? WHERE user_id = ? AND days_left=?',
            ['delivered', user_id, days],
            (err, result) => {
              if (err) {
                console.error('Error updating message status:', err);
              } else {
                console.log('Message status updated successfully');
              }
            });
        }
        if (template_id === 3) {
          dbConn.query('UPDATE tbl_whatsappcampaingdetails_3 SET status = ? WHERE user_id = ? AND days_left=?',
            ['delivered', user_id, days],
            (err, result) => {
              if (err) {
                console.error('Error updating message status:', err);
              } else {
                console.log('Message status updated successfully');
              }
            });
        }
        if (template_id === 4) {
          dbConn.query('UPDATE tbl_whatsappcampaingdetails_4 SET status = ? WHERE user_id = ? AND days_left=?',
            ['delivered', user_id, days],
            (err, result) => {
              if (err) {
                console.error('Error updating message status:', err);
              } else {
                console.log('Message status updated successfully');
              }
            });
        }
        if (template_id === 5) {
          dbConn.query('UPDATE tbl_whatsappcampaingdetails_5 SET status = ? WHERE user_id = ? AND days_left=?',
            ['delivered', user_id, days],
            (err, result) => {
              if (err) {
                console.error('Error updating message status:', err);
              } else {
                console.log('Message status updated successfully');
              }
            });
        }
      })
      .catch((error) => {
        console.error('Error sending WhatsApp message:', error);

        // Log the message details in a text file
        const status = 'not sent'; // You can update this when you receive a confirmation

        const logData = `${new Date().toISOString()} - urn_number: ${urn_no}, mobile_number: ${mobile_number},template_id:${template_id},days:${days},Status:${status},Error sending WhatsApp message:${error}\n,`;
        const logFileName = `error_log_${date}.txt`; // Different file for each template_id
        fs.appendFile(logFileName, logData, (err) => {
          if (err) {
            console.error('Error writing to text file:', err);
          } else {
            console.log('Message logged to text file successfully');
          }
        });
      });
    await wspMsg.sendMediaMessage(urn_no, mobile_number)
      .then((message) => console.log(`WhatsApp media/Badge sent to ${user_name} with SID: ${message.sid}`)).catch((error) => {
        console.error('Error sending WhatsApp media message:', error);

        // Log the message details in a text file
        const status = 'not sent'; // You can update this when you receive a confirmation

        const logData = `${new Date().toISOString()} - urn_number: ${urn_no}, mobile_number: ${mobile_number},template_id:${template_id},days:${days},Status:${status},Error sending WhatsApp media message:${error},Created_date:${new Date()}\n,`;
        const logFileName = `error_log_${date}.txt`; // Different file for each template_id
        fs.appendFile(logFileName, logData, (err) => {
          if (err) {
            console.error('Error writing to text file:', err);
          } else {
            console.log('Message logged to text file successfully');
          }
        });
      });

  }
}

// Function to check if all users have received messages
function allUsersReceivedMessages() {
  console.log("sentusers", sentUsers);
  console.log("data", data);
  // Compare the list of sent users with the complete user list
  const allReceived = data.every(user => sentUsers.includes(user.user_id));
  console.log("all received", allReceived);
  return allReceived;
}
// Function to check if a specific batch of users has received messages
function batchReceivedMessages(batch) {
  const batchreceived = batch.every(user => sentUsers.includes(user.user_id));
  console.log("batch received", batchreceived);
  return batchreceived;
}
// Function to send messages to a batch of users only if they haven't received messages
async function sendMessagesToBatchIfNotReceived(batch, days, template_id, date) {
  if (!batchReceivedMessages(batch)) {
    await sendMessagesToBatch(batch, days, template_id, date);
  } else {
    console.log("All users in this batch have already received messages. Skipping...");
  }
}

// Fetch user data and populate the data array
fetchUserData()
  .then((userData) => {
    // Assuming userData is an array of user objects
    // console.log(userData);
    data.push(...userData);

    // console.log("hii", userData);
    console.log(console.log(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })))
    // Calculate the number of batches
    console.log("data.length", data.length);
    const numBatches = Math.ceil(data.length / batchSize);
    console.log("divide", data.length / batchSize);
    console.log("...newBatches", numBatches);

    // Define and start the cron job to send batches of messages   //7:00pm on 17 november
    const task1 = cron.schedule('00 19 17 11 *', async () => {
      try {
        for (let i = 0; i < numBatches; i++) {
          console.log("i", i);

          const batch = data.slice(i * batchSize, (i + 1) * batchSize);
          const days = '10 DAYS TO GO!';
          console.log("batch", batch);
          // Use the new function to send messages only if the batch hasn't received messages
          await sendMessagesToBatchIfNotReceived(batch, days, 1, '17-Nov-2023');
          // await sendMessagesToBatch(batch, days, 1, '17-Nov-2023');
          // Set a timeout to check if all users have received messages
          // setTimeout(() => {
          if (allUsersReceivedMessages()) {
            // All users have received messages, exit the scheduler
            console.log("All users have received messages. Stopping scheduler.");
            task1.stop();
            break;
          } else {
            console.log("Not all users have received messages. Continuing...");
          }
          // }, 60000); // Check after 1 minute
        }
      } catch (error) {
        console.error('Error sending WhatsApp message:', error);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata"
    });


    // Define and start the cron job to send batches of messages  //11am on 20 november
    const task2 = cron.schedule('00 11 20 11 *', async () => {
      try {
        for (let i = 0; i < numBatches; i++) {
          console.log("i", i);

          const batch = data.slice(i * batchSize, (i + 1) * batchSize);
          const days = '1 WEEK TO GO!';

          console.log("batch", batch);

          // Use the new function to send messages only if the batch hasn't received messages
          await sendMessagesToBatchIfNotReceived(batch, days, 2, '20-Nov-2023');

          // await sendMessagesToBatch(batch, days, 2,'20-Nov-2023');
          // Set a timeout to check if all users have received messages
          // setTimeout(() => {
          if (allUsersReceivedMessages()) {
            // All users have received messages, exit the scheduler
            console.log("All users have received messages. Stopping scheduler.");
            task2.stop();
            break;
          } else {
            console.log("Not all users have received messages. Continuing...");
          }
          // }, 60000); // Check after 1 minute
        }
      } catch (error) {
        console.error('Error sending WhatsApp message:', error);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata"
    });
    // Define and start the cron job to send batches of messages //11am on 25 november
    const task3 = cron.schedule('00 11 25 11 *', async () => {
      try {
        for (let i = 0; i < numBatches; i++) {
          console.log("i", i);

          const batch = data.slice(i * batchSize, (i + 1) * batchSize);
          const days = '2 DAYS TO GO!';

          console.log("batch", batch);
          // Use the new function to send messages only if the batch hasn't received messages
          await sendMessagesToBatchIfNotReceived(batch, days, 3, '25-Nov-2023');
          // await sendMessagesToBatch(batch, days, 3,'25-Nov-2023');
          // Set a timeout to check if all users have received messages
          // setTimeout(() => {
          if (allUsersReceivedMessages()) {
            // All users have received messages, exit the scheduler
            console.log("All users have received messages. Stopping scheduler.");
            task3.stop();
            break;
          } else {
            console.log("Not all users have received messages. Continuing...");
          }
          // }, 60000); // Check after 1 minute
        }
      } catch (error) {
        console.error('Error sending WhatsApp message:', error);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata"
    });
    // Define and start the cron job to send batches of messages //7pm on 26 november
    const task4 = cron.schedule('00 19 26 11 *', async () => {
      try {
        for (let i = 0; i < numBatches; i++) {
          console.log("i", i);

          const batch = data.slice(i * batchSize, (i + 1) * batchSize);
          const days = 'DOORS OPEN TOMORROW at 9:00 AM';

          console.log("batch", batch);
          // Use the new function to send messages only if the batch hasn't received messages
          await sendMessagesToBatchIfNotReceived(batch, days, 4, '26-Nov-2023');
          // await sendMessagesToBatch(batch, days, 4,'26-Nov-2023');
          // Set a timeout to check if all users have received messages
          // setTimeout(() => {
          if (allUsersReceivedMessages()) {
            // All users have received messages, exit the scheduler
            console.log("All users have received messages. Stopping scheduler.");
            task4.stop();
            break;
          } else {
            console.log("Not all users have received messages. Continuing...");
          }
          // }, 60000); // Check after 1 minute
        }
      } catch (error) {
        console.error('Error sending WhatsApp message:', error);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata"
    });
    // Define and start the cron job to send batches of messages //7am on 27 november
    const task5 = cron.schedule('00 07 27 11 *', async () => {
      try {
        for (let i = 0; i < numBatches; i++) {
          console.log("i", i);

          const batch = data.slice(i * batchSize, (i + 1) * batchSize);
          const days = 'WE ARE READY TO WELCOME YOU';

          console.log("batch", batch);
          // Use the new function to send messages only if the batch hasn't received messages
          await sendMessagesToBatchIfNotReceived(batch, days, 5, '27-Nov-2023');
          // await sendMessagesToBatch(batch, days, 5,'27-Nov-2023');
          // Set a timeout to check if all users have received messages
          // setTimeout(() => {
          if (allUsersReceivedMessages()) {
            // All users have received messages, exit the scheduler
            console.log("All users have received messages. Stopping scheduler.");
            task5.stop();
            break;
          } else {
            console.log("Not all users have received messages. Continuing...");
          }
          // }, 60000); // Check after 1 minute
        }
      } catch (error) {
        console.error('Error sending WhatsApp message:', error);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata"
    });

    // Start the cron job

    task1.start();
    task2.start();
    task3.start();
    task4.start();
    task5.start();

  })
  .catch((error) => {
    console.error('Error fetching user data:', error);
  });


// Example usage
const linkToEncode = 'https://www.pharmapreconnectcongress.com/delegate-registration';
SAVEQR.generateQRCodeAndSaveforVender(linkToEncode);
//for agenda download
const linkToEncodeForAgenda = 'https://apis.pharmapreconnectcongress.com/src/uploads/agenda/Agenda_Pharma_Preconnect.pdf';
SAVEQR.generateQRCodeAndSaveforDownloadAgenda(linkToEncodeForAgenda);
//for broucher download
const linkToEncodeForBroucher = 'https://apis.pharmapreconnectcongress.com/src/uploads/broucher/Pre_Connect_Spex_Bro.pdf';
SAVEQR.generateQRCodeAndSaveforDownloadBroucher(linkToEncodeForBroucher);
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);

});



