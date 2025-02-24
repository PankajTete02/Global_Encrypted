"user strict";
const { log } = require("console");
var dbConn = require("../../db.config");

var Delegatedetails = function (details) {
  this.registration_type = details.registration_type;
  this.title = details.title;
  this.first_name = details.first_name;
  this.last_name = details.last_name;
  this.department = details.department;
  this.designation = details.designation;
  this.mobile_number = details.mobile_number;
  this.email_id = details.email_id;
  this.company_name = details.company_name;
  this.company_address = details.company_address;
  this.address_line_1 = details.address_line_1;
  this.address_line_2 = details.address_line_2;
  this.address_line_3 = details.address_line_3;
  this.country = details.country;
  this.state = details.state;
  this.city = details.city;
  this.pin_code = details.pin_code;
  this.website = details.website;
  this.conference_day = details.conference_day;
  this.attending_purpose = details.attending_purpose;
  this.created_by = details.created_by;
  this.specific_solution = details.specific_solution;
  this.attended_innopack = details.attended_innopack;
  this.is_whatsapp_number = details.is_whatsapp_number;
  this.terms_condition = details.terms_condition;
  this.events = details.events;
  this.refrence_url = details.refrence_url;
  this.updated_by = details.updated_by;
  this.user_id = details.user_id;
  this.country_code = details.country_code;
};

