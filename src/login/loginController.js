const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const dbConn = require('../../db.config');


exports.login = async (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        // Call the stored procedure to get admin email
        dbConn.query('CALL microsite_get_admin_email(?)', [req.body.email], async (err, results) => {
            if (err) {
                return next(err);
            }
    
            // Assuming the first result set contains the response status
            const row = results[0]; // Only taking the first result set
    
            if (row.length === 0) {
                return res.status(422).json({
                    message: "Invalid email address", // Return a 422 status code
                    success: "false",
                    errors: "true",
                });
            }
    
            const user = row[0]; // Store the user data
            if (!user || !user.password) {
                return res.status(422).json({
                    message: "Invalid email address", // Return a 422 status code
                    success: "false",
                    errors: "true",
                });
            }
    
            const passMatch = await bcrypt.compare(req.body.password, user.password);
            if (!passMatch) {
                return res.status(422).json({
                    message: "Incorrect password", // Return a 422 status code
                    success: "false",
                    errors: "true",
                });
            }
    
            const theToken = jwt.sign({ user_id: user.id }, process.env.SECRET_KEY, { expiresIn: '10h' });
    
            return res.json({
                message: "Login successful",
                data: {
                    name: user.name,
                    email: user.email,
                    admin_id: user.admin_id
                },
                status: 200,
                token: theToken,
            });
        });
    } catch (err) {
        next(err);
    }
    
   
}    


