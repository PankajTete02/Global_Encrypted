const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const dbConn = require('../../db.config');
const {VerifyToken,encrypt,decrypt} =require('../middleware/auth');

exports.login = async (req, res, next) => {

    const errors = validationResult(req);
   
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        console.log(req.body.encrypted_data, "Received Encrypted Data");
    
        // Ensure encrypted data is present
        if (!req.body.encrypted_data) {
            return res.status(400).json({ message: "Missing encrypted data", success: false, errors: true });
        }
    
        // Decrypt data
        console.log(req.body.encrypted_data,"req.body.encrypted_data");
        const decrypt_data = await decrypt(req.body.encrypted_data);
        console.log(decrypt_data,"decrypted");
        // Ensure decryption was successful
        if (!decrypt_data) {
            return res.status(400).json({ message: "Decryption failed", success: false, errors: true });
        }
        console.log(decrypt_data, "Decrypted Data");
        let parsedData;
        try {
            parsedData = JSON.parse(decrypt_data);
        } catch (error) {
            return res.status(400).json({ message: "Invalid JSON format after decryption", success: false, errors: true });
        }
    
        console.log(parsedData, "Parsed Data");
    
        // Ensure email field exists
        if (!parsedData.email) {
            return res.status(400).json({ message: "Missing 'email' field in decrypted data", success: false, errors: true });
        }
    
        // Call the stored procedure to get admin email
        dbConn.query('CALL microsite_get_admin_email(?)', [parsedData.email], async (err, results) => {
            if (err) {
                return next(err);
            }
    
            // Assuming the first result set contains the response status
            const row = results[0];
    
            if (!row || row.length === 0) {
                return res.status(422).json({
                    message: "Invalid email address",
                    success: false,
                    errors: true,
                });
            }
    
            const user = row[0]; // Store the user data
            if (!user || !user.password) {
                return res.status(422).json({
                    message: "Invalid email address",
                    success: false,
                    errors: true,
                });
            }
    
            // Compare passwords
            const passMatch = await bcrypt.compare(parsedData.password, user.password);
            if (!passMatch) {
                return res.status(422).json({
                    message: "Incorrect password",
                    success: false,
                    errors: true,
                });
            }
    
            // Generate JWT token
            const theToken = jwt.sign({ user_id: user.id }, process.env.SECRET_KEY, { expiresIn: '10h' });
            console.log(theToken, "Generated Token");
    
            // Encrypt token
            const encrypted_token = await encrypt(theToken);
            console.log(encrypted_token, "Encrypted Token");
    
            // User Data
            const data = {
                name: user.name,
                email: user.email,
                admin_id: user.admin_id
            };
            console.log(data, "User Data");
    
            // Encrypt user data
            const encrypted_data = await encrypt(JSON.stringify(data));
            console.log(encrypted_data, "Encrypted User Data");
    
            // Return response
            return res.json({
                message: "Login successful",
                data: encrypted_data,
                status: 200,
                token: encrypted_token,
            });
        });
    } catch (err) {
        next(err);
    }
    
   
}    


