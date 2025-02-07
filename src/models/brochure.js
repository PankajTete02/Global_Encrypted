"user strict";
var dbConn = require("../../db.config");

var brochure = function (details) {
    this.contact_name = details.contact_name;
    this.email = details.email;
    this.job_tittle = details.job_tittle;
    this.company_name = details.company_name;
    this.country = details.country;
    this.phone_number = details.phone_number; // Added department property
    this.mobile = details.mobile;
    this.area_of_interest = details.area_of_interest;
    this.check_whatsapp_number = details.check_whatsapp_number;
    this.check_details = details.check_details;
};

brochure.create = function (details, result) {
    let sql = `call microsite_insert_brochure(?,?,?,?,?,?,?,?,?,?)`;

    var event_val;
  if(details.check_whatsapp_number===''){
   this.event_val=0;
   console.log("if not checked",this.event_val);
 }
 else{
   this.event_val=1;
   console.log("if checked",this.event_val);

 }


 var check_val;
 if(details.check_details===''){
  this.check_val=0;
  console.log("if not checked",this.check_val);
}
else{
  this.check_val=1;
  console.log("if checked",this.check_val);

}
    dbConn.query(
        sql,
        [
            details.contact_name,
            details.email,
            details.job_tittle,
            details.company_name,
            details.country,
            details.phone_number,
            details.mobile,
            details.area_of_interest,
            this.event_val,
            this.check_val
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

// ===============================================================================================

brochure.findAll = function ( result) {
    let sql = `call  microsite_getall_brochures();`;
    dbConn.query(sql, function (err, res) {
      if (err) {
        result(null, err);
      } else {
        result(null, res);
      }
    });
  };
  
// ==================================================================================================


brochure.find_searchby_brochure = function (params, result) {
  let search = params.search;
 
  var sql = 'call microsite_searchby_brochure(?)';
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

// ========================================================================================================


brochure.delete = function (brochure_id, result) {
  dbConn.query("call  microsite_delete_brochure(?);", brochure_id, function (err, res) {
    if (err) {
      result(null, err);
    } else {
      result(null, res);
    }
  });
};




module.exports = brochure;   
