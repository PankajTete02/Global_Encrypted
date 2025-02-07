const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const dbConn = require('../../db.config').promise();

exports.register = async(req,res,next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{

        const [row] = await dbConn.execute(
            "SELECT `email` FROM `tbl_admin` WHERE `email`=?",
            [req.body.email]
          );

        if (row.length > 0) {
            return res.status(201).json({
                message: "The E-mail already in use",
            });
        }

        const hashPass = await bcrypt.hash(req.body.password, 12);

        const [rows] = await dbConn.execute('call microsite_admin_registered(?,?,?)',[
            req.body.name,
            req.body.email,
            hashPass
        ]);

        if (rows.affectedRows === 1) {
            return res.status(201).json({
                message: "The admin has been successfully inserted.",
            });
        }
        
    }catch(err){
        next(err);
    }
}