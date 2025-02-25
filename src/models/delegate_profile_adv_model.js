const { check } = require('express-validator');
const pool = require('../../db.config');
const { search } = require('../routes/delegateProfileRoute');


const bulk_delegate_insert = (req, delegateData, callback) => {
    try {
        console.log("Processing delegate:", delegateData);

        let conferenceLeverInterestJson;
        try {
            conferenceLeverInterestJson = typeof delegateData.conference_lever_interest === "string"
                ? delegateData.conference_lever_interest
                : JSON.stringify(delegateData.conference_lever_interest);
        } catch (error) {
            console.error("Error stringifying conference_lever_interest:", error);
            return callback({ success: false, error: true, message: "Invalid conference_lever_interest format." }, null);
        }

        const sql = `
            CALL SP_INSERT_DELEGATE_PROFILE(
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?
            )`;

        const values = [
            delegateData.title, delegateData.first_name, delegateData.last_name,
            delegateData.country_code, delegateData.mobile_number, delegateData.email_id,
            delegateData.linkedIn_profile, delegateData.instagram_profile, delegateData.dob,
            delegateData.profession_1, delegateData.profession_2, delegateData.website,
            delegateData.organization_name, delegateData.address, delegateData.country,
            delegateData.state, delegateData.city, delegateData.pin_code ||null, delegateData.attend_summit,
            delegateData.attendee_purpose, conferenceLeverInterestJson, delegateData.created_by,
            delegateData.status, delegateData.passport_no, delegateData.passport_issue_by,
            delegateData.reference_no, delegateData.country_id, delegateData.state_id,
            delegateData.city_id, delegateData.is_nomination, delegateData.p_type, delegateData.p_reference_by
        ];

        pool.query(sql, values, (err, results) => {
            if (err) {
                console.error("Database Error:", err);
                return callback({ success: false, error: true, message: "Database error.", details: err }, null);
            }

            if (!results || !results[0] || !results[0][0]) {
                return callback(null, { success: false, error: true, message: "Unexpected database response." });
            }

            const response = results[0][0];

            // Known response messages
            const responseMessages = {
                "fail": { success: false, error: true, message: "Email already registered as a delegate.", check: "fail" },
                "fail1": { success: false, error: true, message: "Mobile number with given country code already registered.", check: "fail1" },
                "Coupon code invalid": { success: false, error: true, message: "Invalid coupon code provided.", check: "Coupon code invalid" },
                "success": { success: true, error: false, message: "Delegate profile registered successfully.", delegate_id: response.delegate_id || null, check: "success" }
            };

            return callback(null, responseMessages[response.response] || { success: false, error: true, message: "Unknown error occurred." });
        });

    } catch (err) {
        console.error("Unexpected Model Error:", err);
        return callback({ success: false, error: true, message: "Unexpected server error.", details: err }, null);
    }
};

function generateCouponCode(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let couponCode = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        couponCode += characters[randomIndex];
    }

    return couponCode;
}
const insert_sponsered_transcation_details = (req,data) => {
    console.log(data,"daata");
    try {
        return new Promise((resolve, reject) => {
            const query = 'CALL USP_INSERT_TRANSCATION_DETAILS(?,?,?,?,?,?,?)';
            const protocol = "https";
           
            const random = generateCouponCode(10);
            console.log(random,"randomcheck");
            pool.query(query, [
                data.email_id,
                "SPONSERED",
                "free",
                random,
                `${protocol}://${req.get("host")}/uploads/ticket/photo/${random}.png`,
                "hall address",
                null 
            ], (error, results) => {
                if (error) {
                    return reject(error);
                } else {
                    console.log(results[0], "result");
                    resolve(results[0]); // Assuming the first result contains the data
                }
            });
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: true, message: error.message });
    }
};

const get_all_speaker_list =(req,res)=>{
    try {
        console.log(req.body,"req_body");
        return new Promise((resolve, reject) => {
            const query = 'CALL USP_GET_SPEAKER_LIST(?,?,?)';
           
            pool.query(query, [
                req.body.p_search,
                req.body.p_limit,
                req.body.p_type
            ], (error, results) => {
                if (error) {
                    return reject(error);
                } else {
                    console.log(results[0], "result");
                    resolve(results[0]); // Assuming the first result contains the data
                }
            });
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: true, message: error.message });
    }
};

const sample_delegate_online =(req,res)=>{
    try {
        console.log(req.body,"req_body");
        return new Promise((resolve, reject) => {
            const query = 'CALL USP_INSERT_ONLINE_DELEGATE_DETAILS(?,?,?,?)';
           
            pool.query(query, [
                req.body.name,
                req.body.email,
                req.body.mobile_no,
                "DELEGATE_ONLINE"
            ], (error, results) => {
                if (error) {
                    return reject(error);
                } else {
                    console.log(results[0], "result");
                    resolve(results[0]); // Assuming the first result contains the data
                }
            });
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: true, message: error.message });
    }
}

module.exports = { bulk_delegate_insert, insert_sponsered_transcation_details,get_all_speaker_list,sample_delegate_online };
