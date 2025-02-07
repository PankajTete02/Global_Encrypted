const peacekeeperModel = require('../models/peacekeeperModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const delegate_user_email = require("../../middlewares/email");
const nodemailer = require('nodemailer');
const qrcode = require('qrcode');
const sharp = require('sharp');
const ejs = require('ejs');
const { createCanvas, loadImage } = require("canvas");
const PDFDocument = require("pdfkit");
require('dotenv').config();
const { log, error } = require('console');
const uploadPath = path.join(__dirname, '../uploads/profile_pics');

//main
//const { PDFDocument } = require('pdf-lib');
//test
const stripe = require('stripe')('sk_test_51QSuqmCco9ltycd0nRlrJoCLGhFItJ1IEzUqdMUimJ14hNOvWLCGiQbiNTrzDOOWAVCnEesjlcnZ6Vu0Wd4ozbNQ00Suza4H9F');
//live
//const stripe = require('stripe')('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');
// Ensure the directory exists, if not, create it
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));  // Add file extension
  }
});

// Set file validation rules (only allow images)
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
}).single('profile_picture');

// Function to create peacekeeper
const createPeacekeeper = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      // If the error is due to invalid file type, return a specific error response
      if (err.message && err.message.includes('Invalid file type')) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Invalid file type. Only .jpg, .jpeg, .png are allowed."
        });
      }
      // For any other errors, respond with a general upload error
      return res.status(500).json({
        success: false,
        error: true,
        message: "Error uploading file.",
        errorMessage: err.message
      });
    }
 
    const { full_name, country, email_id, dob, mobile_number, country_code, Check_email, url, is_active } = req.body;
 
    const errors = [];
 
    // Required fields validation
    const requiredFields = ["full_name", "email_id", "mobile_number", "dob"];
    requiredFields.forEach(field => {
        if (!req.body[field]) {
            errors.push(`${field} is required`);
        }
    });
   
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email_id && !emailRegex.test(email_id)) {
        errors.push("Invalid email format");
    }
   
    // Validate mobile number (only digits)
    if (mobile_number.trim() && !/^\+\d{1,6} \d+$/.test(mobile_number.trim())) {
      errors.push("Mobile number should start with a country code (e.g., +91), contain a space, followed by digits without spaces or special characters");
  }
 
   
    // Validate DOB (YYYY-MM-DD format and a past date)
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dob) {
        if (!dobRegex.test(dob)) {
            errors.push("DOB should be in the format YYYY-MM-DD");
        } else {
            const dobDate = new Date(dob);
            const today = new Date();
            if (dobDate >= today) {
                errors.push("DOB should be a past date");
            }
        }
    }
 
    if (errors.length > 0) {
      return res.status(400).json({
          success: false,
          error: true,
          message: errors[0] // Returning only the first validation error
      });
  }
 
    // If file upload is successful, the file information will be available in `req.file`
    const file_name = req.file ? req.file.filename : null;  // File name (e.g., "profilepic-12345.jpg")
    const file_path = req.file ? req.file.filename : null;  // Only store the file name and extension
    const file_type = req.file ? req.file.mimetype : null;   // File type (e.g., "image/jpeg")
 
    const peacekeeperData = {
      full_name,
      country,
      email_id,
      dob,
      mobile_number,
      country_code,
      file_name,
      file_path,  // Storing only the file name and extension
      file_type,
      Check_email,
      url,
      is_active
    };
 
    // Call the model function to insert the peacekeeper data
    peacekeeperModel.insertPeacekeeper(peacekeeperData, async (err, response) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: true,
          message: "Server error",
          errorMessage: err.message
        });
      }
 
      // Handle response from the stored procedure
      if (response[0].response === "fail") {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Email ID already exists."
        });
      } else if (response[0].response === "fail1") {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Mobile number already exists."
        });
      } else if (response[0].response === "success") {
 
 
        console.log("response", response[0]);
        console.log(response[0], "response[0]");
        const name = `${response[0].full_name}`;
        const imageName = `${response[0].coupon_code}.png`;
        const imagePath = path.join(__dirname, '../uploads/delegate_qr', imageName);
 
        // const qrCodeBuffer = await qrcode.toBuffer(response[0].qr_code);
        // console.log(qrCodeBuffer, "qrCodeBuffer")
        // fs.writeFileSync(imagePath, qrCodeBuffer);
 
 
 
        async function generateQRCodeWithImage(imagePath, qr_url) {
          try {
            // Define paths
            const logoPath = path.join(__dirname, "../uploads/delegate_qr", "Logo.png"); // Logo path
 
            const qrCodeBuffer = await qrcode.toBuffer(qr_url, {
              errorCorrectionLevel: 'H', // High error correction for logo overlay
              scale: 10,// Scale for higher resolution QR code
              margin: 1
            });
 
            // Get QR code dimensions
            const qrDimensions = await sharp(qrCodeBuffer).metadata();
            const logoSize = Math.floor(qrDimensions.width / 4); // Resize logo to 1/4 of the QR code size
 
            // Apply circular mask to the logo and enhance quality
            const logoBuffer = await applyCircleMaskToLogo(logoPath, logoSize);
 
            // Process the QR code with the logo overlay
            await sharp(qrCodeBuffer)
              .resize(qrDimensions.width, qrDimensions.height) // Ensure QR code is correct size
              .composite([{
                input: logoBuffer,
                gravity: 'center', // Center the logo in the middle
                blend: 'over', // Overlay the logo onto the QR code
              }])
              .toFile(imagePath); // Save the final image
 
            console.log("QR Code with sharp logo saved at:", imagePath);
          } catch (error) {
            console.error("Error generating QR code:", error);
          }
        }
 
        // Function to apply circular mask to the logo and sharpen it
        async function applyCircleMaskToLogo(logoPath, logoSize) {
          const logoImage = await sharp(logoPath)
            .resize(logoSize, logoSize) // Resize logo to desired size
            .toBuffer();
 
          // Create a circular mask for the logo
          const circleMask = Buffer.from(
            `<svg width="${logoSize}" height="${logoSize}">
                  <circle cx="${logoSize / 2}" cy="${logoSize / 2}" r="${logoSize / 2}" fill="white" />
              </svg>`
          );
 
          // Apply circular mask on logo and sharpen the image
          return sharp(logoImage)
            .composite([{ input: circleMask, blend: 'dest-in' }]) // Apply mask to the logo
            .sharpen(2) // Apply sharpening for better clarity
            .toBuffer();
        }
 
        // Example Usage
        await generateQRCodeWithImage(imagePath, response[0].qr_code);
 
 
        const protocol = "https";
        const personData = {
          username: response[0].full_name || "N/A",
          country: response[0].country_code || "N/A",
          email: response[0].email_id || "N/A",
          idNo: response[0].ID_NO || "N/A",
          file_name: response[0].file_name || null,
          picUrl: `${protocol}://${req.get("host")}/uploads/profile_pics/${response[0].file_name}`,
          qrCodeUrl: `${protocol}://${req.get("host")}/uploads/delegates/${response[0].coupon_code}.png`,
        };
        console.log(personData.file_name, "file_name");
        const photo = response[0].file_name ? `../uploads/profile_pics/${response[0].file_name}` : '../uploads/profile_pics/null.png';
        const baseImagePath = path.join(__dirname, "../uploads/delegate_qr/Final Badge.png");
        const userPhotoPath = path.join(__dirname, photo);
        console.log(baseImagePath, "baseImagePath");
        // const userPhotoPath = `${protocol}://${req.get("host")}/uploads/profile_pics/ac.png`;
        console.log(userPhotoPath, "userPhotoPath");
        const qrCodePath = path.join(__dirname, `../uploads/delegate_qr/${response[0].coupon_code}.png`);
        console.log(response[0].coupon_code, "zxzxcxxcxc");
        const destFolder = path.join(__dirname, "../uploads/batch_photo");
        console.log("asasasa");
        // Ensure the destination folder exists
        if (!fs.existsSync(destFolder)) {
          fs.mkdirSync(destFolder, { recursive: true });
        }
 
        // Load images
        const baseImage = await loadImage(baseImagePath);
        const userPhoto = await loadImage(userPhotoPath);
        const qrCode = await loadImage(qrCodePath);
 
        // Create canvas
        if (req.body.Check_email == 1) {
          const canvas = createCanvas(baseImage.width, baseImage.height);
          const ctx = canvas.getContext("2d");
 
          // Draw base image
          ctx.drawImage(baseImage, 0, 0);
 
          // Draw circular user photo with border
          const photoX = 1450, photoY = 90, photoSize = 800, borderWidth = 4;
          ctx.save();
          ctx.beginPath();
          ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, 2 * Math.PI);
          ctx.clip();
          ctx.drawImage(userPhoto, photoX, photoY, photoSize, photoSize);
          ctx.restore();
 
          ctx.beginPath();
          ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2 + borderWidth / 2, 0, 2 * Math.PI);
          ctx.strokeStyle = "green";
          ctx.lineWidth = borderWidth;
          ctx.stroke();
 
          // Add user details
          ctx.font = "bold 65px Arial";
          ctx.fillStyle = "black";
          ctx.fillText(personData.username, 200, 250);
 
          ctx.font = "bold 55px Arial";
          ctx.fillStyle = "#17598e";
          ctx.fillText("Country:", 200, 350);
          ctx.fillStyle = "black";
          ctx.fillText(personData.country, 440, 350);
 
          ctx.fillStyle = "#17598e";
          ctx.fillText("Mobile:", 200, 420);
          ctx.fillStyle = "black";
          ctx.fillText(response[0].mobile_number || "N/A", 400, 420);
 
          ctx.fillStyle = "#17598e";
          ctx.fillText("E-mail:", 200, 500);
          ctx.fillStyle = "black";
          ctx.fillText(personData.email, 400, 500);
 
          ctx.fillStyle = "#17598e";
          ctx.fillText("ID No:", 200, 580);
          ctx.fillStyle = "black";
          ctx.fillText(personData.idNo, 400, 580);
 
 
          // ctx.fillStyle = "6px Arial #17598e";
          // ctx.fillText(response[0].qr_code, 100, 2440);
          // Add QR code
          const qrCodeX = 1250, qrCodeY = 1850, qrCodeWidth = 400, qrCodeHeight = 400;
          ctx.drawImage(qrCode, qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);
 
          // Save the output
          const outputFilePath = path.join(destFolder, `${response[0].coupon_code}.png`);
          const out = fs.createWriteStream(outputFilePath);
          const stream = canvas.createPNGStream();
          stream.pipe(out);
          out.on("finish", async () => {
            console.log(`Badge saved as PNG at: ${outputFilePath}`);
            const destFolderPdf = path.join(__dirname, "../uploads/badge_pdf");
            // Create a PDF document and save it
            const pdfFilePath = path.join(destFolderPdf, `${response[0].coupon_code}.pdf`);
            const doc = new PDFDocument();
 
            doc.pipe(fs.createWriteStream(pdfFilePath));
            const margin = 0;
            doc.image(outputFilePath, {
              fit: [650 - margin * 2, 650 - margin * 2], // Adjust fit dimensions based on margins
              align: "center",
              valign: "center",
              x: margin, // X-coordinate to include the left margin
              y: margin, // Y-coordinate to include the top margin
            });
            doc.fillColor('black').font('Helvetica-Bold').fontSize(8).text("To Register as a Delegate ,Click the below link", 240, 625, {
              link: response[0].qr_code, // This makes the link clickable
              underline: true // Optional: underline the link for emphasis
            });
 
            doc.fillColor('blue').font('Helvetica-Bold').fontSize(10).text(response[0].qr_code, 120, 638, {
              link: response[0].qr_code, // This makes the link clickable
              underline: true, // Optional: underline the link for emphasis
            });
 
            doc.end();
 
            console.log(`Badge saved as PDF at: ${pdfFilePath}`);
          });
 
        }
        else {
          const canvas = createCanvas(baseImage.width, baseImage.height);
          const ctx = canvas.getContext("2d");
 
          // Draw base image
          ctx.drawImage(baseImage, 0, 0);
 
          // Draw circular user photo with border
          const photoX = 1450, photoY = 90, photoSize = 800, borderWidth = 4;
          ctx.save();
          ctx.beginPath();
          ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, 2 * Math.PI);
          ctx.clip();
          ctx.drawImage(userPhoto, photoX, photoY, photoSize, photoSize);
          ctx.restore();
 
          ctx.beginPath();
          ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2 + borderWidth / 2, 0, 2 * Math.PI);
          ctx.strokeStyle = "green";
          ctx.lineWidth = borderWidth;
          ctx.stroke();
 
          // Add user details
          ctx.font = "bold 65px Arial";
          ctx.fillStyle = "black";
          ctx.fillText(personData.username, 200, 250);
 
          ctx.font = "bold 55px Arial";
          ctx.fillStyle = "#17598e";
          ctx.fillText("Country:", 200, 350);
          ctx.fillStyle = "black";
          ctx.fillText(personData.country, 440, 350);
 
          // ctx.fillStyle = "#17598e";
          // ctx.fillText("Mobile:", 200, 420);
          // ctx.fillStyle = "black";
          // ctx.fillText(response[0].mobile_number || "N/A", 400, 420);
 
          // ctx.fillStyle = "#17598e";
          // ctx.fillText("E-mail:", 200, 500);
          // ctx.fillStyle = "black";
          // ctx.fillText(personData.email, 400, 500);
 
          ctx.fillStyle = "#17598e";
          ctx.fillText("ID No:", 200, 420);
          ctx.fillStyle = "black";
          ctx.fillText(personData.idNo, 400, 420);
 
 
          // ctx.fillStyle = "6px Arial #17598e";
          // ctx.fillText(response[0].qr_code, 100, 2440);
          // Add QR code
          const qrCodeX = 1250, qrCodeY = 1850, qrCodeWidth = 400, qrCodeHeight = 400;
          ctx.drawImage(qrCode, qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);
 
          // Save the output
          const outputFilePath = path.join(destFolder, `${response[0].coupon_code}.png`);
          const out = fs.createWriteStream(outputFilePath);
          const stream = canvas.createPNGStream();
          stream.pipe(out);
          out.on("finish", async () => {
            console.log(`Badge saved as PNG at: ${outputFilePath}`);
            const destFolderPdf = path.join(__dirname, "../uploads/badge_pdf");
            // Create a PDF document and save it
            const pdfFilePath = path.join(destFolderPdf, `${response[0].coupon_code}.pdf`);
            const doc = new PDFDocument();
 
            doc.pipe(fs.createWriteStream(pdfFilePath));
            const margin = 0;
            doc.image(outputFilePath, {
              fit: [650 - margin * 2, 650 - margin * 2], // Adjust fit dimensions based on margins
              align: "center",
              valign: "center",
              x: margin, // X-coordinate to include the left margin
              y: margin, // Y-coordinate to include the top margin
            });
            doc.fillColor('black').font('Helvetica-Bold').fontSize(8).text("To Register as a Delegate ,Click the below link", 240, 625, {
              link: response[0].qr_code, // This makes the link clickable
              underline: true // Optional: underline the link for emphasis
            });
 
            doc.fillColor('blue').font('Helvetica-Bold').fontSize(10).text(response[0].qr_code, 120, 638, {
              link: response[0].qr_code, // This makes the link clickable
              underline: true, // Optional: underline the link for emphasis
            });
 
            doc.end();
 
            console.log(`Badge saved as PDF at: ${pdfFilePath}`);
          });
 
        }
        console.log("batch photo successfully saved");
        const destFolder1 = path.join(__dirname, "../uploads/badge_pdf");
        const destFolder2 = path.join(__dirname, "../uploads/batch_photo");
 
        const couponCode = response[0]?.coupon_code;
        if (!couponCode) {
          console.error("Error: coupon_code is undefined in response[0].");
 
        }
        console.log(couponCode, "//////");
        const imageName1 = `${couponCode}.png`;
        console.log(destFolder2, "destFolder2");
        const imagePath_pdf = path.join(destFolder2, imageName1);
        console.log(imagePath_pdf, "imagePath_pdf");
 
 
        const pdfPath = path.join(destFolder1, `${couponCode}.pdf`);
        console.log(pdfPath, "pdfPath");
        console.log(`${couponCode} processing complete.`);
 
        const transporter = nodemailer.createTransport({
          service: 'gmail', // or use any other email provider
          auth: {
            user: 'Peacekeeper@global-jlp-summit.com', // your email address
            pass: 'tusi xeoi hxoz fwwb'   // your email password
          }
        });
        const mailOptions = {
          from: 'Peacekeeper@global-jlp-summit.com',
          to: `${response[0].email_id}`,  // Adjust recipient
          // to: "udayshimpi2000@gmail.com",
          subject: 'Peacekeeper Badge generated successfully',
          html: `<img src="cid:qrCodeImage" alt="QR Code" style="width: 50%; height: 50%;border: 1px solid green;" />`,
          attachments: [
            {
              filename: `${response[0].coupon_code}.png`, // Assuming coupon_code exists in response[0]
              path: path.join(__dirname, '../uploads/batch_photo', `${response[0].coupon_code}.png`),
              cid: 'qrCodeImage' // Same Content-ID as used in the HTML
            },
            {
              filename: `${response[0].coupon_code}.pdf`, // Assuming coupon_code exists in response[0]
              path: path.join(__dirname, '../uploads/badge_pdf', `${response[0].coupon_code}.pdf`),
              cid: 'qrCodeImage_pdf' // Same Content-ID as used in the HTML
            }
          ]
 
        };
 
 
        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email:', error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
 
        return res.status(201).json({
          success: true,
          error: false,
          message: "Peacekeeper profile created successfully.",
          message1: response[0].response,
          peacekeeper_id: response[0].peacekeeper_id,  // Return the peacekeeper ID
          QR_code: `${protocol}://${req.get("host")}/uploads/delegates/${response[0].coupon_code}.png`,
          batch: `${protocol}://${req.get("host")}/uploads/batch/photo/${response[0].coupon_code}.png`,
          Data: peacekeeperData,
        });
 
      } else {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Unknown error."
        });
      }
    });
  })
}

