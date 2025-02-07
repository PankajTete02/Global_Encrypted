"user strict";
var dbConn = require("../../db.config");

var Subscriber = function (details) {
  this.title = details.title;
  this.first_name = details.first_name;
  this.last_name = details.last_name;
  this.designation = details.designation;
  this.mobile = details.mobile;
  this.email = details.email;
  this.company_name = details.company_name;
  this.country = details.country;
  this.whatsaap_number_check = details.whatsaap_number_check;
  this.informa_market_check = details.informa_market_check;
  this.created_by = details.created_by;
};

Subscriber.create = function (details, result) {
  let sql = `call insertsubscriber(?,?,?,?,?,?,?,?,?,?,?);`;
  dbConn.query(
    sql,
    [
      details.title,
      details.first_name,
      details.last_name,
      details.designation,
      details.mobile,
      details.email,
      details.company_name,
      details.country,
      details.whatsaap_number_check,
      details.informa_market_check,
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
};

// ------------------------------------------------------------------------------------------------------------------

Subscriber.findAll = function ( result) {
  let sql = `call  getall_activesubscribers();`;
  dbConn.query(sql, function (err, res) {
    if (err) {
      result(null, err);
    } else {
      result(null, res);
    }
  });
};

// ===============================================================================================


Subscriber.delete = function (mail_id, result) {
  dbConn.query("call  microsite_delete_subscriber(?);", mail_id, function (err, res) {
    if (err) {
      result(null, err);
    } else {
      result(null, res);
    }
  });
};


Subscriber.findBySearch_Subscriber = function (params, result) {
  let search = params.search;
 
  var sql = 'call microsite_searchby_subscriber_user(?)';
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

module.exports = Subscriber;   
