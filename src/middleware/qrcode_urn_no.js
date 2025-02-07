const qrcode = require('qrcode');
var dbConn = require("../../db.config");

 function generateQRCode_URN_NO(urn) {
  console.log("qr code tracking url",urn);
  return new Promise((resolve, reject) => {
    qrcode.toDataURL(urn, (err, url) => {
      if (err) {
        reject(err);
      } else {
        // const base64Data = url.split(',')[1];
        // const buffer = Buffer.from(base64Data, 'base64').toString('base64');
        // console.log("qr",buffer);
        if (url) {
            console.log("qrrrrrrrrrrrrr");
             dbConn.query('UPDATE tbl_user SET qr_code = ? WHERE urn_no=?', [url,urn]);
              resolve("Saved QR code successfully");
            } 
           else {
            reject('QR code buffer is empty');
          }
      }
    });
  });
}

module.exports = {
  generateQRCode_URN_NO: generateQRCode_URN_NO,
};
