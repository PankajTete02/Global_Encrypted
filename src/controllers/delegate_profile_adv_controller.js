const delegate_profile_adv_model = require('../models/delegate_profile_adv_model');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const qrcode = require('qrcode');
const sharp = require('sharp');
const ejs = require('ejs');
const { createCanvas, loadImage } = require("canvas");
const { PDFDocument } = require('pdf-lib');


const bulk_delegate_insert = async (req, res) => {
  try {
    const delegate = req.body; // Expecting a single delegate object

    if (!delegate || typeof delegate !== 'object') {
      return res.status(400).json({ success: false, error: true, message: "Invalid input. Expecting a delegate object." });
    }

    const requiredFields = [
      "title", "first_name", "last_name", "country_code", "mobile_number",
      "email_id", "dob", "profession_1", "country", "city",
      "attendee_purpose", "conference_lever_interest", "is_nomination", "p_type", "p_reference_by"
    ];

    let errors = [];

    let delegateErrors = requiredFields
      .filter(field => !delegate[field])
      .map(field => `${field} is required`);

    if (delegate.mobile_number && !/^\d+$/.test(delegate.mobile_number)) {
      delegateErrors.push("mobile_number should be a valid number");
    }

    if (delegate.email_id && !/^\S+@\S+\.\S+$/.test(delegate.email_id)) {
      delegateErrors.push("email_id should be a valid email address");
    }

    if (delegate.dob) {
      const dobDate = new Date(delegate.dob);
      if (isNaN(dobDate.getTime()) || dobDate >= new Date()) {
        delegateErrors.push("dob should be a valid past date");
      }
    }

    if (delegateErrors.length > 0) {
      return res.status(400).json({ success: false, error: true, message: "Validation errors", details: delegateErrors });
    }

    // Insert delegate into the database
    delegate_profile_adv_model.bulk_delegate_insert(req, delegate, async (err, response) => {
      if (err) {
        return res.status(500).json({ success: false, error: true, message: err.message, details: err[0] });
      }

      let message = "Unknown error";
      let success = false;

      if (response.check === "fail") {
        message = "Email already registered as delegate.";
      } else if (response.check === "fail1") {
        message = "Mobile number with the given country code already registered.";
      } else if (response.check === "Coupon code invalid") {
        message = "Coupon code invalid";
      } else {
        await sendEmailNotification(req, delegate.email_id, delegate.is_nomination, delegate.reference_no, delegate);
        message = "Delegate profile registered successfully.";
        success = true;
      }

      return res.status(success ? 201 : 400).json({
        success,
        error: !success,
        message
      });
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ success: false, error: true, message: error.message });
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
const get_speaker_list =async(req,res)=>{
   try
   {
    const check = await delegate_profile_adv_model.insert_sponsered_transcation_details(req, delegate);
    console.log("Database transaction result:", check);
    console.log(check[0].random_id, "check");
   }
   catch(err)
   {

   }  

}

const sendEmailNotification = async (req, email, is_nomination, reference_no, delegate) => {
  try {
    console.log("Processing delegate:", delegate);

    const check = await delegate_profile_adv_model.insert_sponsered_transcation_details(req, delegate);
    console.log("Database transaction result:", check);
    console.log(check[0].random_id, "check");

    async function generateTicket(data) {
      for (const entry of data) {
        try {
          const imageName = `${entry.random_id}.png`;
          const imagePath = path.join(__dirname, "../uploads/ticket_qr", imageName);
          const qr_url = entry.random_id;

          async function generateQRCodeWithImage(imagePath, qr_url) {
            try {
              const logoPath = path.join(__dirname, "../uploads/delegate_qr", "Logo.png");
              const qrCodeBuffer = await qrcode.toBuffer(qr_url, { errorCorrectionLevel: 'H', scale: 10, margin: 1 });
              const qrDimensions = await sharp(qrCodeBuffer).metadata();
              const logoSize = Math.floor(qrDimensions.width / 4);
              const logoBuffer = await applyCircleMaskToLogo(logoPath, logoSize);

              await sharp(qrCodeBuffer)
                .composite([{ input: logoBuffer, gravity: 'center', blend: 'over' }])
                .toFile(imagePath);

            } catch (error) {
              console.error("Error generating QR code:", error);
            }
          }

          async function applyCircleMaskToLogo(logoPath, logoSize) {
            try {
              const logoImage = await sharp(logoPath).resize(logoSize, logoSize).toBuffer();
              const circleMask = Buffer.from(`<svg width="${logoSize}" height="${logoSize}"><circle cx="${logoSize / 2}" cy="${logoSize / 2}" r="${logoSize / 2}" fill="white" /></svg>`);
              return sharp(logoImage).composite([{ input: circleMask, blend: 'dest-in' }]).toBuffer();
            } catch (error) {
              console.error("Error applying circle mask:", error);
            }
          }

          await generateQRCodeWithImage(imagePath, qr_url);
          console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
          const destFolder = path.join(__dirname, "../uploads/Ticket_photo");
          const baseImagePath = path.join(__dirname, "../uploads/delegate_qr/FinalTicket.png");
          console.log(baseImagePath, "baseImagePath");


          logError(baseImagePath);
          const qrCodePath = path.join(__dirname, `../uploads/ticket_qr/${imageName}`);
          console.log(qrCodePath, "qrCodePath");
          logError(qrCodePath);
          // Load Images

          if (fs.existsSync(baseImagePath)) {
            logError("Exists");
            logError(baseImagePath);

          }
          if (fs.existsSync(qrCodePath)) {
            logError("Exists qrCodePath");
            logError(qrCodePath);

          }
          const baseImage = await loadImage(baseImagePath);
          const qrCode = await loadImage(qrCodePath);


          const canvas = createCanvas(baseImage.width, baseImage.height);
          const ctx = canvas.getContext("2d"); // Move this before using ctx

          ctx.drawImage(baseImage, 0, 0);

          function drawVerticalText(ctx, text, x, y, maxFontSize, color, maxWidth, maxHeight) {
            ctx.save();
            ctx.translate(x, y); // Move to position
            ctx.rotate(-Math.PI / 2); // Rotate counterclockwise
            ctx.fillStyle = color;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            let fontSize = 175;
            const minFontSize = 50; // Minimum font size
            ctx.font = `bold ${fontSize}px Arial`;

            // Dynamic logic to split the text into two balanced lines
            const words = text.split(" ");
            let line1 = [];
            let line2 = [];

            // Divide words roughly into two balanced lines
            const midIndex = Math.ceil(words.length / 2);
            line1 = words.slice(0, midIndex).join(" ");
            line2 = words.slice(midIndex).join(" ");

            // Adjust font size to fit both lines within maxWidth and maxHeight
            const adjustFontSize = () => {
              while (
                (ctx.measureText(line1).width > maxHeight ||
                  ctx.measureText(line2).width > maxHeight ||
                  fontSize * 2 > maxWidth) &&
                fontSize > minFontSize
              ) {
                fontSize -= 1;
                ctx.font = `bold ${fontSize}px Arial`;
              }
            };
            adjustFontSize();

            // Calculate line spacing
            const lineHeight = fontSize * 1.2; // Adjust spacing proportional to font size
            const totalHeight = 2 * lineHeight;
            const startY = -(totalHeight / 2) + lineHeight / 2;

            // Draw the text lines
            ctx.fillText(line1, 0, startY); // First line
            ctx.fillText(line2, 0, startY + lineHeight); // Second line
            logError(line1);
            logError(line2);
            ctx.restore();
          }

          function drawVerticalText1(ctx, text, x, y, font, color, lineHeight = 160) {
            ctx.save();
            ctx.translate(x, y); // Move to position
            ctx.rotate(-Math.PI / 2); // Rotate counterclockwise
            ctx.font = `bold ${font}px Arial`; // Font size
            ctx.fillStyle = color;
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            const lines = text.split("\n");
            lines.forEach((line, index) => {
              ctx.fillText(line, 0, index * lineHeight); // Adjust `lineHeight` for spacing
            });
            logError(lines);
            ctx.restore();
          }

          var name = `${entry.title} ${entry.first_name} ${entry.last_name}`;
          drawVerticalText(ctx, name, 400, 1450, 260, "#005B94"); // Name on the left
          drawVerticalText(ctx, "Delegate", 850, 1350, 200, "green");

          const address = "North Halls\nExhibition\nCentre (DEC),\nExpo City, \nDubai";
          drawVerticalText1(ctx, address, 6600, 1360, 160, "#005B94");

          const qrCodeX = 6220, qrCodeY = 1600, qrCodeWidth = 1225, qrCodeHeight = 1250;
          ctx.drawImage(qrCode, qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);

          // Save the output image
          const outputFilePath = path.join(destFolder, `${entry.random_id}.png`);
          logError(outputFilePath);
          const out = fs.createWriteStream(outputFilePath);
          const stream = canvas.createPNGStream();
          stream.pipe(out);

          out.on("finish", async () => {
            console.log(`Badge saved as PNG at: ${outputFilePath}`);

            const destFolderPdf = path.join(__dirname, "../uploads/Ticket_pdf");
            const pdfFilePath = path.join(destFolderPdf, `${entry.random_id}.pdf`);
            console.log(pdfFilePath, "pdfFilePath");
            async function pngToPdf() {
              console.log("A");
              try {
                console.log("outputFilePath", outputFilePath);
                // Read the PNG file from the "png" folder
                const imagePath = outputFilePath;
                console.log(imagePath, "imagePath");
                const pngBytes = fs.readFileSync(imagePath);

                // Create a new PDF document
                const pdfDoc = await PDFDocument.create();
                const pngImage = await pdfDoc.embedPng(pngBytes);

                // Get original dimensions
                let { width, height } = pngImage;

                // Define the max dimensions for resizing
                const maxWidth = 500;  // Adjust this for the desired width
                const maxHeight = 700; // Adjust this for the desired height

                // Resize while maintaining aspect ratio
                if (width > maxWidth || height > maxHeight) {
                  const aspectRatio = width / height;
                  if (width > height) {
                    width = maxWidth;
                    height = maxWidth / aspectRatio;
                  } else {
                    height = maxHeight;
                    width = maxHeight * aspectRatio;
                  }
                }

                // Add a properly sized page to the PDF
                const page = pdfDoc.addPage([width, height]);
                page.drawImage(pngImage, {
                  x: 0,
                  y: 0,
                  width,
                  height,
                });

                // Save the resized PDF
                const pdfBytes = await pdfDoc.save();
                fs.writeFileSync(pdfFilePath, pdfBytes);
                logError("sucess_;pdf");
              } catch (error) {
                console.error('Error converting PNG to PDF:', error);
                logError(error.message);
              }
            }
            pngToPdf();
            console.log(`Badge saved as PDF at: ${pdfFilePath}`);
          });

        } catch (error) {
          console.error("Error processing ticket for entry:", entry, error);
        }
      }
    }

    const nominations = [{
      title: check[0].title,
      email_id: check[0].email_id,
      last_name: check[0].last_name,
      random_id: check[0].random_id,
      first_name: check[0].first_name
    }];
    console.log(nominations);
    await generateTicket(nominations);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'Peacekeeper@global-jlp-summit.com',
        pass: 'tusi xeoi hxoz fwwb'
      }
    });


    const mailOptions = {
      from: 'Peacekeeper@global-jlp-summit.com',
      to: check[0].email_id,
      //to:"udayshimpi2000@gmail.com",
      subject: 'Delegate at the Global Justice Summit - It’s just one step away',
      html: `<img src="cid:qrCodeImage" alt="QR Code" style="width: 50%; height: 50%;" />`,
      attachments: [
        {
          filename: `${check[0].random_id}.png`, // Assuming coupon_code exists in response[0]
          path: path.join(__dirname, '../uploads/Ticket_photo', `${check[0].random_id}.png`),
          cid: 'qrCodeImage' // Same Content-ID as used in the HTML
        }
      ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  } catch (error) {
    console.error("Error in sendEmailNotification:", error);
  }
};


module.exports = { bulk_delegate_insert }