const update_Peacekeeper = (req, res) => {
  console.log(req.body.peace_id.length, "peace_id.length")
  if (req.body.peace_id.length == "0") {
    return res.status(500).json({
      success: false,
      error: true,
      message: "All field are required"
    });
  }
  else {
    peacekeeperModel.updatePeacekeeper(req, async (err, response) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: true,
          message: "Server error",
          errorMessage: err.message
        });
      }
      else {
        console.log("response", response[0]);
        console.log(response[0], "response[0]");
        const name = `${response[0].full_name}`;
        const imageName = `${response[0].coupon_code}.png`;
        const imagePath = path.join(__dirname, '../uploads/delegate_qr', imageName);

        // const qrCodeBuffer = await qrcode.toBuffer(response[0].qr_code);
        // console.log(qrCodeBuffer, "qrCodeBuffer")
        // fs.writeFileSync(imagePath, qrCodeBuffer);
       
        async function generateQRCodeWithImage(imagePath, qr_url) {
          try {
            // Define paths
            const logoPath = path.join(__dirname, "../uploads/delegate_qr", "Logo.png"); // Logo path

            const qrCodeBuffer = await qrcode.toBuffer(qr_url, {
              errorCorrectionLevel: 'H', // High error correction for logo overlay
              scale: 10,// Scale for higher resolution QR code
              margin: 1
            });

            // Get QR code dimensions
            const qrDimensions = await sharp(qrCodeBuffer).metadata();
            const logoSize = Math.floor(qrDimensions.width / 4); // Resize logo to 1/4 of the QR code size

            // Apply circular mask to the logo and enhance quality
            const logoBuffer = await applyCircleMaskToLogo(logoPath, logoSize);

            // Process the QR code with the logo overlay
            await sharp(qrCodeBuffer)
              .resize(qrDimensions.width, qrDimensions.height) // Ensure QR code is correct size
              .composite([{
                input: logoBuffer,
                gravity: 'center', // Center the logo in the middle
                blend: 'over', // Overlay the logo onto the QR code
              }])
              .toFile(imagePath); // Save the final image

            console.log("QR Code with sharp logo saved at:", imagePath);
          } catch (error) {
            console.error("Error generating QR code:", error);
          }
        }

        // Function to apply circular mask to the logo and sharpen it
        async function applyCircleMaskToLogo(logoPath, logoSize) {
          const logoImage = await sharp(logoPath)
            .resize(logoSize, logoSize) // Resize logo to desired size
            .toBuffer();

          // Create a circular mask for the logo
          const circleMask = Buffer.from(
            `<svg width="${logoSize}" height="${logoSize}">
                  <circle cx="${logoSize / 2}" cy="${logoSize / 2}" r="${logoSize / 2}" fill="white" />
              </svg>`
          );

          // Apply circular mask on logo and sharpen the image
          return sharp(logoImage)
            .composite([{ input: circleMask, blend: 'dest-in' }]) // Apply mask to the logo
            .sharpen(2) // Apply sharpening for better clarity
            .toBuffer();
        }

        // Example Usage
        await generateQRCodeWithImage(imagePath, response[0].qr_code);
      
       
       
        const protocol = "https";
        const personData = {
          username: response[0].full_name || "N/A",
          country: response[0].country_code || "N/A",
          email: response[0].email_id || "N/A",
          idNo: response[0].ID_NO || "N/A",
          file_name: response[0].file_name || null,
          picUrl: `${protocol}://${req.get("host")}/uploads/profile_pics/${response[0].file_name}`,
          qrCodeUrl: `${protocol}://${req.get("host")}/uploads/delegates/${response[0].coupon_code}.png`,
        };
        console.log(personData.file_name, "file_name");
        const photo = response[0].file_name ? `../uploads/profile_pics/${response[0].file_name}` : '../uploads/profile_pics/null.png';
        const baseImagePath = path.join(__dirname, "../uploads/delegate_qr/Final Badge.png");
        const photo1 = `../uploads/profile_pics/null.png`;
        const userPhotoPath = path.join(__dirname, photo);

        console.log(baseImagePath, "baseImagePath");
        // const userPhotoPath = `${protocol}://${req.get("host")}/uploads/profile_pics/ac.png`;
        console.log(userPhotoPath, "userPhotoPath");
        const qrCodePath = path.join(__dirname, `../uploads/delegate_qr/${response[0].coupon_code}.png`);
        const destFolder = path.join(__dirname, "../uploads/batch_photo");

        console.log("asasasa");
        // Ensure the destination folder exists
        if (!fs.existsSync(destFolder)) {
          fs.mkdirSync(destFolder, { recursive: true });
        }

        // Load images
        const baseImage = await loadImage(baseImagePath);
        try {
          userPhoto = await loadImage(userPhotoPath);
        } catch (error) {
          console.error("Unable to read userPhotoPath. Using default photo path:", error);
          userPhoto = await loadImage(path.join(__dirname, "../uploads/profile_pics/null.png"));
        }
        const qrCode = await loadImage(qrCodePath);
        console.log("mail", response[0].check_email);
        if (response[0].check_email == 1) {
          const canvas = createCanvas(baseImage.width, baseImage.height);
          const ctx = canvas.getContext("2d");

          // Draw base image
          ctx.drawImage(baseImage, 0, 0);

          // Draw circular user photo with border
          const photoX = 1450, photoY = 90, photoSize = 800, borderWidth = 4;
          ctx.save();
          ctx.beginPath();
          ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, 2 * Math.PI);
          ctx.clip();
          ctx.drawImage(userPhoto, photoX, photoY, photoSize, photoSize);
          ctx.restore();

          ctx.beginPath();
          ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2 + borderWidth / 2, 0, 2 * Math.PI);
          ctx.strokeStyle = "green";
          ctx.lineWidth = borderWidth;
          ctx.stroke();

          // Add user details
          ctx.font = "bold 65px Arial";
          ctx.fillStyle = "black";
          ctx.fillText(personData.username, 200, 250);

          ctx.font = "bold 55px Arial";
          ctx.fillStyle = "#17598e";
          ctx.fillText("Country:", 200, 350);
          ctx.fillStyle = "black";
          ctx.fillText(personData.country, 440, 350);

          ctx.fillStyle = "#17598e";
          ctx.fillText("Mobile:", 200, 420);
          ctx.fillStyle = "black";
          ctx.fillText(response[0].mobile_number || "N/A", 400, 420);

          ctx.fillStyle = "#17598e";
          ctx.fillText("E-mail:", 200, 500);
          ctx.fillStyle = "black";
          ctx.fillText(personData.email, 400, 500);

          ctx.fillStyle = "#17598e";
          ctx.fillText("ID No:", 200, 580);
          ctx.fillStyle = "black";
          ctx.fillText(personData.idNo, 400, 580);


          // ctx.fillStyle = "6px Arial #17598e";
          // ctx.fillText(response[0].qr_code, 100, 2440);
          // Add QR code
          const qrCodeX = 1250, qrCodeY = 1850, qrCodeWidth = 400, qrCodeHeight = 400;
          ctx.drawImage(qrCode, qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);

          // Save the output
          const outputFilePath = path.join(destFolder, `${response[0].coupon_code}.png`);
          const out = fs.createWriteStream(outputFilePath);
          const stream = canvas.createPNGStream();
          stream.pipe(out);
          out.on("finish", async () => {
            console.log(`Badge saved as PNG at: ${outputFilePath}`);
            const destFolderPdf = path.join(__dirname, "../uploads/badge_pdf");
            // Create a PDF document and save it
            const pdfFilePath = path.join(destFolderPdf, `${response[0].coupon_code}.pdf`);
            const doc = new PDFDocument();

            doc.pipe(fs.createWriteStream(pdfFilePath));
            const margin = 0;
            doc.image(outputFilePath, {
              fit: [650 - margin * 2, 650 - margin * 2], // Adjust fit dimensions based on margins
              align: "center",
              valign: "center",
              x: margin, // X-coordinate to include the left margin
              y: margin, // Y-coordinate to include the top margin
            });
            doc.fillColor('black').font('Helvetica-Bold').fontSize(8).text("To Register as a Delegate ,Click the below link", 240, 625, {
              link: response[0].qr_code, // This makes the link clickable
              underline: true // Optional: underline the link for emphasis
            });

            doc.fillColor('blue').font('Helvetica-Bold').fontSize(10).text(response[0].qr_code, 120, 638, {
              link: response[0].qr_code, // This makes the link clickable
              underline: true, // Optional: underline the link for emphasis
            });

            doc.end();

            console.log(`Badge saved as PDF at: ${pdfFilePath}`);
          });

        }
        else {
          const canvas = createCanvas(baseImage.width, baseImage.height);
          const ctx = canvas.getContext("2d");

          // Draw base image
          ctx.drawImage(baseImage, 0, 0);

          // Draw circular user photo with border
          const photoX = 1450, photoY = 90, photoSize = 800, borderWidth = 4;
          ctx.save();
          ctx.beginPath();
          ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, 2 * Math.PI);
          ctx.clip();
          ctx.drawImage(userPhoto, photoX, photoY, photoSize, photoSize);
          ctx.restore();

          ctx.beginPath();
          ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2 + borderWidth / 2, 0, 2 * Math.PI);
          ctx.strokeStyle = "green";
          ctx.lineWidth = borderWidth;
          ctx.stroke();

          // Add user details
          ctx.font = "bold 65px Arial";
          ctx.fillStyle = "black";
          ctx.fillText(personData.username, 200, 250);

          ctx.font = "bold 55px Arial";
          ctx.fillStyle = "#17598e";
          ctx.fillText("Country:", 200, 350);
          ctx.fillStyle = "black";
          ctx.fillText(personData.country, 440, 350);

          // ctx.fillStyle = "#17598e";
          // ctx.fillText("Mobile:", 200, 420);
          // ctx.fillStyle = "black";
          // ctx.fillText(response[0].mobile_number || "N/A", 400, 420);

          // ctx.fillStyle = "#17598e";
          // ctx.fillText("E-mail:", 200, 500);
          // ctx.fillStyle = "black";
          // ctx.fillText(personData.email, 400, 500);

          ctx.fillStyle = "#17598e";
          ctx.fillText("ID No:", 200, 420);
          ctx.fillStyle = "black";
          ctx.fillText(personData.idNo, 400, 420);


          // ctx.fillStyle = "6px Arial #17598e";
          // ctx.fillText(response[0].qr_code, 100, 2440);
          // Add QR code
          const qrCodeX = 1250, qrCodeY = 1850, qrCodeWidth = 400, qrCodeHeight = 400;
          ctx.drawImage(qrCode, qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);

          // Save the output
          const outputFilePath = path.join(destFolder, `${response[0].coupon_code}.png`);
          const out = fs.createWriteStream(outputFilePath);
          const stream = canvas.createPNGStream();
          stream.pipe(out);
          out.on("finish", async () => {
            console.log(`Badge saved as PNG at: ${outputFilePath}`);
            const destFolderPdf = path.join(__dirname, "../uploads/badge_pdf");
            // Create a PDF document and save it
            const pdfFilePath = path.join(destFolderPdf, `${response[0].coupon_code}.pdf`);
            const doc = new PDFDocument();

            doc.pipe(fs.createWriteStream(pdfFilePath));
            const margin = 0;
            doc.image(outputFilePath, {
              fit: [650 - margin * 2, 650 - margin * 2], // Adjust fit dimensions based on margins
              align: "center",
              valign: "center",
              x: margin, // X-coordinate to include the left margin
              y: margin, // Y-coordinate to include the top margin
            });
            doc.fillColor('black').font('Helvetica-Bold').fontSize(8).text("To Register as a Delegate ,Click the below link", 240, 625, {
              link: response[0].qr_code, // This makes the link clickable
              underline: true // Optional: underline the link for emphasis
            });

            doc.fillColor('blue').font('Helvetica-Bold').fontSize(10).text(response[0].qr_code, 120, 638, {
              link: response[0].qr_code, // This makes the link clickable
              underline: true, // Optional: underline the link for emphasis
            });

            doc.end();

            console.log(`Badge saved as PDF at: ${pdfFilePath}`);
          });

        }

        const destFolder1 = path.join(__dirname, "../uploads/badge_pdf");
        console.log(response[0].coupon_code, "//////");
        const imagePath_pdf = path.join(destFolder, `${response[0].coupon_code}.png`);
        console.log(imagePath_pdf, "imagePath_pdf")
        console.log(response[0].coupon_code, "cvcvcvcv");
        const pdfPath = path.join(destFolder1, `${response[0].coupon_code}.pdf`);
        console.log(pdfPath, "pdfPath");

        const transporter = nodemailer.createTransport({
          service: 'gmail', // or use any other email provider
          auth: {
            user: 'Peacekeeper@global-jlp-summit.com', // your email address
            pass: 'tusi xeoi hxoz fwwb'   // your email password
          }
        });
        const qrCodeUrl = `${protocol}://${req.get("host")}/uploads/delegates/${imageName}`;
        const mailOptions = {
          from: 'Peacekeeper@global-jlp-summit.com',
          to: `${response[0].email_id}`,  // Adjust recipient
          //to: "udayshimpi2000@gmail.com",
          subject: 'Here`s your Peacekeeper Badge again!',
          html: `<img src="cid:qrCodeImage" alt="QR Code" style="width: 50%; height: 50%;" />`,
          attachments: [

            {
              filename: `${response[0].coupon_code}.png`, // Assuming coupon_code exists in response[0]
              path: path.join(__dirname, '../uploads/batch_photo', `${response[0].coupon_code}.png`),
              cid: 'qrCodeImage' // Same Content-ID as used in the HTML
            },
            {
              filename: `${response[0].coupon_code}.pdf`, // Assuming coupon_code exists in response[0]
              path: path.join(__dirname, '../uploads/badge_pdf', `${response[0].coupon_code}.pdf`),
              cid: 'qrCodeImage_pdf' // Same Content-ID as used in the HTML
            }

          ]
        };


        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email:', error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });



        return res.status(201).json({
          success: true,
          error: false,
          message: response[0].response
        });
      }

    });
  }


};

