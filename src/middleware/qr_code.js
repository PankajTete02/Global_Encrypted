const { log } = require('handlebars/runtime');
const qrcode = require('qrcode');
const fs = require('fs');
const dbConn = require("../../db.config");

function generateQRCode(data) {
  console.log("qr code tracking url",data);
  return new Promise((resolve, reject) => {
    qrcode.toDataURL(data, (err, url) => {
      if (err) {
        reject(err);
      } else {
        console.log("url",url);
        // const base64Data = url.split(',')[1];
        // const buffer = Buffer.from(base64Data, 'base64');
        // resolve(buffer);

        resolve(url);
      }
    });
  });
}




//.........................img............for vender to scan when he is standee...
// Function to generate QR code and save it to the database
async function generateQRCodeAndSaveforVender(link) {
  try {
    // Generate QR code
    const qrCodeBuffer = await qrcode.toBuffer(link);

    // Save QR code image to the file system
    // const imageName = `qrcode_${Date.now()}.png`; // You can use jpg if needed
    const imageName = `qrcode.png`; 
    const imagePath = `src/uploads/qrcodes/${imageName}`;

    // Check if the record already exists in the database
    const checkRecordQuery = 'SELECT COUNT(*) AS count FROM tbl_qr_code_forvender WHERE link = ? AND image_path = ? AND is_active = 1';
    const checkRecordValues = [link, imagePath];
    dbConn.query(checkRecordQuery, checkRecordValues, async (error, checkResults) => {
      if (error) {
        console.error('Error checking database for existing record:', error);
      } else {
        if (checkResults[0].count > 0) {
          console.log('QR code record for vender already exists in the database. Skipping...');
        } else {
   

    // Save image path and link to the database
    const insertQuery = 'call microsite_qr_code_for_vender (?, ?)';
    const values = [link, imagePath];

    dbConn.query(insertQuery, values, (error, results) => {
      if (error) {
        console.error('Error saving to database:', error);
      } else {
       
        if(results[0][0].response==="fail"){
          console.log('QR code exist in database');
          console.log('Image path:', imagePath);

        }
        else{
        console.log('QR code saved to database successfully');
        console.log('Image path:', imagePath);
        }
      }
    });
    // Save QR code image to the file system
    fs.writeFileSync(imagePath, qrCodeBuffer);
  }
}
});
  } catch (error) {
    console.error('Error generating QR code:', error);
  }
}

//Function to download pdfafter scanning qr code

async function generateQRCodeAndSaveforDownloadAgenda(link) {
  try {
    // Generate QR code
    const qrCodeBuffer = await qrcode.toBuffer(link);

    // Save QR code image to the file system
    // const imageName = `qrcode_${Date.now()}.png`; // You can use jpg if needed
    const imageName = `qrcode.png`; 
    const imagePath = `src/uploads/agenda/${imageName}`;

    // Check if the record already exists in the database
    const checkRecordQuery = 'SELECT COUNT(*) AS count FROM tbl_qr_code_agendadownload WHERE link = ? AND image_path = ? AND is_active = 1';
    const checkRecordValues = [link, imagePath];
    dbConn.query(checkRecordQuery, checkRecordValues, async (error, checkResults) => {
      if (error) {
        console.error('Error checking database for agenda existing record:', error);
      } else {
        if (checkResults[0].count > 0) {
          console.log('QR code record for download agenda already exists in the database. Skipping...');
        } else {
   

    // Save image path and link to the database
    const insertQuery = 'call microsite_qr_code_agendadownload (?, ?)';
    const values = [link, imagePath];

    dbConn.query(insertQuery, values, (error, results) => {
      if (error) {
        console.error('Error saving to database:', error);
      } else {
       
        if(results[0][0].response==="fail"){
          console.log('QR code exist in database');
          console.log('Image path:', imagePath);

        }
        else{
        console.log('QR code saved for agenda to database successfully');
        console.log('Image path:', imagePath);
        }
      }
    });
    // Save QR code image to the file system
    fs.writeFileSync(imagePath, qrCodeBuffer);
  }
}
});
  } catch (error) {
    console.error('Error generating QR code:', error);
  }
}

async function generateQRCodeAndSaveforDownloadBroucher(link) {
  try {
    // Generate QR code
    const qrCodeBuffer = await qrcode.toBuffer(link);

    // Save QR code image to the file system
    // const imageName = `qrcode_${Date.now()}.png`; // You can use jpg if needed
    const imageName = `qrcode.png`; 
    const imagePath = `src/uploads/broucher/${imageName}`;

    // Check if the record already exists in the database
    const checkRecordQuery = 'SELECT COUNT(*) AS count FROM tbl_qr_code_broucher_download WHERE link = ? AND image_path = ? AND is_active = 1';
    const checkRecordValues = [link, imagePath];
    dbConn.query(checkRecordQuery, checkRecordValues, async (error, checkResults) => {
      if (error) {
        console.error('Error checking database for Broucher existing record:', error);
      } else {
        if (checkResults[0].count > 0) {
          console.log('QR code record for download Broucher already exists in the database. Skipping...');
        } else {
   

    // Save image path and link to the database
    const insertQuery = 'call microsite_qr_code_broucherdownload (?, ?)';
    const values = [link, imagePath];

    dbConn.query(insertQuery, values, (error, results) => {
      if (error) {
        console.error('Error saving to database:', error);
      } else {
       
        if(results[0][0].response==="fail"){
          console.log('QR code exist in database');
          console.log('Image path:', imagePath);

        }
        else{
        console.log('QR code saved for Broucher to database successfully');
        console.log('Image path:', imagePath);
        }
      }
    });
    // Save QR code image to the file system
    fs.writeFileSync(imagePath, qrCodeBuffer);
  }
}
});
  } catch (error) {
    console.error('Error generating QR code:', error);
  }
}
module.exports = {
  generateQRCode: generateQRCode,
  generateQRCodeAndSaveforVender:generateQRCodeAndSaveforVender,
  generateQRCodeAndSaveforDownloadAgenda:generateQRCodeAndSaveforDownloadAgenda,
  generateQRCodeAndSaveforDownloadBroucher:generateQRCodeAndSaveforDownloadBroucher
};
