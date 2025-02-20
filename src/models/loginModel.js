const db = require('../../db.config');
const { encrypt } = require('../middleware/auth');
require("dotenv").config();
const CryptoJS = require("crypto-js");


// Insert OTP into `tbl_user_login_info`
exports.insertLoginUser = async (email, deviceId, deviceOs, registeration_type) => {
    try {
        const otp = Math.random().toString(36).slice(-6).toUpperCase();
        console.log(`Generated OTP: ${otp}`);
        
        const [result] = await db.promise().query(
            `CALL USP_INSERT_LOGIN_USER(?, ?, ?, ?, ?)`,
            [email, otp, deviceId, deviceOs, registeration_type]
        );

        console.log("Stored Procedure Result:", result);
        
        return { result, otp }; // Return stored procedure response along with OTP
    } catch (error) {
        console.error("Database Error:", error);
        throw error;
    }
};



// Verify OTP with 
exports.verifyOtp = async (email, otp) => {
	try {
		const [result] = await db.promise().query(`CALL USP_VERIFY_OTP(?, ?)`, [email, otp]);
		return result[0]; // Return the response from the stored procedure
	} catch (error) {
		throw error;
	}
};


exports.generatePassword = async (email,oldpassword, newpassword) => {
    try {

        const pwdSql = `CALL USP_GLOBAL_GET_PWD(?)`;
        const [pwdResult] = await db.promise().query(pwdSql, [email]);
        // console.log(pwdResult,"pwdResult");
        

      const userPwdData = pwdResult[0][0];
    //   console.log("User password data:", userPwdData);

      if (userPwdData.is_pwd_generated === -1) {
        return { success: false, error: true, message: "User does not exist" , status :-1 };
      }

      if (userPwdData.is_pwd_generated == 1) {
        const encryptedPassword = userPwdData.pv_password;
         let decryptedPassword = "";

           decryptedPassword = CryptoJS.AES.decrypt(encryptedPassword, process.env.ENCRYPTION_KEY)
            .toString(CryptoJS.enc.Utf8)
            .replace(/"/g, "");
        console.log(decryptedPassword,"pssd");
        
      if (decryptedPassword === oldpassword) {
        const updateResut = await db.promise().query('CALL USP_AUTH_UPDATE_PWD(?,?)', [email, newpassword]);         
        return { success: true, data:updateResut[0][0], status:1 };
      }else{
        return { success: true, status:-1 ,message: 'Old Password not matched.' };
      }
    }
    } catch (error) {
        return { success: false, message: error.message };
    }
};

// ---------------Updated code -----------------
exports.insertPassword = async (email, password) => {
    try {
            
        const rows = await db.promise().query('CALL USP_AUTH_INSERT_PWD(?, ?)', [email, password]);
		// console.log(rows,"rows");
		
        return { success: true, message: rows[0].message || 'Password created successfully.' };
    } catch (error) {
        return { success: false, message: error.message };
    }
};
exports.forgetPassword = async (email, pwd) => {
    try {
 
        const rows = await db.promise().query('CALL USP_AUTH_FORGET_PWD(?, ?)', [email, pwd]);
		// console.log(rows,"rows");
		
        return { success: true, message: rows[0].message || 'Password sent successfully.' };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

exports.getLookupData   = async (lookupdata, callback) => {
    const query = "CALL USP_GLOBAL_FETCH_LOOKUP_MASTER(?, ?)";
    const params = [
      lookupdata.parent_code,
      lookupdata.type
    ];
 
    db.query(query, params, (err, results) => {
      if (err) {
        console.error("Database error: ", err);
        return callback(err, null);
      }
      callback(null, results[0]);
    });
};

  exports.deactivateUser = async (email, role) => {
    return new Promise((resolve, reject) => {
        const sql = "CALL USP_GLOBAL_DEACTIVE_USER(?, ?)";

        db.query(sql, [email, role], (err, result) => {
            if (err) {
                return reject(err);
            }

            // Extracting the message from stored procedure response
            const responseMessage = result?.[0]?.[0]?.message || "Unknown response";
            console.log(responseMessage,"responseMessage");
            
            // Define a response object with dynamic success/error handling
            const response = {
                message: responseMessage,
                success: responseMessage === "User successfully deleted",
                error: responseMessage !== "User successfully deleted"
            };

            resolve(response);
        });
    });
};