const getPeacekeeperData = async (req, res) => {
  const peacekeeperId = req.params.id;

  if (!peacekeeperId) {
    return res.status(400).json({
      success: false,
      message: 'Peacekeeper ID is required'
    });
  }

  try {
    const peacekeeperData = await peacekeeperModel.getPeacekeeperData(peacekeeperId);

    if (peacekeeperData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Peacekeeper not found'
      });
    }
    // Generate URL for the file paths
    const protocol = "https";  // You can set it dynamically based on your environment
    const basePath = `${protocol}://${req.get("host")}/uploads`;  // This generates the base URL for your files

    // If the peacekeeper has a file name, construct the file URL
    const fileNames = peacekeeperData[0].File_Name;
    const fileUrls = fileNames
      ? fileNames.split(", ").map((fileName) => `${basePath}/${fileName.trim()}`)
      : [];

    // Add the generated file URLs to the response data
    peacekeeperData[0].file_urls = fileUrls;

    return res.status(200).json({
      success: true,
      message: 'Peacekeeper data retrieved successfully',
      QR_code: `${protocol}://${req.get("host")}/uploads/delegates/${peacekeeperData[0].coupon_code}.png`,
      data: peacekeeperData[0]
    });
  } catch (error) {
    console.error('Error fetching peacekeeper data:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error, please try again later'
    });
  }
};

const getAllPeacekeeperData = (req, res) => {
  // Call the model function to fetch peacekeeper data
  peacekeeperModel.getAllPeacekeepers((err, peacekeepers) => {
    if (err) {
      console.error("Error fetching peacekeeper data: ", err);
      return res.status(500).json({
        success: false,
        error: true,
        message: "Server error.",
        details: err
      });
    }
    console.log(peacekeepers, "peacekeepers");
    console.log(peacekeepers[0].file_name, "file_name");
    console.log(peacekeepers.length, "length");

    for (let i = 0; i < peacekeepers.length; i++) {
      const imageFileNames = peacekeepers[i].file_name;
      const protocol = "https";
      const basePath = `${protocol}://${req.get("host")}/uploads`;
      const imagePaths = imageFileNames
        ? imageFileNames
          .split(", ")
          .map((fileName) => `${basePath}/${fileName.trim()}`)
        : [];
      console.log("Image Paths:", imagePaths);
      peacekeepers[i].file_name = imagePaths;
      console.log(i)
    }
    // If data is successfully fetched, return it in the response
    return res.status(200).json({
      success: true,
      error: false,
      data: peacekeepers,
      message: "Peacekeeper data fetched successfully."
    });
  });
};

const getAllContactUsData = (req, res) => {
  // Call the model function to fetch peacekeeper data
  peacekeeperModel.getAllContactUs((err, peacekeepers) => {
    if (err) {
      console.error("Error fetching peacekeeper data: ", err);
      return res.status(500).json({
        success: false,
        error: true,
        message: "Server error.",
        details: err
      });
    }

    // If data is successfully fetched, return it in the response
    return res.status(200).json({
      success: true,
      error: false,
      data: peacekeepers,
      message: "Contact data fetched successfully."
    });
  });
};

const getAllEmailData = async (req, res) => {
  try {
    // Use Promise to handle the peacekeeper data retrieval
    const peacekeepers = await new Promise((resolve, reject) => {
      peacekeeperModel.getAllEmaildetails(req, (err, peacekeepers) => {
        if (err) {
          reject(err); // Reject promise if there's an error
        } else {
          resolve(peacekeepers); // Resolve with the data
        }
      });
    });

    // Fetch the delegate user email data asynchronously
    const response = await delegate_user_email.delegate_user_email(res, peacekeepers);
    console.log(response, "response");
    // If data is successfully fetched, return it in the response
    // return res.status(200).json({
    //     success: true,
    //     error: false,
    //     data: peacekeepers,
    //     message: "Contact data fetched successfully."
    // });
  } catch (err) {
    // Catch any errors from the above async functions
    console.error("Error fetching data: ", err);
    return res.status(500).json({
      success: false,
      error: true,
      message: "Server error.",
      details: err
    });
  }
};

