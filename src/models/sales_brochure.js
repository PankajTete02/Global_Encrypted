"user strict";
var dbConn = require("../../db.config");

var sales_brochure = function (details) {
    this.first_name = details.first_name;
    this.last_name = details.last_name;
    this.designation = details.designation;
    this.department = details.department; // Added department property
    this.company_name = details.company_name;
    this.work_email = details.work_email;
    this.work_phone_number = details.work_phone_number;
    this.country = details.country;
    this.state = details.state; // Added state property
    this.city = details.city; // Added city property
    this.postcode = details.postcode; // Added postcode property
    this.check_whatsapp_number = details.check_whatsapp_number;
    this.check_details = details.check_details;
};

sales_brochure.create = function (details, result) {
  let sql = `call microsite_insert_sales_brochure(?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  dbConn.query(
    sql,
    [
      details.first_name,
      details.last_name,
      details.designation,
      details.department,
      details.company_name,
      details.work_email,
      details.work_phone_number,
      details.country,
      details.state,
      details.city,
      details.postcode,
      details.check_whatsapp_number,
      details.check_details
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
};


sales_brochure.findAll = function ( result) {
  let sql = `call  microsite_getall_sales_brochure();`;
  dbConn.query(sql, function (err, res) {
    if (err) {
      result(null, err);
    } else {
      result(null, res);
    }
  });
};

// =======================================================================================


sales_brochure.findBySearch_sales_brochure = function (params, result) {
  let search = params.search;
 
  var sql = 'call microsite_searchby_sales_brochure(?)';
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



sales_brochure.delete = function (sales_brochure_id, result) {
  dbConn.query("call  microsite_delete_sales_brochure(?);", sales_brochure_id, function (err, res) {
    if (err) {
      result(null, err);
    } else {
      result(null, res);
    }
  });
};



module.exports = sales_brochure;   
