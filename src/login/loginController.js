const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const dbConn = require('../../db.config').promise();


exports.login = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        console.log('req.body.email:', req.body.email);
    
        const [row] = await dbConn.execute(
            'call microsite_get_admin_email(?)',
            [req.body.email]
        );
        //console.log('Database Query Result:', row);
        if (row.length === 0) {
            return res.status(422).json({
                message: "Invalid email address", // Return a 422 status code
            });
        }
    
        const user = row[0][0]; // Store the user data
        if (!user || !user.password) {
            return res.status(422).json({
                message: "Invalid email address", // Return a 422 status code
                success: "false",
                errors:"true",
            });
        }
    
        console.log('req.body.password:', req.body.password);
        console.log('user.password:', user.password);
    
        const passMatch = await bcrypt.compare(req.body.password, user.password);
        if (!passMatch) {
            return res.status(422).json({
                message: "Incorrect password", // Return a 422 status code
                success: "false",
                errors:"true",
            });
        }
    
        console.log("jhgdwsfd", process.env.SECRET_KEY);
        const theToken = jwt.sign({ user_id: user.id }, process.env.SECRET_KEY, { expiresIn: '10h' });
    
        return res.json({
            // message: process.env.SECRET_KEY,
            message: "login Successfully",
            data:{
                name:user.name,
                email:user.email,
                admin_id:user.admin_id
            },
            status: 200 /* Defaults to 200 */,
            token: theToken,
        });
    
    } catch (err) {
        next(err);
    }
}    