const deletePeacekeeperData = async (req, res) => {
  const peacekeeperId = req.body.p_peace_id;

  if (!peacekeeperId) {
    return res.status(400).json({
      success: false,
      message: 'Peacekeeper ID is required'
    });
  }

  try {
    const peacekeeperData = await peacekeeperModel.deletePeacekeeperData(peacekeeperId);
    // Generate URL for the file paths
    console.log(peacekeeperData, "peacekeeperData");
    return res.status(200).json({
      success: true,
      message: peacekeeperData[0].result,
      error: false
      // QR_code: `${protocol}://${req.get("host")}/uploads/delegates/${peacekeeperData[0].coupon_code}.png`,
      // data: peacekeeperData[0]
    });
  } catch (error) {
    console.error('Error fetching peacekeeper data:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error, please try again later'
    });
  }
};


const discountPeacekeeperData = async (req, res) => {
  const peacekeeperId = req.body.p_peace_id;

  if (!peacekeeperId) {
    return res.status(400).json({
      success: false,
      message: 'Peacekeeper ID is required'
    });
  }

  try {
    const peacekeeperData = await peacekeeperModel.discountPeacekeeperData(peacekeeperId);
    console.log(peacekeeperData, "peacekeeperData");
    const name = peacekeeperData[0].first_name;
    console.log(name, "name");
    const discount_url = `https://www.justice-love-peace.com/payment-status/?email=${peacekeeperData[0].email}`;
    //const discount_url=`https://globaljusticeuat.cylsys.com/payment-status/?email=${peacekeeperData[0].email}`;
    console.log(peacekeeperData[0].reference_no.length, "length");
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'Peacekeeper@global-jlp-summit.com',
        pass: 'tusi xeoi hxoz fwwb'
      }
    });

    const with_discount = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Discount</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      .mq {
        width: 710px;
      }

      /* Extra small devices (phones, 600px and down) */
      @media only screen and (max-width: 600px) {
        .mq {
          width: 300px;
        }
        .mqfont {
          font-size: 16px;
        }
      }

      /* Small devices (portrait tablets and large phones, 600px and up) */
      @media only screen and (min-width: 600px) {
        .mq {
          width: 300px;
        }
      }

      /* Medium devices (landscape tablets, 768px and up) */
      @media only screen and (min-width: 768px) {
        .mq {
          width: 710px;
        }
      }

      /* Large devices (laptops/desktops, 992px and up) */
      @media only screen and (min-width: 992px) {
        .mq {
          width: 710px;
        }
      }

      /* Extra large devices (large laptops and desktops, 1200px and up) */
      @media only screen and (min-width: 1200px) {
        .mq {
          width: 710px;
        }
      }
      .mqimg {
        width: 100px !important;
      }
      .mqimg1 {
        width: 100px !important;
      }
      .mqimg1 {
        width: 100px !important;
      }
    </style>
  </head>
  <body style="padding: 0px; margin: 0px">
    <table
      width="100%"
      border="0"
      cellspacing="0"
      cellpadding="0"
      align="center"
      style="
        font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      "
    >
      <tbody>
        <tr>
          <td>
            <table
              width="710"
              border="0"
              cellspacing="0"
              cellpadding="5"
              align="center"
            >
              <tbody>
                <tr>
                  <td style="padding: 0">
                    <img src="https://devglobaljusticeapis.cylsys.com/middle_ware/photo/head.png" alt="" width="100%" />
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
        <tr>
          <td>
            <table
              width="710"
              border="0"
              cellspacing="0"
              cellpadding="5"
              align="center"
              style="
                background: linear-gradient(180deg, #bdc78c2e 0%, #bdc78c 100%);
              "
            >
              <tbody>
                <tr>
                  <td>
                    <table style="padding: 0 50px">
                      <tbody>
                        <tr>
                          <td>
                            <table
                              width="100%"
                              border="0"
                              cellspacing="0"
                              cellpadding="0"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    style="
                                      font-size: 18px;
                                      line-height: 25px;
                                      font-family: Gotham, 'Helvetica Neue',
                                        Helvetica, Arial, sans-serif;
                                    "
                                  >
                                    <p><b>Hi ${name},</b></p>
                                    <p
                                      style="
                                        font-size: 14px;
                                        font-weight: 500;
                                        line-height: 22px;
                                        text-align: left;
                                        text-underline-position: from-font;
                                        text-decoration-skip-ink: none;
                                      "
                                    >
                                      Thank you for submitting your registration
                                      for the Global Justice, Love & Peace
                                      Summit in Dubai on 12th-13th April 2025.
                                    </p>
                                    <p
                                      style="
                                        font-size: 14px;
                                        font-weight: 500;
                                        line-height: 22px;
                                        text-align: left;
                                        text-underline-position: from-font;
                                        text-decoration-skip-ink: none;
                                      "
                                    >
                                      We are delighted to confirm that your
                                      reference QR code has been successfully
                                      applied, entitling you to an exclusive 7%
                                      discount on the registration fee. To
                                      complete your registration, please proceed
                                      with the discounted payment of USD 2604 via
                                      the link below:
                                    </p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <table
                              width="100%"
                              border="0"
                              cellspacing="0"
                              cellpadding="0"
                              style="padding: 0"
                            >
                              <tbody>
                                <tr>
                                  <td>
                                    <p
                                      style="
                                        font-size: 14px;
                                        font-weight: 700;
                                        line-height: 22px;
                                        text-align: left;
                                        text-underline-position: from-font;
                                        text-decoration-skip-ink: none;
                                        color: #128940;
                                        display: flex;
                                        align-items: center;
                                      "
                                    >
                                      Payment Link Here -
                                      <a href=${discount_url}  target="_blank"
                                        style="
                                         background-color: #128940;
                                          color: #ffffff;
                                          box-shadow: 0px 0px 5px 1px #12894066;
                                          border: none;
                                          width: 81px;
                                          padding: 3px;
                                          border-radius: 5px;
                                          margin: 0 10px;
                                          text-decoration: none;
                                          text-align: center;
                                        "
                                      >
                                        Pay
                                      </a>
                                    </p>
                                  </td>
                                </tr>
                                <tr>
                                  <td>
                                    <p
                                      style="
                                        font-size: 14px;
                                        font-weight: 500;
                                        line-height: 22px;
                                        text-align: left;
                                        text-underline-position: from-font;
                                        text-decoration-skip-ink: none;
                                      "
                                    >
                                      We are excited to have you join us at this
                                      extraordinary event. Should you require
                                      any assistance, our support team is here
                                      to help.
                                    </p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <table
                              width="100%"
                              border="0"
                              cellspacing="0"
                              cellpadding="0"
                            >
                              <tbody>
                                <tr>
                                  <td>
                                    <p
                                      style="
                                        font-size: 14px;
                                        font-weight: 400;
                                        line-height: 22px;
                                        text-align: left;
                                        text-underline-position: from-font;
                                        text-decoration-skip-ink: none;
                                        margin: 0;
                                      "
                                    >
                                      Warm regards,
                                    </p>
                                    <p
                                      style="
                                        font-size: 14px;
                                        font-weight: 600;
                                        line-height: 22px;
                                        text-align: left;
                                        text-underline-position: from-font;
                                        text-decoration-skip-ink: none;
                                        margin: 0;
                                        color: #005a93;
                                      "
                                    >
                                      The Global Justice, Love & Peace Summit
                                      Team
                                    </p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <br /><br />
                  </td>
                </tr>
                <tr>
                  <td>
                    <table
                      width="100%"
                      border="0"
                      cellspacing="0"
                      cellpadding="0"
                      style="
                        border-top: 1px solid #fff;
                        border-bottom: 1px solid #fff;
                      "
                    >
                      <tbody>
                        <tr>
                          <td>
                            <table width="100%">
                              <tbody>
                                <tr>
                                  <td align="center">
                                    <p
                                      style="
                                        font-size: 10px;
                                        font-weight: 400;
                                        line-height: 18px;
                                        text-align: center;
                                        text-underline-position: from-font;
                                        text-decoration-skip-ink: none;
                                      "
                                    >
                                      For any assistance or support, please
                                      reach out to us at
                                      <a
                                        style="color: #0573ba"
                                        href="mailto:help@justice-love-peace.com"
                                        >help@justice-love-peace.com</a
                                      >
                                      <br />
                                      Explore more on our website:
                                      <a
                                        style="color: #0573ba"
                                        href="https://www.justice-love-peace.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        >www.justice-love-peace.com</a
                                      >
                                    </p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td align="center">
                            <table width="100%" style="padding: 1rem 12rem">
                              <tbody>
                                <tr>
                                  <td align="center">
                                    <a
                                      href="https://www.instagram.com/globaljusticelovepeacesummit/
                                              "
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      ><img
                                        src="https://devglobaljusticeapis.cylsys.com/middle_ware/photo/insta.svg"
                                        alt=""
                                    /></a>
                                  </td>
                                  <td align="center">
                                    <a
                                    
                                      href="https://www.facebook.com/GlobalJusticeLoveandPeaceSummit
                          "
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      ><img
                                        src="https://devglobaljusticeapis.cylsys.com/middle_ware/photo/fb.svg"
                                        alt=""
                                    /></a>
                                  </td>
                                  <td align="center">
                                    <a
                                     
                                      href="https://www.youtube.com/@GlobalJusticeLovePeaceSummit/videos"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      ><img
                                        
                                        src="https://devglobaljusticeapis.cylsys.com/middle_ware/photo/youtube.svg"
                                        alt=""
                                    /></a>
                                  </td>
                                  <td align="center">
                                    <a
                                      
                                      href="https://wa.me/+91 9324064978"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      ><img
                                        src="https://devglobaljusticeapis.cylsys.com/middle_ware/photo/whatsApp.svg"
                                        alt=""
                                    /></a>
                                  </td>
                                  <td align="center">
                                    <a
                                     
                                      href="https://www.linkedin.com/company/global-justice-love-peace-summit-2025/posts/?feedView=all"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      ><img
                                        src="https://devglobaljusticeapis.cylsys.com/middle_ware/photo/linkedIn.svg"
                                        alt=""
                                    /></a>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <table>
                      <tbody>
                        <tr>
                          <td
                            align="center"
                            style="
                              font-size: 10px;
                              font-weight: 400;
                              line-height: 12.88px;
                              text-align: center;
                              text-underline-position: from-font;
                              text-decoration-skip-ink: none;
                            "
                          >
                            © 2025 Global Justice, Love & Peace Summit. All
                            rights reserved.
                            <br />
                            <br />
                          </td>
                        </tr>
                        <tr>
                          <td
                            align="center"
                            style="
                              font-size: 10px;
                              font-weight: 400;
                              line-height: 12.88px;
                              text-align: center;
                              text-underline-position: from-font;
                              text-decoration-skip-ink: none;
                            "
                          >
                            You are receiving this message because you
                            registered to join the movement for Global Justice,
                            Love & <br />
                            Peace. By signing up, you agreed to our Terms of Use
                            and Privacy Policies.
                          </td>
                        </tr>
                        <tr>
                          <td
                            align="center"
                            style="
                              font-size: 10px;
                              font-weight: 400;
                              line-height: 12.88px;
                              text-align: center;
                              text-underline-position: from-font;
                              text-decoration-skip-ink: none;
                            "
                          >
                            <ul
                              style="
                                display: flex;
                                padding: 0;
                                justify-content: space-between;
                              "
                            >
                              <li>
                                <a
                                  style="color: #333333"
                                  href="https://www.justice-love-peace.com/accessibility"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  >Accessibility</a
                                >
                              </li>
                              <li>
                                <a
                                  style="color: #333333"
                                  href="https://www.justice-love-peace.com/privacy-policy"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  >Privacy policy</a
                                >
                              </li>
                              <li>
                                <a
                                  style="color: #333333"
                                  href="https://www.justice-love-peace.com/cookie-policy"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  >Cookie Policy</a
                                >
                              </li>
                              <li>
                                <a
                                  style="color: #333333"
                                  href="https://www.justice-love-peace.com/terms-of-use"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  >Terms of use</a
                                >
                              </li>
                              <li>
                                <a
                                  style="color: #333333"
                                  href="https://www.justice-love-peace.com/visitor-terms-conditions"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  >Visitor Terms and Conditions</a
                                >
                              </li>
                            </ul>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`
    const with_full = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Submitting Registration</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      .mq {
        width: 710px;
      }

      /* Extra small devices (phones, 600px and down) */
      @media only screen and (max-width: 600px) {
        .mq {
          width: 300px;
        }
        .mqfont {
          font-size: 16px;
        }
      }

      /* Small devices (portrait tablets and large phones, 600px and up) */
      @media only screen and (min-width: 600px) {
        .mq {
          width: 300px;
        }
      }

      /* Medium devices (landscape tablets, 768px and up) */
      @media only screen and (min-width: 768px) {
        .mq {
          width: 710px;
        }
      }

      /* Large devices (laptops/desktops, 992px and up) */
      @media only screen and (min-width: 992px) {
        .mq {
          width: 710px;
        }
      }

      /* Extra large devices (large laptops and desktops, 1200px and up) */
      @media only screen and (min-width: 1200px) {
        .mq {
          width: 710px;
        }
      }
      .mqimg {
        width: 100px !important;
      }
      .mqimg1 {
        width: 100px !important;
      }
      .mqimg1 {
        width: 100px !important;
      }
    </style>
  </head>
  <body style="padding: 0px; margin: 0px">
    <table
      width="100%"
      border="0"
      cellspacing="0"
      cellpadding="0"
      align="center"
      style="
        font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      "
    >
      <tbody>
        <tr>
          <td>
            <table
              width="710"
              border="0"
              cellspacing="0"
              cellpadding="5"
              align="center"
            >
              <tbody>
                <tr>
                  <td style="padding: 0">
                    <img src="https://devglobaljusticeapis.cylsys.com/middle_ware/photo/head.png" alt="" width="100%" />
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
        <tr>
          <td>
            <table
              width="710"
              border="0"
              cellspacing="0"
              cellpadding="5"
              align="center"
              style="
                background: linear-gradient(180deg, #bdc78c2e 0%, #bdc78c 100%);
              "
            >
              <tbody>
                <tr>
                  <td>
                    <table style="padding: 0 50px">
                      <tbody>
                        <tr>
                          <td>
                            <table
                              width="100%"
                              border="0"
                              cellspacing="0"
                              cellpadding="0"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    style="
                                      font-size: 18px;
                                      line-height: 25px;
                                      font-family: Gotham, 'Helvetica Neue',
                                        Helvetica, Arial, sans-serif;
                                    "
                                  >
                                    <p><b>Hi ${name},</b></p>
                                    <p
                                      style="
                                        font-size: 14px;
                                        font-weight: 500;
                                        line-height: 22px;
                                        text-align: left;
                                        text-underline-position: from-font;
                                        text-decoration-skip-ink: none;
                                      "
                                    >
                                      Thank you for submitting your registration
                                      for the Global Justice, Love & Peace
                                      Summit in Dubai on 12th-13th April 2025.
                                    </p>
                                    <p
                                      style="
                                        font-size: 14px;
                                        font-weight: 500;
                                        line-height: 22px;
                                        text-align: left;
                                        text-underline-position: from-font;
                                        text-decoration-skip-ink: none;
                                      "
                                    >
                                      We are thrilled to have you join us at
                                      this momentous gathering. To complete your
                                      registration, please proceed with the
                                      payment of USD 2800 via the link below:
                                    </p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <table
                              width="100%"
                              border="0"
                              cellspacing="0"
                              cellpadding="0"
                              style="padding: 0"
                            >
                              <tbody>
                                <tr>
                                  <td>
                                    <p
                                      style="
                                        font-size: 14px;
                                        font-weight: 700;
                                        line-height: 22px;
                                        text-align: left;
                                        text-underline-position: from-font;
                                        text-decoration-skip-ink: none;
                                        color: #128940;
                                        display: flex;
                                        align-items: center;
                                      "
                                    >
                                      Payment Link Here -
                                      <a href=${discount_url} target="_blank"
                                        style="
                                          background-color: #128940;
                                          color: #ffffff;
                                          box-shadow: 0px 0px 5px 1px #12894066;
                                          border: none;
                                          width: 81px;
                                          padding: 3px;
                                          border-radius: 5px;
                                          margin: 0 10px;
                                          text-decoration: none;
                                          text-align: center;
                                        "
                                      >
                                        Pay
                                      </a>
                                    </p>
                                  </td>
                                </tr>
                                <tr>
                                  <td>
                                    <p
                                      style="
                                        font-size: 14px;
                                        font-weight: 500;
                                        line-height: 22px;
                                        text-align: left;
                                        text-underline-position: from-font;
                                        text-decoration-skip-ink: none;
                                      "
                                    >
                                      We eagerly await your participation in
                                      this inspiring event. Should you need any
                                      assistance, please do not hesitate to
                                      reach out to our support team.
                                    </p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <table
                              width="100%"
                              border="0"
                              cellspacing="0"
                              cellpadding="0"
                            >
                              <tbody>
                                <tr>
                                  <td>
                                    <p
                                      style="
                                        font-size: 14px;
                                        font-weight: 400;
                                        line-height: 22px;
                                        text-align: left;
                                        text-underline-position: from-font;
                                        text-decoration-skip-ink: none;
                                        margin: 0;
                                      "
                                    >
                                      Warm regards,
                                    </p>
                                    <p
                                      style="
                                        font-size: 14px;
                                        font-weight: 600;
                                        line-height: 22px;
                                        text-align: left;
                                        text-underline-position: from-font;
                                        text-decoration-skip-ink: none;
                                        margin: 0;
                                        color: #005a93;
                                      "
                                    >
                                      The Global Justice, Love & Peace Summit
                                      Team
                                    </p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <br /><br />
                  </td>
                </tr>
                <tr>
                  <td>
                    <table
                      width="100%"
                      border="0"
                      cellspacing="0"
                      cellpadding="0"
                      style="
                        border-top: 1px solid #fff;
                        border-bottom: 1px solid #fff;
                      "
                    >
                      <tbody>
                        <tr>
                          <td>
                            <table width="100%">
                              <tbody>
                                <tr>
                                  <td align="center">
                                    <p
                                      style="
                                        font-size: 10px;
                                        font-weight: 400;
                                        line-height: 18px;
                                        text-align: center;
                                        text-underline-position: from-font;
                                        text-decoration-skip-ink: none;
                                      "
                                    >
                                      For any assistance or support, please
                                      reach out to us at
                                      <a
                                        style="color: #0573ba"
                                        href="mailto:help@justice-love-peace.com"
                                        >help@justice-love-peace.com</a
                                      >
                                      <br />
                                      Explore more on our website:
                                      <a
                                        style="color: #0573ba"
                                        href="https://www.justice-love-peace.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        >www.justice-love-peace.com</a
                                      >
                                    </p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td align="center">
                            <table width="100%" style="padding: 1rem 12rem">
                              <tbody>
                                <tr>
                                  <td align="center">
                                    <a
                                      href="https://www.instagram.com/globaljusticelovepeacesummit/
                                              "
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      ><img
                                        src="https://devglobaljusticeapis.cylsys.com/middle_ware/photo/insta.svg"
                                        alt=""
                                    /></a>
                                  </td>
                                  <td align="center">
                                    <a
                                      href="https://www.facebook.com/GlobalJusticeLoveandPeaceSummit
                          "
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      ><img
                                        src="https://devglobaljusticeapis.cylsys.com/middle_ware/photo/fb.svg"
                                        alt=""
                                    /></a>
                                  </td>
                                  <td align="center">
                                    <a
                                      href="https://www.youtube.com/@GlobalJusticeLovePeaceSummit/videos"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      ><img
                                        src="https://devglobaljusticeapis.cylsys.com/middle_ware/photo/youtube.svg"
                                        alt=""
                                    /></a>
                                  </td>
                                  <td align="center">
                                    <a
                                      href="https://wa.me/+91 9324064978"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      ><img
                                        src="https://devglobaljusticeapis.cylsys.com/middle_ware/photo/whatsApp.svg"
                                        alt=""
                                    /></a>
                                  </td>
                                  <td align="center">
                                    <a
                                      href="https://www.linkedin.com/company/global-justice-love-peace-summit-2025/posts/?feedView=all"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      ><img
                                        src="https://devglobaljusticeapis.cylsys.com/middle_ware/photo/linkedIn.svg"
                                        alt=""
                                    /></a>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <table>
                      <tbody>
                        <tr>
                          <td
                            align="center"
                            style="
                              font-size: 10px;
                              font-weight: 400;
                              line-height: 12.88px;
                              text-align: center;
                              text-underline-position: from-font;
                              text-decoration-skip-ink: none;
                            "
                          >
                            © 2025 Global Justice, Love & Peace Summit. All
                            rights reserved.
                            <br />
                            <br />
                          </td>
                        </tr>
                        <tr>
                          <td
                            align="center"
                            style="
                              font-size: 10px;
                              font-weight: 400;
                              line-height: 12.88px;
                              text-align: center;
                              text-underline-position: from-font;
                              text-decoration-skip-ink: none;
                            "
                          >
                            You are receiving this message because you
                            registered to join the movement for Global Justice,
                            Love & <br />
                            Peace. By signing up, you agreed to our Terms of Use
                            and Privacy Policies.
                          </td>
                        </tr>
                        <tr>
                          <td
                            align="center"
                            style="
                              font-size: 10px;
                              font-weight: 400;
                              line-height: 12.88px;
                              text-align: center;
                              text-underline-position: from-font;
                              text-decoration-skip-ink: none;
                            "
                          >
                            <ul
                              style="
                                display: flex;
                                padding: 0;
                                justify-content: space-between;
                              "
                            >
                              <li>
                                <a
                                  style="color: #333333"
                                  href="https://www.justice-love-peace.com/accessibility"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  >Accessibility</a
                                >
                              </li>
                              <li>
                                <a
                                  style="color: #333333"
                                  href="https://www.justice-love-peace.com/privacy-policy"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  >Privacy policy</a
                                >
                              </li>
                              <li>
                                <a
                                  style="color: #333333"
                                  href="https://www.justice-love-peace.com/cookie-policy"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  >Cookie Policy</a
                                >
                              </li>
                              <li>
                                <a
                                  style="color: #333333"
                                  href="https://www.justice-love-peace.com/terms-of-use"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  >Terms of use</a
                                >
                              </li>
                              <li>
                                <a
                                  style="color: #333333"
                                  href="https://www.justice-love-peace.com/visitor-terms-conditions"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  >Visitor Terms and Conditions</a
                                >
                              </li>
                            </ul>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`

    const mailOptions = {
      from: 'Peacekeeper@global-jlp-summit.com',
      to: `${peacekeeperData[0].email}`,  // Adjust recipient
      //to: "udayshimpi2000@gmail.com",
      subject: 'Delegate at the Global Justice Summit.- It`s just one step away',
      html: peacekeeperData[0].reference_no.length == 0 ? with_full : with_discount,

    };
    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });


    return res.status(200).json({
      success: true,
      message: "Approved & Payment link sent successfully.",
      error: false

    });
  } catch (error) {
    console.error('Error fetching peacekeeper data:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error, please try again later'
    });
  }
};