Delegatedetails.create = function (details, result) {
  let sql = `call  microsite_create_user(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`;
  var event_val;
  if (details.events === '') {
    this.event_val = 0;
    console.log("if not checked", this.event_val);
  }
  else {
    this.event_val = 1;
    console.log("if checked", this.event_val);

  }
  console.log(details);
  dbConn.query(
    sql,
    [
      details.registration_type,
      details.title,
      details.first_name,
      details.last_name,
      details.department,
      details.designation,
      details.mobile_number,
      details.email_id,
      details.company_name,
      details.company_address,
      details.address_line_1,
      details.address_line_2,
      details.address_line_3,
      details.country,
      details.state,
      details.city,
      details.pin_code,
      details.website,
      details.conference_day,
      details.attending_purpose,
      this.created_by,
      details.specific_solution,
      details.attended_innopack,
      details.is_whatsapp_number,
      details.terms_condition,
      this.event_val,
      details.refrence_url,
      details.country_code
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
//-------------------------------------Delegate Form -------------------------------------------------------------
Delegatedetails.findById = function (req,res, result) {
  const { page_no, size_no } = req.body;
  if (!page_no || !size_no || page_no <= 0 || size_no <= 0) {
    return res.status(400).json({
      status: false,
      error: true,
      message: "Invalid page number or size.",
    });
  }
  // Validate input to avoid SQL injection or invalid values
  

  // Log the incoming parameters for debugging
  console.log("Page Number:", page_no, "Page Size:", size_no);

  // Execute the stored procedure with the provided parameters
  dbConn.query(
    "CALL microsite_get_nonregistered_delegate(?, ?);",
    [page_no, size_no],
    function (err, res) {
      if (err) {
        console.error("Database Error:", err);
        result(err, null);
      } else {
        console.log("Query Result:", res);
        // Check if the stored procedure returns expected results
        if (res && res[0]) {
          result(null, res[0]); // Return only the data rows
        } else {
          result(null, []);
        }
      }
    }
  );
};

// ====================GetAll--Approve--Delegate======
Delegatedetails.findByApproved = function (req,res, result) {

  const { page_no, size_no } = req.body;
  if (!page_no || !size_no || page_no <= 0 || size_no <= 0) {
    return res.status(400).json({
      status: false,
      error: true,
      message: "Invalid page number or size.",
    });
  }
  
  dbConn.query(
    "call microsite_get_approved_delegate(?,?);",
    [page_no, size_no],
    function (err, res) {
      if (err) {
        console.error("Database Error:", err);
        result(err, null);
      } else {
        console.log("Query Result:", res);
        // Check if the stored procedure returns expected results
        if (res && res[0]) {
          result(null, res[0]); // Return only the data rows
        } else {
          result(null, []);
        }
      }
    }
  );
};
//-------------------------------------------Partner Form --------------------------------------------------------------------------

Delegatedetails.findByPartner = function (id, result) {
  dbConn.query(
    "call microsite_get_nonregistered_partner();",
    id,
    function (err, res) {
      if (err) {
        result(null, err);
      } else {
        result(null, res);
      }
    }
  );
};
// //================GetAll-Approve-Partner=======

Delegatedetails.findByApprovePartner = function (id, result) {
  dbConn.query(
    "call microsite_get_approved_partner();",
    id,
    function (err, res) {
      if (err) {
        result(null, err);
      } else {
        result(null, res);
      }
    }
  );
};
// -----------------------------------------Speaker Form --------------------------------------------------------
Delegatedetails.findBySpeaker = function (id, result) {
  dbConn.query(
    "call microsite_get_nonregistered_speaker();",
    id,
    function (err, res) {
      if (err) {
        result(null, err);
      } else {
        result(null, res);
      }
    }
  );
};
// //=============Get All Approved Speaker=================
Delegatedetails.findByApproveSpeaker = function (id, result) {
  dbConn.query(
    "call microsite_get_approved_speaker();",
    id,
    function (err, res) {
      if (err) {
        result(null, err);
      } else {
        result(null, res);
      }
    }
  );
};
//--------------------------------------------------------------------------------------------------------------------
Delegatedetails.findAll = function (company_id, result) {
  let sql = `call  Microsite_Getll_Delegate();`;
  dbConn.query(sql, company_id, function (err, res) {
    if (err) {
      result(null, err);
    } else {
      result(null, res);
    }
  });
};
//----------------------------------------------------------------------------------------------------------------------------------
Delegatedetails.update_approve = function (user_id, result) {
  dbConn.query(
    "call  microsite_update_users_approve_text(?);",
    [user_id],
    function (err, res) {
      if (err) {
        result(null, err);
      } else {
        result(null, res);
      }
    }
  );
};
//------------------------------------------------------------------------------------------------------------------------------------
Delegatedetails.update_unapprove = function (user_id, result) {
  dbConn.query(
    "call  microsite_update_users_unapprove_text(?);",
    [user_id],
    function (err, res) {
      if (err) {
        result(null, err);
      } else {
        result(null, res);
      }
    }
  );
};

// ---------------------------------------Update All Status--------------------------------------------------------------------------------
Delegatedetails.update_status = function (userIDs, statusType, updated_by, filepath, callback) {
  const query = `CALL microsite_status_change(?, ?,?,?)`;
  console.log("", filepath, userIDs, statusType, updated_by, filepath,);
  dbConn.query(query, [userIDs, statusType, updated_by, filepath], (err, results) => {
    if (err) {
      return callback(err, null);
    }

    return callback(null, results);
  });
}
// -------------------------------------------------------------------------------------------------------------------------
Delegatedetails.delete = function (user_id, result) {
  dbConn.query("call  microsite_deletebyID(?);", user_id, function (err, res) {
    if (err) {
      result(null, err);
    } else {
      result(null, res);
    }
  });
};

// --------------------------------------search delegate user-----------------------------------------------

Delegatedetails.findBySearch_delegate_user = function (params, result) {
  let search = params.search;

  var sql = 'call microsite_searchby_delegate_user(?)';
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

// ----------------------------------search partner user--------------------------------------------------

Delegatedetails.findBySearch_partner_user = function (params, result) {
  let search = params.search;

  var sql = 'call microsite_searchby_partner_user(?)';
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

// ---------------------------------search speaker user-------------------------------------------------

Delegatedetails.findBySearch_speaker_user = function (params, result) {
  let search = params.search;

  var sql = 'call microsite_searchby_speaker_user(?)';
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

// ------------------------------------Search NonRegisterd Data----------------------------------------------------------------------
// =====================================================================================================================
Delegatedetails.findBySearch_delegate_nonregistered = function (params, result) {
  let search = params.search;

  var sql = 'call microsite_searchby_delegate_nonregistered(?)';
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


// -------------------------------------------------------------------------------------------------------------------------
Delegatedetails.findBySearch_partner_nonregistered = function (params, result) {
  let search = params.search;

  var sql = 'call microsite_searchby_partner_nonregistered(?)';
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


// ------------------------------------------------------------------------------------------------------------------

Delegatedetails.findBySearch_speaker_nonregistered = function (params, result) {
  let search = params.search;

  var sql = 'call microsite_searchby_speaker_nonregistered(?)';
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

// =================================================================================================
Delegatedetails.microsite_get_already_exixts_delegate = function (registration_type,email_id, mobile_number,urn_no, callback) {
  let sql = 'CALL microsite_get_already_exixts_delegate(?, ?,?,?)';
  dbConn.query(sql, [registration_type,email_id, mobile_number,urn_no], function (err, res) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, res[0]); // Assuming the result is an array and you want the first element
    }
  });
};

// =========================================================================================================

Delegatedetails.microsite_get_already_exixts_partner = function (email_id, mobile_number,urn_no, callback) {
  let sql = 'CALL microsite_get_already_exixts_partner(?, ?,?)';
  dbConn.query(sql, [email_id, mobile_number,urn_no], function (err, res) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, res[0]); // Assuming the result is an array and you want the first element
    }
  });
};

// ========================================================================================================


Delegatedetails.microsite_get_already_exixts_speaker = function (email_id, mobile_number,urn_no, callback) {
  let sql = 'CALL microsite_get_already_exixts_speaker(?, ?,?)';
  dbConn.query(sql, [email_id, mobile_number,urn_no], function (err, res) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, res[0]); // Assuming the result is an array and you want the first element
    }
  });
};

