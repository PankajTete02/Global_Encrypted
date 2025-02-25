const pool = require('../../db.config');

const insertDelegateProfile = (req, delegateData, callback) => {
  console.log(delegateData,"delegateData");
  const {
      title,
      first_name,
      last_name,
      country_code,
      mobile_number,
      email_id,
      linkedIn_profile,
      instagram_profile,
      dob,
      profession_1,
      profession_2,
      website,
      organization_name,
      address,
      country,
      state,
      city,
      pin_code,
      attend_summit,
      attendee_purpose,
      conference_lever_interest,
      created_by,
      status,
      passport_no,
      passport_issue_by,
      reference_no,
      country_id,
      state_id,
      city_id,
      is_nomination,
      p_type,
      p_reference_by
  } = delegateData;

  console.log("delgate",delegateData);
  // console.log("nnnnnnn",delegateData.is_nomination);

  const conference_lever_interest1 = JSON.stringify(req.body.conference_lever_interest);
  const sql = `
      CALL SP_INSERT_DELEGATE_PROFILE(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)`;

  const values = [
      title, first_name, last_name, country_code, mobile_number, email_id,
      linkedIn_profile, instagram_profile, dob, profession_1, profession_2, website,
      organization_name, address, country, state, city, pin_code, attend_summit,
      attendee_purpose, conference_lever_interest1, created_by, status, passport_no, passport_issue_by, reference_no, country_id,state_id, city_id,
      is_nomination,p_type,p_reference_by
  ];

  pool.query(sql, values, (err, results) => {
      if (err) {
          return callback(err, null);
      }

      const response = results[0][0]; 

      if (response.response === "fail") {
          return callback(null, { response: "fail" });
      }
      else if (response.response === "fail1") {
          return callback(null, { response: "fail1" });
      }
      else if (response.response === "Coupon code invalid") {
          return callback(null, { response: "Coupon code invalid" });
      }
      else if (response.response === "success") {
          return callback(null, { response: "success",id:response.delegate_id });
      }
      else {
          return callback(null, { response: "error", message: "Unknown error" });
      }
  });
};

const insertDelegateProfiles = (req, delegateData, callback) => {
  console.log("Delegate Data:", JSON.stringify(delegateData));

  const sql = `CALL SP_INSERT_DELEGATE_PROFILE_BULK(?)`;

  pool.query(sql, [JSON.stringify(delegateData)], (err, results) => {
    if (err) {
      console.error("Error in bulk insert:", err);
      return callback({
        message: "Server error during bulk insert.",
        details: err,
      }, null); // Return a more descriptive error message
    }

    const response = results[0][0]; 

    // Handle various response scenarios
    if (response.response === "fail") {
      return callback(null, {
        success: false,
        error: true,
        message: "Delegate profile insertion failed. Please check the data and try again."
      });
    } else if (response.response === "fail1") {
      return callback(null, {
        success: false,
        error: true,
        message: "Duplicate data: Email or mobile number already exists in the system."
      });
    } else if (response.response === "success") {
      return callback(null, {
        success: true,
        error: false,
        message: "Delegate profiles inserted successfully.",
        ids: response.delegate_ids // Returning the delegate IDs if available
      });
    } else {
      return callback(null, {
        success: false,
        error: true,
        message: `Unexpected error occurred during insertion. Response: ${JSON.stringify(response)}`
      });
    }
  });
};



const download_badge = async (req, res) => {
    try {
      console.log("B"); 
      const sql = `CALL USP_DOWNLOAD_BADGE(?)`;
      console.log(req.params.email,"email");
      const [result] = await pool.promise().query(sql, [req.params.email]);
      console.log("Login Result:", result);
  
      console.log(result,"ckec")
      // Return the response
      return result;
  
    } catch (error) {
      console.error("Database Error:", error);
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };

  const insert_nomination = (req) => {
    return new Promise((resolve, reject) => {
      const sql_query = `CALL USP_INSERT_NOMINATION_DETAILS(?, ?, ?, ?, ?,?,?)`;
  
      pool.query(
        sql_query,
        [
          req.body.delegate_id,
          req.body.nomination_name,
          req.body.relation_id,
          req.body.dob,
          req.body.email,
          req.body.mobile_no,
          req.body.institution
        ],
        (err, result) => {
          if (err) {
            console.error("Database Error:", err);
            return reject({ message: "Database error", error: err });
          }
  
          console.log(result, "Database Result");
          resolve(result[0]); // Resolve the first result set (if applicable)
        }
      );
    });
  };

  const get_nomination_details =(req)=>{

    return new Promise((resolve, reject) => {
        const sql_query = `CALL USP_NOMINATION_DETAILS_GET_NOMINATION_ID(?)`;
        pool.query(
          sql_query,
          [
            req.body.email,
          ],
          (err, result) => {
            if (err) {
              console.error("Database Error:", err);
              return reject({ message: "Database error", error: err });
            }
    
            console.log(result, "Database Result");
            resolve(result[0]); // Resolve the first result set (if applicable)
          }
        );
      });
}; 

module.exports = {
    insertDelegateProfile,
    insertDelegateProfiles,
    download_badge,
    insert_nomination,
    get_nomination_details
};
