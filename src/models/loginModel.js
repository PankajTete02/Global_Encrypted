const db = require('../../db.config');



 // Generate a 6-char OTP




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
