const jwt = require('jsonwebtoken');
const conn = require('../../db.config').promise();

exports.getUser = async (req, res, next) => {

    try {
        if (
            !req?.headers?.authorization ||
            !req?.headers?.authorization.startsWith('Bearer') ||
            !req?.headers?.authorization.split(' ')[1]
        ) {
            return res.status(422).json({
                message: "Please provide the token",
            });
        }
        
        console.log("tttkkknnn.........", req?.headers?.authorization);
        console.log("theToken................",  req?.headers?.authorization.split(' ')[1]);
        const theToken = req?.headers?.authorization.split(' ')[1];
        console.log("theToken................", theToken);
        const decoded = jwt.verify(theToken, process.env.SECRET_KEY);
        console.log("decoded................", decoded);
        if (decoded) {
            const [row] = await conn.execute(
                "SELECT `id`,`name`,`email` FROM `users` WHERE `id`=?",
                [decoded.id]
            );

            if (row.length > 0) {
                return res.json({
                    user: row[0]
                });
            }

            res.json({
                message: "No user found"
            });
        } 
        else throw{ data:'something went wrong'}
    }
    catch (err) {
        next(err);
    }
}