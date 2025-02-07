const jwt = require("jsonwebtoken");
require("dotenv").config();
const CryptoJS = require("crypto-js");

const config = process.env;

// const VerifyToken = (req, res, next) => {
 async function VerifyToken(req, res, next) {
  console.log('process.env.SECRET_KEY', process.env.SECRET_KEY);
  let token = req.headers.authorization;
  console.log('req verifyToken', token);
  console.log("AS");
  let data = {};
  if (!token) {
    console.log("ASZ");
     return res.status(401).send({ auth: false, message: 'No token provided.' });
    //data = { auth: false, message: 'No token provided.', success: false }
  }
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    console.log("ASVV");
    token = req.headers.authorization.split(' ')[1];
  }
  try {
    console.log("ASXXCC", token);

    // Verify the token using the secret key
    const UsersTo = await jwt.verify(token, process.env.SECRET_KEY);
    console.log('UsersTo.........', UsersTo);

    // Check if the token contains a valid user_id
    if (UsersTo?.user_id) {
      // Check token expiration
      if (UsersTo.exp < Date.now() / 1000) {
        console.log('Token has expired');
        return res.status(401).json({
          message: "Token has expired",
          userID: UsersTo?.user_id,
          success: false,
        });
      } else {
        console.log('Token is valid');
        return {
          message: "Token is valid",
          userID: UsersTo?.user_id,
          success: true,
      };
      }
    } else {
      
      return res.status(401).json({
        message: "Invalid token payload",
        success: false,
      });
    }
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
     
      return res.status(400).json({
        message: "Token has expired",
        expiredAt: err.expiredAt,
        success: false,
      });
    } else {
     
      return {
        message: "Error during token verification",
        error: err.message,
        success: false,
      };
    }
  }
};


async function encrypt(jsonObject) {
  return CryptoJS.AES.encrypt(JSON.stringify(jsonObject),process.env.ENCRYPTION_KEY).toString();
}

async function decrypt(encryptedData) {
  const bytes = CryptoJS.AES.decrypt(encryptedData,process.env.ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
}

module.exports = {VerifyToken,encrypt,decrypt};