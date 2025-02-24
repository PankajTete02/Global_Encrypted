const pool = require('../../db.config');

const insertDelegateProfile = (req, delegateData, callback) => {
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
        city_id
    } = delegateData;
 
    console.log("delgate",delegateData);
 
    const conference_lever_interest1 = JSON.stringify(req.body.conference_lever_interest);
    const sql = `
        CALL SP_INSERT_DELEGATE_PROFILE(
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?
        )`;
 
    const values = [
        title, first_name, last_name, country_code, mobile_number, email_id,
        linkedIn_profile, instagram_profile, dob, profession_1, profession_2, website,
        organization_name, address, country, state, city, pin_code, attend_summit,
        attendee_purpose, conference_lever_interest1, created_by, status, passport_no, passport_issue_by, reference_no, country_id,state_id, city_id
    ];
 
    pool.query(sql, values, (err, results) => {
        if (err) {
            return callback(err, null);
        }
 
        // Assuming the first result set contains the response status
        const response = results[0][0]; // Only taking the first row from the first result set
 
        // Handling based on stored procedure response
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
            return callback(null, { response: "success" });
        }
        else {
            return callback(null, { response: "error", message: "Unknown error" });
        }
    });
};

module.exports = {
    insertDelegateProfile
};