const session_status = async (req, res) => {

  const peacekeeperId = req.body.email;

  if (!peacekeeperId) {
    return res.status(400).json({
      success: false,
      message: 'User mail is required'
    });
  }
  try {
    // Fetch peacekeeper data
    const peacekeeperData = await peacekeeperModel.sessionPeacekeeperData(peacekeeperId);
    if (!peacekeeperData || peacekeeperData.length === 0) {
      throw new Error('No peacekeeper data found');
    }
    console.log(peacekeeperData, "peacekeeperData");

    // Extract email and product reference number
    const email = peacekeeperData[0].email_id;
    const product = peacekeeperData[0].reference_no || ''; // Default to an empty string if undefined
    console.log(email, "email");
    console.log(product.length, "product length");
    // const product="CCXX";
    // Determine product ID
    // const product_id = (product.length === 1) 
    //     ? 'prod_RZ41OyqGor4hGP' 
    //     : 'prod_RXzzYCc0Tzkwip';

    // Fetch prices for the product
    // const prices = await stripe.prices.list({ product: product_id });
    // if (!prices || prices.data.length === 0) {
    //     throw new Error('No prices found for the product');
    // }
    // const priceId = prices.data[0].id;
    // console.log("Price ID:", priceId);
    // const url="https://globaljusticeuat.cylsys.com";
    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd', // Specify your currency
            product_data: {
              name: product.length == 0 ? 'Without coupon' : 'With coupon', // Optional name for the charge
            },
            //unit_amount: product.length == 0 ? 300 : 200,
            unit_amount: product.length == 0 ? 280000 : 260400, // Amount in the smallest currency unit (e.g., fils for AED)
            //unit_amount: 200,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // success_url: `${process.env.URL_TEST}/success?session_id={CHECKOUT_SESSION_ID}`,
      // cancel_url: `${process.env.URL_TEST}/cancel`,
      success_url: "https://www.justice-love-peace.com/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://www.justice-love-peace.com/cancel",
      expires_at: Math.floor(Date.now() / 1000) + 86400
    });
    console.log(session, "check");
    console.log("Session URL:", session.url);

    res.json({ url: session.url });
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error:', error.message);
    res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

