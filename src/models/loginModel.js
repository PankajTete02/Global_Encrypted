const db = require('../../db.config');
const { encrypt } = require('../middleware/auth');
require("dotenv").config();
const CryptoJS = require("crypto-js");


// Insert OTP into `tbl_user_login_info`
exports.insertLoginUser = async (email, deviceId, deviceOs,registeration_type) => {
	console.log("re",registeration_type);
	try {
		const otp = Math.random().toString(36).slice(-6).toUpperCase();
		console.log(otp,"otp");
		const [result] = await db.promise().query(`CALL USP_INSERT_LOGIN_USER(?, ?,?, ?,?)`, [email, otp, deviceId, deviceOs,registeration_type]);
		console.log(result);
		return {result,otp}; // Return the response from the stored procedure
	} catch (error) {
		throw error;
	}
};

// Verify OTP with 5-minute expiry check
exports.verifyOtp = async (email, otp) => {
	try {
		const [result] = await db.promise().query(`CALL USP_VERIFY_OTP(?, ?)`, [email, otp]);
		return result[0]; // Return the response from the stored procedure
	} catch (error) {
		throw error;
	}
};


exports.generatePassword = async (email, password) => {
    try {
 
        const encryptedPassword = CryptoJS.AES.encrypt(password, process.env.ENCRYPTION_KEY).toString();
        // console.log(typeof encryptedPassword,"encryptPass");
        
        const rows = await db.promise().query('CALL USP_GENERATE_PEACEKEEPER_PASSWORD(?, ?)', [email, encryptedPassword]);
		// console.log(rows,"rows");
		
        return { success: true, message: rows[0].message || 'Password updated successfully.' };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

exports.loginPeacekeeper = async (email, password) => {

	
};