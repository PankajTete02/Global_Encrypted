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
		text: `Your OTP code is ${otp}. It will expire in 5 minutes.`
	};

	try {
		const info = await transporter.sendMail(mailOptions);
		console.log('Email sent: ' + info.response);
		return info.response;
	} catch (error) {
		console.error('Error sending email: ', error);
	}
}


exports.sendOtp = async (req, res) => {
	try {
		const { email,deviceId, deviceOs,registeration_type } = req.body;
		console.log(req.body,"req.body");
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
		console.log(result.result[0][0].status,"check");
		console.log(result.otp,"otp");
		if(result.result[0][0].status === 1){
			console.log("1");
			console.log(result.otp,"result.otp");
			const mail=await otpSend(email, result.otp);
			console.log(mail,"mail");
			return res.status(200).json(
				{
				 message:result.result[0][0].message, 
				 status: 200,
				 success:false,
				 error:true
				}
				);
		}
		else if(result.result[0][0].status === 3){
			console.log("3");
			res.status(200).json(
				{ message: result.result[0][0].message, 
					status: 400,
					success:false,
					error:true
				});
		}
		else if(result.result[0][0].status === 4){
			console.log("4");
			res.status(200).json(
				{ message: result.result[0][0].message, 
					status: 400,
					success:false,
					error:true
				});
		}
		else
		{ 
			console.log("5");
			console.log(result.otp,"result.otp1");
			const mail=await otpSend(email, result.otp);
			res.status(200).json(
				{ message: result.result[0][0].message, 
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
		if (!email || !otp) {
			return res.status(400).json({ message: 'Missing email or OTP', status: 400 });
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
		console.log(parsedData,"parsedData");
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
		// console.log(result,"result");
	
		if(result.success == 1){
		return res.status(200).json({
			message: result.message, 
			status: 200,
			success:true,
			error:false
		});
	}else{
		return res.status(400).json({
			message: result, 
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
        const { userId, role } = req.body;

        if (!userId || !role) {
            return res.status(400).json({ message: "userId and role are required" });
        }

        await otpModel.deactivateUser(userId, role);
        return res.status(200).json({ message: "User deactivated successfully" });

    } catch (error) {
        return res.status(500).json({ message: "Error deactivating user", error: error.message });
    }
};