function logError(error) {

  const errorMessage = `[${new Date().toISOString()}] ${error.stack || error}\n`;
  const logFilePath = path.join(__dirname, 'error.log');
  console.log("logFilePath", logFilePath);
  // Append error message to file
  fs.appendFile(logFilePath, errorMessage, (err) => {

    if (err) {

      console.error('Failed to write to log file:', err);

    }

  });

}

logError("hi12");


const amb_badge = async (req, res) => {

  try {

    const jsonData =  [
      // {
      //     "TSA_NAME": "Abdesattar Ben Moussa",
      //     "TSA_COUNTRY": "TUNISIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "TUN",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Abdessattar Ben Moussa.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COTUN-0000001-A",
      //     "TSA_COUPON_CODE": "COTUN-0000001-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Ali Rasheed Lootah",
      //     "TSA_COUNTRY": "UAE",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "ARE",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Ali Rasheed Lootah.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COARE-0000002-A",
      //     "TSA_COUPON_CODE": "COARE-0000002-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Alpha Sesay",
      //     "TSA_COUNTRY": "SIERRA LEONE",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "SLE",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Alpha Sesay.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COSLE-0000003-A",
      //     "TSA_COUPON_CODE": "COSLE-0000003-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Antonia Zu Schaumburg-Lippe",
      //     "TSA_COUNTRY": "DENMARK",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "DNK",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Antonia Zu Schaumburg-Lippe.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=CODNK-0000004-A",
      //     "TSA_COUPON_CODE": "CODNK-0000004-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Arjuna Ranatunga",
      //     "TSA_COUNTRY": "SRI LANKA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "LKA",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Arjuna Ranatunga.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COLKA-0000005-A",
      //     "TSA_COUPON_CODE": "COLKA-0000005-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Asle Toje",
      //     "TSA_COUNTRY": "NORWAY",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "NOR",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Asle Toje.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=CONOR-0000006-A",
      //     "TSA_COUPON_CODE": "CONOR-0000006-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Baba Ramdev",
      //     "TSA_COUNTRY": "INDIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "IND",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Ram Dev Baba.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COIND-0000007-A",
      //     "TSA_COUPON_CODE": "COIND-0000007-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Banagala Upatissa Thero",
      //     "TSA_COUNTRY": "SRI LANKA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "LKA",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Banagala Upatissa Thero.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COLKA-0000008-A",
      //     "TSA_COUPON_CODE": "COLKA-0000008-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Binod Kumar Chaudhary",
      //     "TSA_COUNTRY": "NEPAL",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "NPL",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Binod Kumar Chaudhary.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=CONPL-0000009-A",
      //     "TSA_COUPON_CODE": "CONPL-0000009-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Chandra Kumar Bose",
      //     "TSA_COUNTRY": "INDIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "IND",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Chandra Kumar Bose.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COIND-0000010-A",
      //     "TSA_COUPON_CODE": "COIND-0000010-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Dalip Singh Rana",
      //     "TSA_COUNTRY": "INDIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "IND",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Dalip Singh Rana.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COIND-0000011-A",
      //     "TSA_COUPON_CODE": "COIND-0000011-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Deepa Malik",
      //     "TSA_COUNTRY": "INDIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "IND",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Deepa Malik.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COIND-0000012-A",
      //     "TSA_COUPON_CODE": "COIND-0000012-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Dia Mirza",
      //     "TSA_COUNTRY": "INDIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "IND",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Dia Mirza.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COIND-0000013-A",
      //     "TSA_COUPON_CODE": "COIND-0000013-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Ekaterina Zagladina",
      //     "TSA_COUNTRY": "RUSSIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "RUS",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Ekaterina Zagladina.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=CORUS-0000014-A",
      //     "TSA_COUPON_CODE": "CORUS-0000014-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Esha Deol",
      //     "TSA_COUNTRY": "INDIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "IND",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Esha Doel.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COIND-0000015-A",
      //     "TSA_COUPON_CODE": "COIND-0000015-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Feizi Masrour Milani",
      //     "TSA_COUNTRY": "BRAZIL",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "BRA",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Feizi Masrour Milani.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COBRA-0000016-A",
      //     "TSA_COUPON_CODE": "COBRA-0000016-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Habil Khorakiwala",
      //     "TSA_COUNTRY": "INDIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "IND",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Habil Khorakiwala.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COIND-0000017-A",
      //     "TSA_COUPON_CODE": "COIND-0000017-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Hassan Babacar Jallow",
      //     "TSA_COUNTRY": "GAMBIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "GMB",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Hassan Babacar Jallow.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COGMB-0000018-A",
      //     "TSA_COUPON_CODE": "COGMB-0000018-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Hezena Lemaletian",
      //     "TSA_COUNTRY": "KENYA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "KEN",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Hezena Lemaletian.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COKEN-0000019-A",
      //     "TSA_COUPON_CODE": "COKEN-0000019-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Hlubi Mboya-Arnold",
      //     "TSA_COUNTRY": "SOUTH AFRICA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "ZAF",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Hlubi Mboya-Arnold.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COZAF-0000020-A",
      //     "TSA_COUPON_CODE": "COZAF-0000020-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Hoda Galal Yassa",
      //     "TSA_COUNTRY": "EGYPT",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "EGY",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Hoda Galal Yassa.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COEGY-0000021-A",
      //     "TSA_COUPON_CODE": "COEGY-0000021-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Houcine Abbasi",
      //     "TSA_COUNTRY": "TUNISIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "TUN",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Houcine Abbasi.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COTUN-0000022-A",
      //     "TSA_COUPON_CODE": "COTUN-0000022-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Jacqueline Fernandez",
      //     "TSA_COUNTRY": "INDIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "IND",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Jacqueline Fernandez.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COIND-0000023-A",
      //     "TSA_COUPON_CODE": "COIND-0000023-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Juan Carlos Sainz-Borgo",
      //     "TSA_COUNTRY": "COSTA RICA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "CRI",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Juan Carlos Sainz-Borgo.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COCRI-0000024-A",
      //     "TSA_COUPON_CODE": "COCRI-0000024-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Kailash Satyarthi",
      //     "TSA_COUNTRY": "INDIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "IND",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Kailash Satyarthi.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COIND-0000025-A",
      //     "TSA_COUPON_CODE": "COIND-0000025-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Kili Paul",
      //     "TSA_COUNTRY": "Tanzania",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "TZA",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Kili Paul.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COTZA-0000026-A",
      //     "TSA_COUPON_CODE": "COTZA-0000026-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Kriti Kharbanda",
      //     "TSA_COUNTRY": "INDIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "IND",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Kriti Kharbanda.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COIND-0000027-A",
      //     "TSA_COUPON_CODE": "COIND-0000027-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Latifa Ibn Ziaten",
      //     "TSA_COUNTRY": "MOROCCO",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "MAR",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Latifa Ibn Ziaten.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COMAR-0000028-A",
      //     "TSA_COUPON_CODE": "COMAR-0000028-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Lech Walesa",
      //     "TSA_COUNTRY": "POLAND",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "POL",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Lech Walesa.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COPOL-0000029-A",
      //     "TSA_COUPON_CODE": "COPOL-0000029-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Leymah Gbowee",
      //     "TSA_COUNTRY": "LIBERIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "LBR",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Leymah Gbowee.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COLBR-0000030-A",
      //     "TSA_COUPON_CODE": "COLBR-0000030-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // // {
      // //     "TSA_NAME": "Lokesh Ji Muni Acharya",
      // //     "TSA_COUNTRY": "INDIA",
      // //     "TSA_COUNTRY_ID": "",
      // //     "TSA_MOBILE_NO": "",
      // //     "TSA_COUNTRY_CODE": "IND",
      // //     "TSA_EMAIL_ID": "",
      // //     "TSA_FILE_TYPE": "PNG",
      // //     "TSA_FILE_NAME": "Lokesh Ji Muni Acharya, Dr, His Holiness.png",
      // //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COIND-0000031-A",
      // //     "TSA_COUPON_CODE": "COIND-0000031-A",
      // //     "TSA_CREATED_BY": "1",
      // //     "TSA_MODIFIED_BY": "1"
      // // },
      // {
      //     "TSA_NAME": "Mahawa Simou Diouf",
      //     "TSA_COUNTRY": "BURKINA FASO",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "BFA",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Mahawa Simou Diouf.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COBFA-0000032-A",
      //     "TSA_COUPON_CODE": "COBFA-0000032-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Mahesh Bhupathi",
      //     "TSA_COUNTRY": "INDIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "IND",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Mahesh Bhupathi.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COIND-0000033-A",
      //     "TSA_COUPON_CODE": "COIND-0000033-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Maqsoud Cruz",
      //     "TSA_COUNTRY": "UAE",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "ARE",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Maqsoud Cruz.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COARE-0000034-A",
      //     "TSA_COUPON_CODE": "COARE-0000034-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Mario-Max Schaumburg-Lippe",
      //     "TSA_COUNTRY": "DENMARK",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "DNK",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Mario-Max Schaumburg-Lippe.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=CODNK-0000035-A",
      //     "TSA_COUPON_CODE": "CODNK-0000035-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Mary Kom",
      //     "TSA_COUNTRY": "INDIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "IND",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Mary Kom.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COIND-0000036-A",
      //     "TSA_COUPON_CODE": "COIND-0000036-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Mohamed Abd-Salam",
      //     "TSA_COUNTRY": "EGYPT",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "EGY",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Mohamed Abd-Salam.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COEGY-0000037-A",
      //     "TSA_COUPON_CODE": "COEGY-0000037-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Mohamed Fadhel Mahfoudh",
      //     "TSA_COUNTRY": "TUNISIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "TUN",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Mohamed Fadhel Mahfoudh.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COTUN-0000038-A",
      //     "TSA_COUPON_CODE": "COTUN-0000038-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Mohammed Asif Ali",
      //     "TSA_COUNTRY": "INDIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "IND",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Mohammed Asif Ali, Nawabzada.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COIND-0000039-A",
      //     "TSA_COUPON_CODE": "COIND-0000039-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Mohammad Tawhidi",
      //     "TSA_COUNTRY": "AUSTRALIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "AUS",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Mohammad Tawhidi.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COAUS-0000040-A",
      //     "TSA_COUPON_CODE": "COAUS-0000040-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Mohan Munasinghe",
      //     "TSA_COUNTRY": "SRI LANKA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "LKA",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Mohan Munasinghe.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COLKA-0000041-A",
      //     "TSA_COUPON_CODE": "COLKA-0000041-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Mustapha Njie",
      //     "TSA_COUNTRY": "GAMBIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "GMB",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Mustapha Njie.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COGMB-0000042-A",
      //     "TSA_COUPON_CODE": "COGMB-0000042-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Nadia Murad",
      //     "TSA_COUNTRY": "IRAQ",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "IRQ",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Nadia Murad.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COIRQ-0000043-A",
      //     "TSA_COUPON_CODE": "COIRQ-0000043-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Nadir Godrej",
      //     "TSA_COUNTRY": "INDIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "IND",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Nadir Godrej.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COIND-0000044-A",
      //     "TSA_COUPON_CODE": "COIND-0000044-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Naresh Kumar Bhawnani",
      //     "TSA_COUNTRY": "UAE",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "ARE",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Naresh Kumar Bhawnani.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COARE-0000045-A",
      //     "TSA_COUPON_CODE": "COARE-0000045-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Nii Tackie Tackie Tsuru",
      //     "TSA_COUNTRY": "GHANA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "GHA",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Nii Tackie Tackie Tsuru.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COGHA-0000046-A",
      //     "TSA_COUPON_CODE": "COGHA-0000046-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Oheneba Nana Kwame Obeng",
      //     "TSA_COUNTRY": "GHANA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "GHA",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Oheneba Nana Kwame Obeng.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COGHA-0000047-A",
      //     "TSA_COUPON_CODE": "COGHA-0000047-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Ouided Bouchamaoui",
      //     "TSA_COUNTRY": "TUNISIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "TUN",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Ouided Bouchamaoui.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COTUN-0000048-A",
      //     "TSA_COUPON_CODE": "COTUN-0000048-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Oscar Arias Sanchez",
      //     "TSA_COUNTRY": "Costa Rica",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "CRI",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Oscar Arias Sanchez.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COCRI-0000049-A",
      //     "TSA_COUPON_CODE": "COCRI-0000049-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Paco Soleil",
      //     "TSA_COUNTRY": "SPAIN",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "ESP",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Paco Soleil.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COESP-0000050-A",
      //     "TSA_COUPON_CODE": "COESP-0000050-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Rina Telesphore",
      //     "TSA_COUNTRY": "MADAGASCAR",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "MDG",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Rina Telesphore.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COMDG-0000051-A",
      //     "TSA_COUPON_CODE": "COMDG-0000051-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Roby Kannamchirayil",
      //     "TSA_COUNTRY": "INDIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "IND",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Roby Kannamchirayil.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COIND-0000052-A",
      //     "TSA_COUPON_CODE": "COIND-0000052-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Romona Murad",
      //     "TSA_COUNTRY": "MALAYSIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "MYS",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Romona Murad.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COMYS-0000053-A",
      //     "TSA_COUPON_CODE": "COMYS-0000053-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Rui Duarte de Barros",
      //     "TSA_COUNTRY": "GUINEA BISSAU",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "GNB",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Rui Duarte de Barros.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COGNB-0000054-A",
      //     "TSA_COUPON_CODE": "COGNB-0000054-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Sanjay Khan",
      //     "TSA_COUNTRY": "INDIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "IND",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Sanjay Khan.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COIND-0000055-A",
      //     "TSA_COUPON_CODE": "COIND-0000055-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Sanjeev Kapoor",
      //     "TSA_COUNTRY": "INDIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "IND",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Sanjeev Kapoor.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COIND-0000056-A",
      //     "TSA_COUPON_CODE": "COIND-0000056-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Sara Al Madani",
      //     "TSA_COUNTRY": "UAE",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "ARE",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Sara Al Madani.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COARE-0000057-A",
      //     "TSA_COUPON_CODE": "COARE-0000057-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Satpal Singh Khalsa",
      //     "TSA_COUNTRY": "USA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "USA",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Satpal Singh Khalsa.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COUSA-0000058-A",
      //     "TSA_COUPON_CODE": "COUSA-0000058-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Shirin Ebadi",
      //     "TSA_COUNTRY": "IRAN",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "IRN",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Shirin Ebadi.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COIRN-0000059-A",
      //     "TSA_COUPON_CODE": "COIRN-0000059-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Sie-A-Nyene Gyapay Yuoh",
      //     "TSA_COUNTRY": "LIBERIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "LBR",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Sie-A-Nyene Gyapay Yuoh.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COLBR-0000060-A",
      //     "TSA_COUPON_CODE": "COLBR-0000060-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Soha Ali Khan",
      //     "TSA_COUNTRY": "INDIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "IND",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Soha Ali Khan.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COIND-0000061-A",
      //     "TSA_COUPON_CODE": "COIND-0000061-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Surender Singh Kandhari",
      //     "TSA_COUNTRY": "UAE",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "ARE",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Surender Singh Kandhari.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COARE-0000062-A",
      //     "TSA_COUPON_CODE": "COARE-0000062-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Tehemton Burjor Mirza",
      //     "TSA_COUNTRY": "INDIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "IND",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Tehemton Burjor Mirza.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COIND-0000063-A",
      //     "TSA_COUPON_CODE": "COIND-0000063-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Thich Nhat Tu",
      //     "TSA_COUNTRY": "VIETNAM",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "VNM",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Thich Nhat Tu.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COVNM-0000064-A",
      //     "TSA_COUPON_CODE": "COVNM-0000064-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Urvashi Rautela",
      //     "TSA_COUNTRY": "INDIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "IND",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Urvashi Rautela.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COIND-0000065-A",
      //     "TSA_COUPON_CODE": "COIND-0000065-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Venkatramani",
      //     "TSA_COUNTRY": "INDIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "IND",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Venkatramani R.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COIND-0000066-A",
      //     "TSA_COUPON_CODE": "COIND-0000066-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Yankuba Dibba",
      //     "TSA_COUNTRY": "GAMBIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "GMB",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Yankuba Dibba.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COGMB-0000067-A",
      //     "TSA_COUPON_CODE": "COGMB-0000067-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Yasmin Karachiwala",
      //     "TSA_COUNTRY": "INDIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "IND",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Yasmin Karachiwala.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COIND-0000068-A",
      //     "TSA_COUPON_CODE": "COIND-0000068-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Zayed Khan",
      //     "TSA_COUNTRY": "INDIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "IND",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Zayed Khan.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COIND-0000069-A",
      //     "TSA_COUPON_CODE": "COIND-0000069-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Jose Manuel Ramos Horta",
      //     "TSA_COUNTRY": "EAST TIMOR",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "TLS",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Jose Manuel Ramos Horta.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COTLS-0000070-A",
      //     "TSA_COUPON_CODE": "COTLS-0000070-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Joseph Boakai",
      //     "TSA_COUNTRY": "LIBERIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "LBR",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Joseph Boakai.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COLBR-0000071-A",
      //     "TSA_COUPON_CODE": "COLBR-0000071-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
      // {
      //     "TSA_NAME": "Sri Sri Ravishankar",
      //     "TSA_COUNTRY": "INDIA",
      //     "TSA_COUNTRY_ID": "",
      //     "TSA_MOBILE_NO": "",
      //     "TSA_COUNTRY_CODE": "IND",
      //     "TSA_EMAIL_ID": "",
      //     "TSA_FILE_TYPE": "PNG",
      //     "TSA_FILE_NAME": "Sri Sri Ravishankar.png",
      //     "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COIND-0000072-A",
      //     "TSA_COUPON_CODE": "COIND-0000072-A",
      //     "TSA_CREATED_BY": "1",
      //     "TSA_MODIFIED_BY": "1"
      // },
           {
          "TSA_NAME": "Lokesh Ji Muni Acharya",
          "TSA_COUNTRY": "INDIA",
          "TSA_COUNTRY_ID": "",
          "TSA_MOBILE_NO": "",
          "TSA_COUNTRY_CODE": "IND",
          "TSA_EMAIL_ID": "",
          "TSA_FILE_TYPE": "PNG",
          "TSA_FILE_NAME": "Lokesh Ji Muni Acharya, Dr, His Holiness.png",
          "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COIND-0000031-A",
          "TSA_COUPON_CODE": "COIND-0000031-A",
          "TSA_CREATED_BY": "1",
          "TSA_MODIFIED_BY": "1"
      },
        {
          "TSA_NAME": "Nadia Murad",
          "TSA_COUNTRY": "IRAQ",
          "TSA_COUNTRY_ID": "",
          "TSA_MOBILE_NO": "",
          "TSA_COUNTRY_CODE": "IRQ",
          "TSA_EMAIL_ID": "",
          "TSA_FILE_TYPE": "PNG",
          "TSA_FILE_NAME": "Nadia Murad.png",
          "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COIRQ-0000043-A",
          "TSA_COUPON_CODE": "COIRQ-0000043-A",
          "TSA_CREATED_BY": "1",
          "TSA_MODIFIED_BY": "1"
      },
    {
          "TSA_NAME": "Rui Duarte de Barros",
          "TSA_COUNTRY": "GUINEA BISSAU",
          "TSA_COUNTRY_ID": "",
          "TSA_MOBILE_NO": "",
          "TSA_COUNTRY_CODE": "GNB",
          "TSA_EMAIL_ID": "",
          "TSA_FILE_TYPE": "PNG",
          "TSA_FILE_NAME": "Rui Duarte de Barros.png",
          "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COGNB-0000054-A",
          "TSA_COUPON_CODE": "COGNB-0000054-A",
          "TSA_CREATED_BY": "1",
          "TSA_MODIFIED_BY": "1"
      },
    {
      "TSA_NAME": "Sultan Ali Rashed Lootah",
      "TSA_COUNTRY": "UAE",
      "TSA_COUNTRY_ID": "",
      "TSA_MOBILE_NO": "",
      "TSA_COUNTRY_CODE": "GNB",
      "TSA_EMAIL_ID": "",
      "TSA_FILE_TYPE": "PNG",
      "TSA_FILE_NAME": "Sultan Ali Rashed Lootah.png",
      "TSA_URL": "https://www.justice-love-peace.com/delegate-registration?code=COUAE-0000074-A",
      "TSA_COUPON_CODE": "COGNB-0000054-A",
      "TSA_CREATED_BY": "1",
      "TSA_MODIFIED_BY": "1"
  },
]

    async function generateQRCodeWithImage(imagePath, qr_url) {
      try {
        const logoPath = path.join(__dirname, "../uploads/delegate_qr", "Logo.png");
    
        const qrCodeBuffer = await qrcode.toBuffer(qr_url, {
          errorCorrectionLevel: "H",
          scale: 10,
          margin: 1
        });
    
        const qrDimensions = await sharp(qrCodeBuffer).metadata();
        const logoSize = Math.floor(qrDimensions.width / 4);
    
        const logoBuffer = await applyCircleMaskToLogo(logoPath, logoSize);
    
        await sharp(qrCodeBuffer)
          .resize(qrDimensions.width, qrDimensions.height)
          .composite([{ input: logoBuffer, gravity: "center", blend: "over" }])
          .toFile(imagePath);
    
        console.log("QR Code with logo saved at:", imagePath);
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    }
    
    async function applyCircleMaskToLogo(logoPath, logoSize) {
      const logoImage = await sharp(logoPath).resize(logoSize, logoSize).toBuffer();
      const circleMask = Buffer.from(
        `<svg width="${logoSize}" height="${logoSize}">
            <circle cx="${logoSize / 2}" cy="${logoSize / 2}" r="${logoSize / 2}" fill="white" />
        </svg>`
      );
    
      return sharp(logoImage)
        .composite([{ input: circleMask, blend: "dest-in" }])
        .sharpen(2)
        .toBuffer();
    }
    
    async function processBadges() {
      for (const data of jsonData) {
        const personData = {
          username: data.TSA_NAME || "N/A",
          country: data.TSA_COUNTRY || "N/A",
          email: data.TSA_EMAIL_ID || "N/A",
          idNo: data.TSA_COUNTRY_ID || "N/A",
          file_name: data.TSA_FILE_NAME,
          url:data.TSA_URL
        };
    
        console.log("Processing:", personData);
    
        const photo = personData.file_name
          ? `../uploads/Amb_photo/${personData.file_name}`
          : "../uploads/profile_pics/null.png";
        const baseImagePath = path.join(__dirname, "../uploads/Amb_photo/Ambassador.png");
        
        const userPhotoPath = path.join(__dirname, photo);
        const imagePath = path.join(__dirname, "../uploads/Amb_qr",`${personData.file_name}`);
    
       await generateQRCodeWithImage(imagePath, `${personData.url}`)
        .then(() => {
            console.log("QR Code generated successfully!");
        })
        .catch(console.error);
    
        console.log(userPhotoPath, "userPhotoPath");
        const qrCodePath = path.join(__dirname, `../uploads/Amb_qr/${personData.file_name}`);
        const destFolder = path.join(__dirname, "../uploads/Amb_batch");
    
        if (!fs.existsSync(destFolder)) {
          fs.mkdirSync(destFolder, { recursive: true });
        }
    
        const baseImage = await loadImage(baseImagePath);
        const userPhoto = await loadImage(userPhotoPath);
        const qrCode = await loadImage(qrCodePath);
    
        const canvas = createCanvas(baseImage.width, baseImage.height);
        const ctx = canvas.getContext("2d");
    
        ctx.drawImage(baseImage, 0, 0);
    
        const photoX = 1450, photoY = 90, photoSize = 800, borderWidth = 4;
        ctx.save();
        ctx.beginPath();
        ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, 2 * Math.PI);
        ctx.clip();
        ctx.drawImage(userPhoto, photoX, photoY, photoSize, photoSize);
        ctx.restore();
    
        ctx.beginPath();
        ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2 + borderWidth / 2, 0, 2 * Math.PI);
        ctx.strokeStyle = "green";
        ctx.lineWidth = borderWidth;
        ctx.stroke();
    
        ctx.font = "bold 70px Arial";
        ctx.fillStyle = "black";
        ctx.fillText(personData.username, 200, 340);
    
        ctx.font = "bold 55px Arial";
        ctx.fillStyle = "#17598e";
        ctx.fillText("Country:", 200, 410);
        ctx.fillStyle = "black";
        ctx.fillText(personData.country, 440, 410);
    
        const qrCodeX = 1250, qrCodeY = 1850, qrCodeWidth = 400, qrCodeHeight = 400;
        ctx.drawImage(qrCode, qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);
    
        const outputFilePath = path.join(destFolder, `${personData.file_name}.png`);
        const out = fs.createWriteStream(outputFilePath);
        const stream = canvas.createPNGStream();
        stream.pipe(out);
    
        out.on("finish", async () => {
          console.log(`Badge saved as PNG at: ${outputFilePath}`);
          const destFolderPdf = path.join(__dirname, "../uploads/Amb_badge_pdf");
    
          if (!fs.existsSync(destFolderPdf)) {
            fs.mkdirSync(destFolderPdf, { recursive: true });
          }
    
          const pdfFilePath = path.join(destFolderPdf, `${personData.file_name}.pdf`);
          const doc = new PDFDocument();
    
          doc.pipe(fs.createWriteStream(pdfFilePath));
          const margin = 0;
          doc.image(outputFilePath, {
            fit: [650 - margin * 2, 650 - margin * 2],
            align: "center",
            valign: "center",
            x: margin,
            y: margin
          });
    
          doc.fillColor("blue").font("Helvetica-Bold").fontSize(10).text(
            `${personData.url}`,
            120, 638, { link: `${personData.url}`, underline: true }
          );
    
          doc.end();
          console.log(`Badge saved as PDF at: ${pdfFilePath}`);
        });
      }
    }
    
    processBadges();



    // const protocol = "https";
    // const personData = {
    //   username: "Dalip Singh Rana, the Great Khali" || "N/A",
    //   country: "INDIA" || "N/A",
    //   email: "" || "N/A",
    //   idNo: "IN-00000012-A" || "N/A",
    //   file_name: "great khali.png" || null,
    // };
    // console.log(personData.file_name, "file_name");
    // const photo = personData.file_name ? `../uploads/Amb_photo/${personData.file_name}` : '../uploads/profile_pics/null.png';
    // const baseImagePath = path.join(__dirname, "../uploads/Amb_photo/Ambassador.png");
    // const userPhotoPath = path.join(__dirname, photo);
    // const imagePath = path.join(__dirname, '../uploads/Amb_photo', "Ambassador_qr.png");
    // console.log(baseImagePath, "baseImagePath");
 

    // async function generateQRCodeWithImage(imagePath, qr_url) {
    //   try {
    //     // Define paths
    //     const logoPath = path.join(__dirname, "../uploads/delegate_qr", "Logo.png"); // Logo path

    //     const qrCodeBuffer = await qrcode.toBuffer(qr_url, {
    //       errorCorrectionLevel: 'H', // High error correction for logo overlay
    //       scale: 10,// Scale for higher resolution QR code
    //       margin: 1
    //     });

    //     // Get QR code dimensions
    //     const qrDimensions = await sharp(qrCodeBuffer).metadata();
    //     const logoSize = Math.floor(qrDimensions.width / 4); // Resize logo to 1/4 of the QR code size

    //     // Apply circular mask to the logo and enhance quality
    //     const logoBuffer = await applyCircleMaskToLogo(logoPath, logoSize);

    //     // Process the QR code with the logo overlay
    //     await sharp(qrCodeBuffer)
    //       .resize(qrDimensions.width, qrDimensions.height) // Ensure QR code is correct size
    //       .composite([{
    //         input: logoBuffer,
    //         gravity: 'center', // Center the logo in the middle
    //         blend: 'over', // Overlay the logo onto the QR code
    //       }])
    //       .toFile(imagePath); // Save the final image

    //     console.log("QR Code with sharp logo saved at:", imagePath);
    //   } catch (error) {
    //     console.error("Error generating QR code:", error);
    //   }
    // }

    // // Function to apply circular mask to the logo and sharpen it
    // async function applyCircleMaskToLogo(logoPath, logoSize) {
    //   const logoImage = await sharp(logoPath)
    //     .resize(logoSize, logoSize) // Resize logo to desired size
    //     .toBuffer();

    //   // Create a circular mask for the logo
    //   const circleMask = Buffer.from(
    //     `<svg width="${logoSize}" height="${logoSize}">
    //           <circle cx="${logoSize / 2}" cy="${logoSize / 2}" r="${logoSize / 2}" fill="white" />
    //       </svg>`
    //   );

    //   // Apply circular mask on logo and sharpen the image
    //   return sharp(logoImage)
    //     .composite([{ input: circleMask, blend: 'dest-in' }]) // Apply mask to the logo
    //     .sharpen(2) // Apply sharpening for better clarity
    //     .toBuffer();
    // }

    // // Example Usage
    // await generateQRCodeWithImage(imagePath, `https://www.justice-love-peace.com/delegate-registration?code=CO${personData.idNo}`);

    // console.log(userPhotoPath, "userPhotoPath");
    // const qrCodePath = path.join(__dirname, `../uploads/Amb_photo/Ambassador_qr.png`);
    // // console.log(response[0].coupon_code, "zxzxcxxcxc");
    // const destFolder = path.join(__dirname, "../uploads/Amb_batch");
    // console.log("asasasa");
    // // Ensure the destination folder exists
    // if (!fs.existsSync(destFolder)) {
    //   fs.mkdirSync(destFolder, { recursive: true });
    // }

    // // Load images
    // const baseImage = await loadImage(baseImagePath);
    // const userPhoto = await loadImage(userPhotoPath);
    // const qrCode = await loadImage(qrCodePath);




    // const canvas = createCanvas(baseImage.width, baseImage.height);
    // const ctx = canvas.getContext("2d");

    // // Draw base image
    // ctx.drawImage(baseImage, 0, 0);

    // // Draw circular user photo with border
    // const photoX = 1450, photoY = 90, photoSize = 800, borderWidth = 4;
    // ctx.save();
    // ctx.beginPath();
    // ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, 2 * Math.PI);
    // ctx.clip();
    // ctx.drawImage(userPhoto, photoX, photoY, photoSize, photoSize);
    // ctx.restore();

    // ctx.beginPath();
    // ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2 + borderWidth / 2, 0, 2 * Math.PI);
    // ctx.strokeStyle = "green";
    // ctx.lineWidth = borderWidth;
    // ctx.stroke();

    // // Add user details
    // ctx.font = "bold 70px Arial";
    // ctx.fillStyle = "black";
    // ctx.fillText(personData.username, 200, 340);

    // ctx.font = "bold 55px Arial";
    // ctx.fillStyle = "#17598e";
    // ctx.fillText("Country:", 200, 410);
    // ctx.fillStyle = "black";
    // ctx.fillText(personData.country, 440, 410);


    // // ctx.fillStyle = "#17598e";
    // // ctx.fillText("ID No:", 200, 480);
    // // ctx.fillStyle = "black";
    // // ctx.fillText(personData.idNo, 440, 480);

    // // Add QR code
    // const qrCodeX = 1250, qrCodeY = 1850, qrCodeWidth = 400, qrCodeHeight = 400;
    // ctx.drawImage(qrCode, qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);

    // // Save the output
    // const outputFilePath = path.join(destFolder, `${personData.file_name}.png`);
    // const out = fs.createWriteStream(outputFilePath);
    // const stream = canvas.createPNGStream();
    // stream.pipe(out);
    // out.on("finish", async () => {
    //   console.log(`Badge saved as PNG at: ${outputFilePath}`);
    //   const destFolderPdf = path.join(__dirname, "../uploads/Amb_badge_pdf");
    //   // Create a PDF document and save it
    //   const pdfFilePath = path.join(destFolderPdf,`${personData.file_name}.png`);
    //   const doc = new PDFDocument();

    //   doc.pipe(fs.createWriteStream(pdfFilePath));
    //   const margin = 0;
    //   doc.image(outputFilePath, {
    //     fit: [650 - margin * 2, 650 - margin * 2], // Adjust fit dimensions based on margins
    //     align: "center",
    //     valign: "center",
    //     x: margin, // X-coordinate to include the left margin
    //     y: margin, // Y-coordinate to include the top margin
    //   });
    //   doc.fillColor('black').font('Helvetica-Bold').fontSize(8).text("To Register as a Delegate ,Click the below link", 240, 625, {
    //     link: `https://www.justice-love-peace.com/delegate-registration?code=CO${personData.idNo}`, // This makes the link clickable
    //     underline: true // Optional: underline the link for emphasis
    //   });

    //   doc.fillColor('blue').font('Helvetica-Bold').fontSize(10).text(`https://www.justice-love-peace.com/delegate-registration?code=CO${personData.idNo}`, 120, 638, {
    //     link: `https://www.justice-love-peace.com/delegate-registration?code=CO${personData.idNo}`, // This makes the link clickable
    //     underline: true, // Optional: underline the link for emphasis
    //   });

    //   doc.end();

    //   console.log(`Badge saved as PDF at: ${pdfFilePath}`);
    // });

    console.log("batch photo successfully saved");
    const destFolder1 = path.join(__dirname, "../uploads/badge_pdf");
    const destFolder2 = path.join(__dirname, "../uploads/batch_photo");







    return res.status(201).json({
      success: true,
      error: false,
      message: "Peacekeeper profile created successfully.",
      message1: response[0].response,
      peacekeeper_id: response[0].peacekeeper_id,  // Return the peacekeeper ID
      QR_code: `${protocol}://${req.get("host")}/uploads/delegates/${response[0].coupon_code}.png`,
      batch: `${protocol}://${req.get("host")}/uploads/batch/photo/${response[0].coupon_code}.png`,
      Data: peacekeeperData,
    });




  }
  catch (error) {
    res.status(500).json({
      success: false,
      error: true,
      message: error.message
    })
  }

};

const getAllPeacekeeperDropdown = (req, res) => {
  // Call the model function to fetch peacekeeper data
  peacekeeperModel.getAllPeacekeepersdropdown((err, peacekeepers) => {
    if (err) {
      console.error("Error fetching peacekeeper data: ", err);
      return res.status(500).json({
        success: false,
        error: true,
        message: "Server error.",
        details: err
      });
    }

    // If data is successfully fetched, return it in the response
    return res.status(200).json({
      success: true,
      error: false,
      data: peacekeepers,
      message: "Peacekeeper data fetched successfully."
    });
  });
};

module.exports = {
  createPeacekeeper,
  deletePeacekeeperData,
  getPeacekeeperData,
  getAllPeacekeeperData,
  getAllContactUsData,
  update_Peacekeeper,
  getAllEmailData,
  discountPeacekeeperData,
  session_status,
  amb_badge,
  getAllPeacekeeperDropdown
};


