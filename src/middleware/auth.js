const jwt = require("jsonwebtoken");
require("dotenv").config();
const CryptoJS = require("crypto-js");
const { error } = require("pdf-lib");

const config = process.env;


async function VerifyToken(req, res, next) {

  let token = req.headers.authorization;
  let data = {};
  if (!token) {
    console.log("ASZ");
    return res.status(401).send({
      message: "Token not provided",
      error:true,
      success: false,
      });
  }
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    token = await decrypt(req.headers.authorization.split(' ')[1]);
    console.log("main", token)
  }
  const token1 = `${token}`;
  console.log(`${token1}`, "token12");
  const token2 = token1.replace(/^"|"$/g, '');
  console.log("updated", token2);
  try {
    UsersTo = jwt.verify(token2, process.env.SECRET_KEY);
    console.log("Verified User:", UsersTo);
    console.log(UsersTo, "ZZZZZZ");
    
    // Add 200 success response
    res.status(200).json({
      message: "Token verified successfully",
      error: false,
      success: true,
      user: UsersTo
    });
    
    return UsersTo;
  }
  catch (err) {
    console.log(err.expiredAt,"err");
    console.log(err.message,"message");

    if (err.message === "jwt expired") {
      console.log('Token has expired');
      return res.status(401).json({
        message: "Token has expired",
        error:true,
        success: false,
      });
    }
  }

};


async function encrypt(jsonObject) {
  // console.log(jsonObject, "json");
  console.log(process.env.ENCRYPTION_KEY, "process.env.ENCRYPTION_KEY");
  return CryptoJS.AES.encrypt(JSON.stringify(jsonObject), process.env.ENCRYPTION_KEY).toString();
}

async function decrypt(encryptedData) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, process.env.ENCRYPTION_KEY);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
 
    if (!decryptedText) {
      throw new Error("Decryption failed: Invalid UTF-8 output");
    }
    return decryptedText;
  } catch (error) {
    console.error("Decryption Error:", error.message);
    return null; // or throw error depending on your use case
  }
}



module.exports = { VerifyToken, encrypt, decrypt };