Delegatedetails.update_details = function (details, result) {
  var event_val;
  if (details.events === '' || details.events === false || details.events === 0) {
    this.event_val = 0;
    console.log("if not checked", this.event_val);
  }
  else {
    this.event_val = 1;
    console.log("if checked", this.event_val);

  }
  //  console.log("model",details);

  dbConn.query(
    "call microsite_update_user(?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?);",
    [details.user_id,
    details.title,
    details.first_name,
    details.last_name,
    details.department,
    details.designation,
    details.mobile_number,
    details.email_id,
    details.company_name,
    details.company_address,
    details.address_line_1,
    details.address_line_2,
    details.address_line_3,
    details.country,
    details.state,
    details.city,
    details.pin_code,
    details.website,
    details.conference_day,
    details.attending_purpose,
    details.specific_solution,
    details.attended_innopack,
    details.is_whatsapp_number,
    details.terms_condition,
    this.event_val,
    details.updated_by,
    details.country_code
    ],
    function (err, res) {
      if (err) {
        console.log(err);

        result(null, err);

      } else {
        console.log(res);

        result(null, res);
      }
    }
  );
};

Delegatedetails.userById = function (id, result) {
  console.log("userById", id);
  dbConn.query(
    "call microsite_get_user_byid(?);",
    id,
    function (err, res) {
      if (err) {
        result(null, err);
      } else {
        result(null, res);
      }
    }
  );
};
//.......................................................cancelled users.......................................

Delegatedetails.findAllCancelledUsersDelegates = function (company_id, result) {
  let sql = `call microsite_get_cancelled_unapproved_users_delegates();`;
  dbConn.query(sql, company_id, function (err, res) {
    if (err) {
      result(null, err);
    } else {
      result(null, res);
    }
  });
};


Delegatedetails.findAllCancelledUsersPartners = function (company_id, result) {
  let sql = `call microsite_get_cancelled_unapproved_users_partner();`;
  dbConn.query(sql, company_id, function (err, res) {
    if (err) {
      result(null, err);
    } else {
      result(null, res);
    }
  });
};

Delegatedetails.findAllCancelledUsersSpeakers = function (company_id, result) {
  let sql = `call microsite_get_cancelled_unapproved_users_speaker();`;
  dbConn.query(sql, company_id, function (err, res) {
    if (err) {
      result(null, err);
    } else {
      result(null, res);
    }
  });
};
module.exports = Delegatedetails;
