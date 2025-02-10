const { error } = require('pdf-lib');
const otpModel = require('../models/loginModel');
const nodemailer = require('nodemailer');


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
			return res.status(400).json({ message: 'Missing required fields', status: 0 });
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
		else if(result.result[0][0].status === 4){
			console.log("4");
			res.status(200).json(
				{ message: result.result[0][0].message, 
					status: 200,
					success:true,
					error:false
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
		console.log(result[0].message,"result");
		
		res.status(200).json(
			{ message: result[0].message, 
				status: 200,
				success:true,
				error:false
			}
		);
	} catch (error) {
		res.status(500).json({ message: 'Internal server error', error });
	}
};


