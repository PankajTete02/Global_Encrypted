const nodemailer = require('nodemailer');

async function sendOtp(email) {
    const otp = Math.random().toString(36).slice(-6).toUpperCase(); // Generate a 6-char OTP
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'pankajt0201@gmail.com', // Your Gmail
            pass: 'pankajtete@020197' // Replace with the App Password
        }
    });

    const mailOptions = {
        from: 'pankajt0201@gmail.com',
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. It will expire in 5 minutes.`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        setTimeout(() => console.log('OTP expired'), 5 * 60 * 1000);
    } catch (error) {
        console.error('Error sending email: ', error);
    }
}

// Example usage
sendOtp('pankaj.tete@cylsys.com');
