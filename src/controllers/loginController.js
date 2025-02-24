const { error } = require('pdf-lib');
const otpModel = require('../models/loginModel');
const nodemailer = require('nodemailer');
const {VerifyToken,encrypt,decrypt} =require('../middleware/auth');
const { log } = require('handlebars');


async function otpSend(email, otp) {
	console.log("zxzxzxzx");
  console.log(email,"email");
	console.log(otp,"otp1");
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'Peacekeeper@global-jlp-summit.com', // Your Gmail
			pass: 'tusi xeoi hxoz fwwb' // Replace with the App Password
		}
	});

	const mailOptions = {
		from: 'Peacekeeper@global-jlp-summit.com',
		to: email,
		subject: 'Your OTP Code',
		text: `Your OTP code is ${otp}. It will expire in 2 minutes.`
	};

	try {
		const info = await transporter.sendMail(mailOptions);
		console.log('Email sent: ' + info.response);
		return info.response;
	} catch (error) {
		console.error('Error sending email: ', error);
	}
}

// async function pwdSend(email, pwd) {
//     const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//             user: "Peacekeeper@global-jlp-summit.com", // Your Gmail
//             pass: "tusi xeoi hxoz fwwb", // Replace with App Password
//         },
//     });

//     const mailOptions = {
//         from: "Peacekeeper@global-jlp-summit.com",
//         to: email,
//         subject: "Your New Password",
//         text: `Your new password is: ${pwd}`,
//     };

//     try {
//         const info = await transporter.sendMail(mailOptions);
//         console.log("Email sent: " + info.response);
//         return info.response;
//     } catch (error) {
//         console.error("Error sending email: ", error);
//         throw error;
//     }
// }

// function generateRandomPassword() {
//     const length = Math.floor(Math.random() * 2) + 7; // Randomly choose between 7 and 8 characters
//     const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
//     const lowercase = "abcdefghijklmnopqrstuvwxyz";
//     const numbers = "0123456789";
//     const specialChars = "!@#$%^&*";
//     const allChars = uppercase + lowercase + numbers + specialChars;

//     let password = "";
//     password += uppercase[Math.floor(Math.random() * uppercase.length)];
//     password += specialChars[Math.floor(Math.random() * specialChars.length)];

//     for (let i = 2; i < length; i++) {
//         password += allChars[Math.floor(Math.random() * allChars.length)];
//     }

//     return password.split("").sort(() => 0.5 - Math.random()).join(""); // Shuffle password
// }


exports.sendOtp = async (req, res) => {
	try {
		const { email,deviceId, deviceOs,registeration_type } = req.body;
		// console.log(req.body,"req.body");
		if (!email || !deviceId || !deviceOs || !registeration_type) {
			return res.status(400).json(
				{
					message:'Missing required fields', 
					status: 400,
					success:false,
					error:true
				}
			);
		}
		
		const result = await otpModel.insertLoginUser(email,deviceId, deviceOs,registeration_type);
		// console.log(result[0][0],"check");
		// console.log(result.otp,"otp");

		// Check if registeration_type = 0 and that email already registerd as peacekeeper 
		if(result.result[0][0].status === 3){
			return res.status(400).json({
				message : "Email was already registered,you can login",
				status: 400,
				success: false,
				error: true,
				status_type:3
			});
		}
		// it Checks if registeration_type = 1 on login time if the user enter the email id which was not in our data BAse meas it was not register user then the message from the database was 
		// User does not exist 
		else if(result.result[0][0].status === -1){
			res.status(400).json(
				{ message: result.result[0][0].message, //User does not exist
					status: 400,
					success:false,
					error:true,
					status_type:-1
				});
		}
		// else it was give the responce OTP sent successfully 
		else
		{ 
			console.log("5");
			console.log(result.otp,"result.otp1");
			const mail=await otpSend(email, result.otp);
			res.status(200).json(
				{ message: result.result[0][0].message, //OTP sent successfully
					status: 200,
					success:true,
					error:false
				});
		}
		
	} catch (error) {
		res.status(500).json({ message: 'Internal server error', error: error.message });
	}
};


exports.verifyOtp = async (req, res) => {
	try {
		const { email, otp } = req.body;
		if (!email) {
			return res.status(400).json({ message: 'Email is require', status: 400 });
		}
		if (!otp) {
			return res.status(400).json({ message: 'OTP is require', status: 400 });
		}
		else if(otp.length < 6){
			return res.status(400).json({ message: 'OTP length should be 6', status: 400 });
		}
		else if(otp.length > 6){
			return res.status(400).json({ message: 'OTP length should be 6', status: 400 });
		}

		const result = await otpModel.verifyOtp(email, otp);
		console.log(result,"result");
		if(result[0].status === 2){
			return res.status(200).json(
				{ 
					message: result[0].message,
					is_password: result[0].status,
					status: 200,
					success:true,
					error:false
				}
			);
		}else if(result[0].status === 1){
			return res.status(200).json(
				{ 
					message: result[0].message,
					is_password: result[0].status,
					status: 200,
					success:true,
					error:false
				}
			);
		}else if(result[0].status === 3){	
			return res.status(400).json(
				{ 
					message: result[0].message,
					is_password: result[0].status,
					status: 400,
					success:false,
					error:true
				}
			);
		}else if(result[0].status === 4){	
			return res.status(400).json(
				{ 
					message: result[0].message,
					is_password: result[0].status,
					status: 400,
					success:false,
					error:true
				}
			);
		}
	} catch (error) {
		res.status(500).json({ message: 'Internal server error', error });
	}
};

