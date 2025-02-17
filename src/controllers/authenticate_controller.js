const authenicate_model = require('../models/authenticate_model');
const {VerifyToken,encrypt,decrypt} =require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { download_badge } = require('./delegate_registration');
const path = require('path');
const PDFDocument = require("pdfkit");
const qrcode = require('qrcode');
const { createCanvas, loadImage } = require("canvas");
const fs = require('fs');
const sharp = require('sharp');
const {shortenURL} =require("../middleware/tiny_url");
const authenticate_controller={

  login_peacekeeper: async (req, res) => {
    try {
        const { email, password, device_id, os_type, loginVia, otp } = req.body;
        console.log(email.length,"email.length");
        console.log(password.length,"password.length");
        if (loginVia == 1 && (!email || !password)) {
          return res.status(400).json({
            status: 400,
            success: false,
            error: true,
            message: "Email & password are required",
          });
        }
        
        if (loginVia == 0 && (!email || !otp)) {
          return res.status(400).json({
            status: 400,
            success: false,
            error: true,
            message: "Email & OTP are required",
          });
        }
        if (loginVia == 1 && (email || password)) {
        const loginResult = await authenicate_model.peacekeeper_login(req.body, req, res);
        // console.log(loginResult,"result_login");
         
        }
        const loginResult = await authenicate_model.peacekeeper_login(req.body, req, res);
        // console.log(loginResult,"loginResult");
        
        if (!loginResult || !loginResult[0] || !loginResult[0][0]) {
            return res.status(500).json({
                success: false,
                error: true,
                message: "Login failed. Please try again."
            });
        }

        if (loginResult[0][0].result === "No details found") {
            return res.status(400).json({
                success: false,
                error: true,
                message: "Invalid login credentials"
            });
        }

        const token = jwt.sign({ user_details: loginResult[0][0] }, process.env.SECRET_KEY, { expiresIn: "10h" });

        res.status(200).json({
            success: true,
            error: false,
            data: loginResult[0][0],
            token: token
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: true,
            message: error.message
        });
    }
},
  download_badge : async(req,res)=>{
    try{
        
        if(req.params.email.length ==0)
        {
        res.status(500).json({
          success:false,
          error:true,
          message:"email_id is required"
        })
        }
        else
        {
          const login_peacekeeper= await authenicate_model.download_badge(req,res);
          console.log("check",login_peacekeeper);
         
         if(login_peacekeeper[0][0].result ==="No details Found")
          {
            res.status(500).json({
              success:false,
              error:true,
              message:login_peacekeeper[0][0].result
            })
          }
          else
          { 
            if (!login_peacekeeper || login_peacekeeper.length === 0 || !login_peacekeeper[0][0]?.coupon_code) 
            {
              return res.status(404).json({
                  success: false,
                  error: true,
                  message: " Details not found"
              });
            }
          
          
          const destFolder = path.join(__dirname, "../uploads/batch_photo");
          const outputFilePath = path.join(destFolder, `${login_peacekeeper[0][0]?.coupon_code}.png`);
         if (!fs.existsSync(destFolder)) 
          {
            fs.mkdirSync(destFolder, { recursive: true });
          }
          const protocol="https"; 
          return res.status(200).json({
            success:true,
            error:false,
            badge_photo_url:`${protocol}://${req.get("host")}/uploads/batch/photo/${login_peacekeeper[0][0]?.coupon_code}.png`
            //badge_pdf_url:`${protocol}://${req.get("host")}/uploads/batch_pdf/${login_peacekeeper[0][0]?.coupon_code}.pdf`
          })
          
          // return res.download(outputFilePath, `${file_name}.png`, (err) => {
          //     if (err) {
          //         console.error("File Download Error:", err);
          //         return res.status(500).json({
          //             success: false,
          //             error: true,
          //             message: "Error downloading file"
          //         });
          //     }
          //     else
          //     {
          //       const protocol="https"; 
          //       res.status(200).json({
          //         success:true,
          //         error:false,
          //         url:`${protocol}://${req.get("host")}/uploads/batch/photo/${login_peacekeeper[0][0]?.coupon_code}.png`
          //       })
          //     }
          // });
          }
          
        }
    }
    catch(error)
    {
      res.status(500).json({
        success:false,
        error:true,
        message:error.message
      })
    }
  },
  edit_peacekeeper : async(req,res)=>{
    try{
      console.log(req.file,"file");
      console.log(req.body,"encrypted_data");
      // const encrypt_details= await encrypt(req.body);
      // console.log(encrypt_details,"encrypt_details");
      // const verify_token= await VerifyToken(req,res);
      // console.log("verify_token",verify_token);
      const decrypt_details= await decrypt(req.body.encrypted_data);
      console.log(decrypt_details,"decrypt_details");
      const parsedData = JSON.parse(decrypt_details);
      console.log(parsedData.email_id,"email"); 
      
      if(parsedData.id.length ==0)
      {
      res.status(500).json({
        success:false,
        error:true,
        message:"All field is required"
      })
      }
      else
      {
        console.log("check",parsedData);
        const login_peacekeeper= await authenicate_model.edit_peacekeeper_details(parsedData,req,res);
        console.log(login_peacekeeper[0][0],"check_controller");
        if(login_peacekeeper[0][0].result ==="No details found")
        {
          res.status(500).json({
            success:true,
            error:false,
            message:login_peacekeeper[0][0].result
          })
        }
        else
        {
          console.log(login_peacekeeper[0][0],"login_peacekeeper[0][0]"); 
          const protocol = "https";
          const personData = {
            username: login_peacekeeper[0][0].full_name || "N/A",
            country: login_peacekeeper[0][0].country_code || "N/A",
            email: login_peacekeeper[0][0].email_id || "N/A",
            idNo: login_peacekeeper[0][0].p_id_no || "N/A",
            file_name: login_peacekeeper[0][0].file_name || null,
            picUrl: `${protocol}://${req.get("host")}/uploads/profile_pics/${login_peacekeeper[0][0].file_name}`,
            qrCodeUrl: `${protocol}://${req.get("host")}/uploads/delegates/${login_peacekeeper[0][0].p_coupon_code}.png`,
          };
          console.log(personData.file_name, "file_name");
          const photo = login_peacekeeper[0][0].file_name ? `../uploads/profile_pics/${login_peacekeeper[0][0].file_name}` : '../uploads/profile_pics/null.png';
          const baseImagePath = path.join(__dirname, "../uploads/delegate_qr/Final Badge.png");
          const userPhotoPath = path.join(__dirname, photo);
          const imagePath = path.join(__dirname, `../uploads/delegate_qr/${login_peacekeeper[0][0].p_coupon_code}.png`);
      
          async function generateQRCodeWithImage(imagePath, qr_url) {
            try {
              // Define paths
              const logoPath = path.join(__dirname, "../uploads/delegate_qr", "Logo.png"); // Logo path
              if (!fs.existsSync(logoPath)) {
                throw new Error("Logo file is missing at " + logoPath);
              }
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
          await generateQRCodeWithImage(imagePath,`${login_peacekeeper[0][0].qr_code}`);
         
          const qrCodePath = path.join(__dirname, `../uploads/delegate_qr/${login_peacekeeper[0][0].p_coupon_code}.png`);
          console.log(login_peacekeeper[0][0].p_coupon_code, "zxzxcxxcxc");
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
          if(login_peacekeeper[0][0].check_email == 1)
            {
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
              ctx.fillText(login_peacekeeper[0][0].mobile_number || "N/A", 400, 420);
      
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
              const outputFilePath = path.join(destFolder, `${login_peacekeeper[0][0].p_coupon_code}.png`);
              const out = fs.createWriteStream(outputFilePath);
              const stream = canvas.createPNGStream();
              stream.pipe(out);
              out.on("finish", async () => {
                console.log(`Badge saved as PNG at: ${outputFilePath}`);
                const destFolderPdf = path.join(__dirname, "../uploads/badge_pdf");
                // Create a PDF document and save it
                const pdfFilePath = path.join(destFolderPdf, `${login_peacekeeper[0][0].p_coupon_code}.pdf`);
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
                  link: login_peacekeeper[0][0].qr_code, // This makes the link clickable
                  underline: true // Optional: underline the link for emphasis
                });
      
                doc.fillColor('blue').font('Helvetica-Bold').fontSize(10).text(login_peacekeeper[0][0].qr_code, 120, 638, {
                  link: login_peacekeeper[0][0].qr_code, // This makes the link clickable
                  underline: true, // Optional: underline the link for emphasis
                });
      
                doc.end();
      
                console.log(`Badge saved as PDF at: ${pdfFilePath}`);
              });
      
            }
            else
            {
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
              const outputFilePath = path.join(destFolder, `${login_peacekeeper[0][0].p_coupon_code}.png`);
              const out = fs.createWriteStream(outputFilePath);
              const stream = canvas.createPNGStream();
              stream.pipe(out);
              out.on("finish", async () => {
                console.log(`Badge saved as PNG at: ${outputFilePath}`);
                const destFolderPdf = path.join(__dirname, "../uploads/badge_pdf");
                // Create a PDF document and save it
                const pdfFilePath = path.join(destFolderPdf, `${login_peacekeeper[0][0].p_coupon_code}.pdf`);
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
                  link: login_peacekeeper[0][0].qr_code, // This makes the link clickable
                  underline: true // Optional: underline the link for emphasis
                });
      
                doc.fillColor('blue').font('Helvetica-Bold').fontSize(10).text(login_peacekeeper[0][0].qr_code, 120, 638, {
                  link: login_peacekeeper[0][0].qr_code, // This makes the link clickable
                  underline: true, // Optional: underline the link for emphasis
                });
      
                doc.end();
      
                console.log(`Badge saved as PDF at: ${pdfFilePath}`);
              });
      
            }
          console.log("batch photo successfully saved");
          const destFolder1 = path.join(__dirname, "../uploads/badge_pdf");
          const destFolder2 = path.join(__dirname, "../uploads/batch_photo");
  
          const couponCode = login_peacekeeper[0][0]?.p_coupon_code;
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
  
  
          return res.status(201).json({
            success: true,
            error: false,
            message: "Peacekeeper edit created successfully.",
            QR_code: `${protocol}://${req.get("host")}/uploads/delegates/${login_peacekeeper[0][0].p_coupon_code}.png`,
            batch: `${protocol}://${req.get("host")}/uploads/batch/photo/${login_peacekeeper[0][0].p_coupon_code}.png`,
            Data: login_peacekeeper[0][0],
          });
  
        }
        
      }
  }
  catch(error)
  {
    res.status(500).json({
      success:false,
      error:true,
      message:error.message
    })
  }
  },
   amb_badge : async (req, res) => {
 
    try {
   
      const protocol = "https";
      const personData = {
        username: "Abdesattar Ben Moussa" || "N/A",
        country: "TUNISIA" || "N/A",
        email: "" || "N/A",
        idNo: "TU-0000001-A" || "N/A",
        file_name: "Abdesattar Ben Moussa.png" || null,
        // picUrl: `${protocol}://${req.get("host")}/uploads/profile_pics/${login_peacekeeper[0][0].file_name}`,
        // qrCodeUrl: `${protocol}://${req.get("host")}/uploads/delegates/${login_peacekeeper[0][0].coupon_code}.png`,
      };
      console.log(personData.file_name, "file_name");
      const photo = personData.file_name ? `../uploads/Amb_photo/${personData.file_name}` : '../uploads/profile_pics/null.png';
      const baseImagePath = path.join(__dirname, "../uploads/Amb_photo/Ambassador.png");
      const userPhotoPath = path.join(__dirname, photo);
      const imagePath = path.join(__dirname, '../uploads/Amb_photo', "Ambassador_qr.png");
      console.log(baseImagePath, "baseImagePath");
      // const userPhotoPath = `${protocol}://${req.get("host")}/uploads/profile_pics/ac.png`;
   
      // const qrCodeBuffer = await qrcode.toBuffer("https://www.justice-love-peace.com/delegate-registration?code=COTU-0000001-A");
      // console.log(qrCodeBuffer, "qrCodeBuffer")
      // fs.writeFileSync(imagePath, qrCodeBuffer);
   
      async function generateQRCodeWithImage(imagePath, qr_url) {
        try {
          // Define paths
          const logoPath = path.join(__dirname, "../uploads/delegate_qr", "Logo.png"); // Logo path
          if (!fs.existsSync(logoPath)) {
            throw new Error("Logo file is missing at " + logoPath);
          }
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
      await generateQRCodeWithImage(imagePath, "https://www.justice-love-peace.com/delegate-registration?code=COTU-0000001-A");
   
      console.log(userPhotoPath, "userPhotoPath");
      const qrCodePath = path.join(__dirname, `../uploads/Amb_photo/Ambassador_qr.png`);
      // console.log(response[0].coupon_code, "zxzxcxxcxc");
      const destFolder = path.join(__dirname, "../uploads/Amb_batch");
      console.log("asasasa");
      // Ensure the destination folder exists
      if (!fs.existsSync(destFolder)) {
        fs.mkdirSync(destFolder, { recursive: true });
      }
   
      // Load images
      const baseImage = await loadImage(baseImagePath);
      const userPhoto = await loadImage(userPhotoPath);
      const qrCode = await loadImage(qrCodePath);
   
   
   
   
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
      ctx.fillText(personData.username, 200, 340);
   
      ctx.font = "bold 55px Arial";
      ctx.fillStyle = "#17598e";
      ctx.fillText("Country:", 200, 410);
      ctx.fillStyle = "black";
      ctx.fillText(personData.country, 440, 410);
   
   
      ctx.fillStyle = "#17598e";
      ctx.fillText("ID No:", 200, 480);
      ctx.fillStyle = "black";
      ctx.fillText(personData.idNo, 440, 480);
   
      // Add QR code
      const qrCodeX = 1250, qrCodeY = 1850, qrCodeWidth = 400, qrCodeHeight = 400;
      ctx.drawImage(qrCode, qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);
   
      // Save the output
      const outputFilePath = path.join(destFolder, "Abdesattar Ben Moussa.png");
      const out = fs.createWriteStream(outputFilePath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);
      out.on("finish", async () => {
        console.log(`Badge saved as PNG at: ${outputFilePath}`);
        const destFolderPdf = path.join(__dirname, "../uploads/Amb_pdf");
        // Create a PDF document and save it
        const pdfFilePath = path.join(destFolderPdf, `Abdesattar Ben Moussa.pdf`);
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
          link: "https://www.justice-love-peace.com/delegate-registration?code=COTU-0000001-A", // This makes the link clickable
          underline: true // Optional: underline the link for emphasis
        });
   
        doc.fillColor('blue').font('Helvetica-Bold').fontSize(10).text("https://www.justice-love-peace.com/delegate-registration?code=COIND-0000001-A", 120, 638, {
          link: "https://www.justice-love-peace.com/delegate-registration?code=COTU-0000001-A", // This makes the link clickable
          underline: true, // Optional: underline the link for emphasis
        });
   
        doc.end();
   
        console.log(`Badge saved as PDF at: ${pdfFilePath}`);
      });
   
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
   
  },
  peacekeeper_details_id  : async (req, res) => {
    // const verify_token= await VerifyToken(req,res);
    // console.log("verify_token",verify_token);
    try {
      if(req.body.peace_id.length ==0)
        {
        res.status(500).json({
          success:false,
          error:true,
          message:"All field is required"
        })
        }
      else
      {
        const login_peacekeeper= await authenicate_model.peacekeeper_details_id(req,res);
        console.log(login_peacekeeper[0][0],"check_controller");
        if(login_peacekeeper[0][0].result ==="No details found")
        {
          res.status(500).json({
            success:true,
            error:false,
            message:login_peacekeeper[0][0].result
          })
        }
        else
        {
          const protocol = "https";
          login_peacekeeper[0][0].file_name = login_peacekeeper[0][0].file_name 
              ? `${protocol}://${req.get("host")}/uploads/${login_peacekeeper[0][0].file_name}`
              : []; 
              login_peacekeeper[0][0].coupon_code = login_peacekeeper[0][0].coupon_code 
              ? `${protocol}://${req.get("host")}/uploads/batch/photo/${login_peacekeeper[0][0].coupon_code}.png`
              : [];  
           const encrypted_data= await encrypt(login_peacekeeper[0][0]);
           console.log(encrypted_data);   
          res.status(200).json({
            success:true,
            error:false,
            data:encrypted_data
          })
        }
      }  
   
   
    }
    catch (error) {
      res.status(500).json({
        success: false,
        error: true,
        message: error.message
      })
    }
   
  },
  get_delegate_details_id  : async (req, res) => {
    // const verify_token= await VerifyToken(req,res);
    // console.log("verify_token",verify_token);
    try {
      if(req.body.reference_code.length ==0)
        {
        res.status(500).json({
          success:false,
          error:true,
          message:"All field is required"
        })
        }
      else
      {
        const login_peacekeeper= await authenicate_model.get_delegate_by_reference(req,res);
        console.log(login_peacekeeper[0][0],"check_controller");
        if(login_peacekeeper[0][0].result ==="No details found")
        {
          res.status(500).json({
            success:true,
            error:false,
            message:login_peacekeeper[0][0].result
          })
        }
        else
        {
           const encrypted_data= await encrypt(login_peacekeeper[0]);
           console.log(encrypted_data);   
          res.status(200).json({
            success:true,
            error:false,
            data:encrypted_data
          })
        }
      }  
   
   
    }
    catch (error) {
      res.status(500).json({
        success: false,
        error: true,
        message: error.message
      })
    }
   
  },
  tinyurl_QR_code  : async (req, res) => {
    
    try
    {
      const imagePath = path.join(__dirname, `../uploads/delegate_qr/check.png`);
      const main_url="https://globaljusticeuat.cylsys.com/delegate-registration?code=COININ-0000001-W";
      const tiny_url=await shortenURL(main_url);
      console.log(tiny_url,"tiny_url");
      async function generateQRCodeWithImage(imagePath, qr_url) {
        try {
        
          const logoPath = path.join(__dirname, "../uploads/delegate_qr", "Logo.png"); // Logo path
          if (!fs.existsSync(logoPath)) {
            throw new Error("Logo file is missing at " + logoPath);
          }
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
      await generateQRCodeWithImage(imagePath,tiny_url);
    }
    catch(err)
    {
      res.status(500).json({
        success: false,
        error: true,
        message: err.message
      }) 
    }
   
  }
}
module.exports=authenticate_controller;