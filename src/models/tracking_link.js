"user strict";
var dbConn = require("../../db.config");
const qr_code=require("../middleware/qr_code")
      
const shortenURL  = require("../middleware/tiny_url")
var Tracking = function (details) {
  this.form_id = details.form_id;
  this.refrence = details.refrence;
  this.tracking_key = details.tracking_key;
  this.tracking_url = details.tracking_url;
  this.tiny_url = details.tiny_url;
  this.qr_code = details.qr_code;
  this.created_by = details.created_by;
};

Tracking.create =async function (details, result) {
  let sql = `call microsite_create_tracking_list(?,?,?,?,?,?,?);`;
    // Generate the tiny_url using Bitly
    try {
console.log("details.tracking_url",details.tracking_url);
      // Generate the tiny_url using the shortenURL function
      const tiny_url =  await shortenURL(details.tracking_url);
      // Assuming you have a function to generate the QR code buffer
      const qrCodeBuffer = await qr_code.generateQRCode(details.tracking_url);
  
      console.log("model2", qrCodeBuffer);
  console.log("model tiny url",tiny_url);

      dbConn.query(
        sql,
        [
          details.form_id,
          details.refrence,
          details.tracking_key,
          details.tracking_url,
          tiny_url, // Use the generated tiny_url
          qrCodeBuffer,
          details.created_by
        ],
        function (err, res) {
          if (err) {
            console.log("error: ", err);
            result(err, null);
          } else {
            result(null, res);
          }
        }
      );
    } catch (error) {
      console.error("Error:", error);
    }
  };
// =======================================Tracking-Forms=============================================


Tracking.findAlltracking = function ( result) {
    let sql = `call  microsite_get_tracking_link();`;
    dbConn.query(sql, function (err, res) {
      if (err) {
        result(null, err);
      } else {
        result(null, res);
      }
    });
  };
  
// ====================================Tracking-reference=========================================


Tracking.findAllrefrences = function ( result) {
    let sql = `call  microsite_get_refrences();`;
    dbConn.query(sql, function (err, res) {
      if (err) {
        result(null, err);
      } else {
        result(null, res);
      }
    });
  };
  
  // ==========================================================================================

  
Tracking.findAllform = function ( result) {
  let sql = `call microsite_get_forms();`;
  dbConn.query(sql, function (err, res) {
    if (err) {
      result(null, err);
    } else {
      result(null, res);
    }
  });
};

// =================================================================================================

Tracking.delete = function (tracking_link_id, result) {
  dbConn.query("call  microsite_delete_tracking_links(?);", tracking_link_id, function (err, res) {
    if (err) {
      result(null, err);
    } else {
      result(null, res);
    }
  });
};

// ===============================================================================================


Tracking.findBySearch_Tracking_user = function (params, result) {
  let search = params.search;
 
  var sql = 'call microsite_searchby_tracking_link(?)';
  dbConn.query(sql, [search], function (err, res) {
      if (err) {
          console.log("error: ", err);
          result(err, null);
      }
      else {
          result(null, res);
      }
  });
};


module.exports = Tracking; 