// Parameter Email ,  Password, Confirm Password and Update Password feild in the tbl_peacekeeper_volunteers 

exports.updatePassword = async (req, res) => {
    try {
		// const decrypt_details= await decrypt(req.body);
		// console.log(decrypt_details,"decrypt_details");
		
        // const parsedData = JSON.parse(decrypt_details);
		const parsedData = req.body;
		// console.log(parsedData,"parsedData");
		const {email, password, confirmPassword} = parsedData;
        if (!email || !password || !confirmPassword) {
            return res.status(400).json({ success: false,error:true, message: 'All fields are required.' });
        }
		const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ success: false, error:true ,message: 'Password must contain at least one uppercase letter and one special character.' });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, error:true,message: 'Password and Confirm Password do not match.' });
        }
		
		const encryptedPassword =await encrypt(password);
		
        const result = await otpModel.generatePassword(email, encryptedPassword);
		// console.log(result[0].success,"result");
	
		if(result[0].success === 1){
		return res.status(200).json({
			message: result[0].message, 
			status: 200,
			success:true,
			error:false
		});
	}else{
		return res.status(400).json({
			message: result[0].message, 
			status: 400,
			success:false,
			error:true
		});
	}

    } catch (error) {
        console.error("Error in updatePassword:", error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// ---------------New Updations in change pwd----------------------------
// genrate password
// exports.insertPassword = async (req, res) => {
//     try {
// 		 await VerifyToken(req,res);

// 		const parsedData = req.body;
// 		console.log(parsedData,"parsedData");
// 		const {email, password, confirmPassword} = parsedData;
//         if (!email || !password || !confirmPassword) {
//             return res.status(400).json({ success: false,error:true, message: 'All fields are required.' });
//         }
// 		const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])/;
//         if (!passwordRegex.test(password)) {
//             return res.status(400).json({ success: false, error:true ,message: 'Password must contain at least one uppercase letter and one special character.' });
//         }
//         if (password !== confirmPassword) {
//             return res.status(400).json({ success: false, error:true,message: 'Password and Confirm Password do not match.' });
//         }
// 		console.log(password,"password");
		
// 		const encryptedPassword =await encrypt(password);
// 		console.log(encryptedPassword,"encryptedPassword");
		
		
//         const result = await otpModel.insertPassword(email, encryptedPassword);
// 		// console.log(result,"result");
	
// 		if(result.success == 1){
// 		return res.status(200).json({
// 			message: result.message, 
// 			status: 200,
// 			success:true,
// 			error:false
// 		});
// 	}else{
// 		return res.status(400).json({
// 			message: result, 
// 			status: 400,
// 			success:false,
// 			error:true
// 		});
// 	}

//     } catch (error) {
//         console.error("Error in updatePassword:", error);
//         res.status(500).json({ message: 'Internal server error', error: error.message });
//     }
// };

// exports.forgetPassword = async (req, res) => {
//     try {
//         const { email } = req.body;
// 		await VerifyToken(req,res);
		
//         if (!email) {
//             return res.status(400).json({ success: false, error: true, message: "Email is required." });
//         }

//         // Generate a random password
//         const newPassword = generateRandomPassword();
//         await pwdSend(email, newPassword);
//         const encryptedPassword = await encrypt(newPassword);

//         const result = await otpModel.forgetPassword(email, encryptedPassword);
// 			// console.log(result,"result");
			
//         if (result) {
//             return res.status(200).json({
//                 message: result.message,
//                 status: 200,
//                 success: true,
//                 error: false,
//             });
//         } else {
//             return res.status(400).json({
//                 message: result,
//                 status: 400,
//                 success: false,
//                 error: true,
//             });
//         }
//     } catch (error) {
//         console.error("Error in forgetPassword:", error);
//         res.status(500).json({ message: "Internal server error", error: error.message });
//     }
// };
// ---------------END Updated code------------------------------------------
exports.fetchLookupData = async (req, res) => {
	const inputData = req.body;
	otpModel.getLookupData(inputData, (err, data) => {
	  if (err) {
		console.error('Error fetching data:', err);
		return res.status(500).json({
		  error: true,
		  message: err.message,
		});
	  }
	  res.status(200).json(data);
	});
};

exports.deactivateUser = async (req, res) => {
    try {
        let { email, role } = req.query;
        if (!email || !role) {
            return res.status(400).json({ 
                message: "Email and role are required", 
                status: 400,
                success: false,
                error: true 
            });
        }

        // Call the model function and get the stored procedure's message
        const result = await otpModel.deactivateUser(email, role);
		console.log(result,"result");
		if(result.message === "Account already deleted"){
			return res.status(400).json({ 
				message: result.message,
				status:  400, // 200 if successful, 400 otherwise
				success: "false",
				error: "true"
			});
		}
        return res.status(200).json({ 
            message: result.message,
            status: result.success ? 200 : 400, // 200 if successful, 400 otherwise
            success: result.success,
            error: result.error
        });

    } catch (error) {
        return res.status(500).json({ 
            message: "Error deleting user", 
            error: error.message,
            status: 500,
            success: false,
            error: true 
        });
    }
};



