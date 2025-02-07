const fs = require('fs');
const path = require('path');
const pdf = require('html-pdf');
const handlebars = require('handlebars');
const emailMsg = require("../../middlewares/email")
const wspMsg = require("../../middlewares/whatsapp");
const { log } = require('handlebars/runtime');
const { Console } = require('console');
var dbConn = require("../../db.config");

async function generatePDF(userName, company, designation, userEmail, urn_no, qr_code, statusType, userNumber, filepath, formName) {
  try {
                        
    // console.log("badge...........", urn_no, userName, qr_code);
    // Read the HTML content from a file
    let htmlFilePath;
    if (formName === "delegate") {
      console.log("1");
      htmlFilePath = path.join(__dirname, '../middleware/badge-html/delegate_card.html');
      console.log("path......1.", htmlFilePath);

    }
    else if (formName === "partner") {
      console.log("2");
      htmlFilePath = path.join(__dirname, '../middleware/badge-html/partner_card.html');
      console.log("path......2.", htmlFilePath);

    }
    else {
      console.log("3");
      htmlFilePath = path.join(__dirname, '../middleware/badge-html/speaker_card.html');
      console.log("path.....3..", htmlFilePath);
    }
    // const htmlFilePath = path.join(__dirname, '../middleware/badge-html/delegate_card.html');
    console.log(formName);
    console.log("path.......", htmlFilePath);

    const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

    // Create a Handlebars template
    const template = handlebars.compile(htmlContent);
    // Define the data to pass to the template


    // Define the data object
    let data;

    if (qr_code != null) {
      data = {
        urn: urn_no,
        name: userName,
        qr_code: qr_code.substring(qr_code.indexOf(",") + 1)
      };
    } else {
      data = {
        urn: urn_no,
        name: userName,
        qr_code: ''
      };
    }

    console.log("data..............qr............", qr_code);


    console.log("data..............qr............", qr_code);
    // Render the template with the data
    const replacedHtml = template(data);

    // Define PDF options

    let assetPath = path.resolve(__dirname, '../middleware/badge-html');
    assetPath = assetPath.replace(new RegExp(/\\/g), '/')
    console.log(assetPath);
    console.log('file:///' + assetPath + '/',);
    const pdfOptions = {
      format: 'A4', // or 'A4' or other page sizes
      // orientation: 'portrait', // or 'landscape'
      // base: 'file:///' + assetPath + '/',
    };



    console.log("pdfOptions.......", pdfOptions);
    // Generate the PDF
    await pdf.create(replacedHtml, pdfOptions).toBuffer(async (err, buffer) => {
      if (err) {
        console.error('Error:', err);
        throw err; // Re-throw the error for external handling
      }
      // console.log(buffer);
      // Save the PDF to a file
      // fs.writeFileSync('src/uploads/delegate.pdf', buffer);
      // filepath=`src/uploads/delegate_${urn_no}.pdf`;
      fs.writeFileSync(filepath, buffer);

      // const sql = 'CALL microsite_update_user_filepath(?, ?)';
      // dbConn.query(sql, [filepath, urn_no]);


      console.log('PDF saved successfully');

      console.log("badge.pdf", userName, company, designation, urn_no, statusType);

      if (statusType === 1 || statusType === 2 || statusType === 'generate_badge') {
        await wspMsg.sendWhatsAppMessage(userName, company, designation, urn_no, statusType, userNumber).then((message) => console.log(`WhatsApp message sent with SID: ${message.sid}`))
          .catch((error) => console.error(`Error sending WhatsApp message: ${error.message}`));
        await wspMsg.sendMediaMessage(urn_no, userNumber).then((message) => console.log(`WhatsApp media message sent with SID: ${message.sid}`))
          .catch((error) => console.error(`Error sending WhatsApp message: ${error.message}`));
        await emailMsg.email(filepath, userName, company, designation, userEmail, urn_no, qr_code, statusType).then((message) => console.log(`Email message sent with SID: ${message}`))
          .catch((error) => console.error(`Error sending Email: ${error.message}`));
      }

      if (statusType === 'email') {
        await emailMsg.email(filepath, userName, company, designation, userEmail, urn_no, qr_code, statusType).then((message) => console.log(`Email message sent with SID: ${message}`))
          .catch((error) => console.error(`Error sending Email: ${error.message}`));
      }

      // Return the PDF buffer
      return buffer;
    });
    return filepath;

  } catch (error) {
    console.error('Error:', error);
    throw error; // Re-throw the error for external handling
  }
}

module.exports = { generatePDF };
