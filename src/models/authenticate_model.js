const { json } = require('express');
const db = require('../../db.config'); 
const { decrypt, encrypt } = require('../middleware/auth');
const CryptoJS = require("crypto-js");
const { error } = require('pdf-lib');
const e = require('express');


// const peacekeeper_login = async (parsedData, req, res) => {
//   try {
//     if (parsedData.loginVia == 1) {
//       const pwdSql = `CALL USP_GLOBAL_GET_PWD(?)`;
//       const [pwdResult] = await db.promise().query(pwdSql, [parsedData.email]);
//         // console.log(pwdResult ,"pwdResult");   
        
        
//       if (pwdResult && pwdResult.length > 0 && pwdResult[0].length > 0) {
//         const userPwdData = pwdResult[0][0];
//         console.log(pwdResult[0][0].is_pwd_generated,"userPwdData");
//         if (userPwdData.is_pwd_generated === -1) {
//           return res.status(404).json({
//             success: false,
//             error: true,
//             message: "Email not found",
//           });
//         }
       
        
//         if (pwdResult[0][0].is_pwd_generated == 1) {
//           console.log(userPwdData.pv_password);
//           const encryptedPassword = userPwdData.pv_password; // Ensure correct column name
          
//           async function decrypt(encryptedText) {
//             return CryptoJS.AES.decrypt(encryptedText, process.env.ENCRYPTION_KEY)
//               .toString(CryptoJS.enc.Utf8);
//           }

//           const decryptedPassword = await decrypt(encryptedPassword);
//           // console.log(decryptedPassword,"userPwdData.pv_password");
//           const decryptedPwd = decryptedPassword.replace(/"/g, "");
//           console.log(decryptedPwd,"decryptedPwd");
//           console.log(parsedData.password,"decryptedPwd");

                    
//           if (decryptedPwd === parsedData.password) {

//             const sql = `CALL USP_GLOBAL_PEACEKEEPER_LOGIN(?)`;
//             const [result] = await db.promise().query(sql, [parsedData.email]);

//             if (result && result[0] && result[0][0]) {
//               const protocol = "https";
//               result[0][0].file_name = result[0][0].file_name
//                 ? `${protocol}://${req.get("host")}/uploads/${result[0][0].file_name}`
//                 : null;
//               result[0][0].url = result[0][0].url
//                 ? `${protocol}://${req.get("host")}/uploads/batch/photo/${result[0][0].coupon_code}.png`
//                 : null;
//             }

//             console.log("Login successful!1");
//             return res.status(200).json({ success: true, data: result[0][0] });
//           }else{
//             return res.status(401).json({ 
//               success: false, 
//               error:true,
//               message: "Invalid Password"
//              });
//           }
//         }else{
//           return res.status(401).json({ 
//             success: false, 
//             error:true,
//             message: "Password not generated please generate password",
//             is_pwd_generated: 0
//            });
//         }
//       }
//     } else {
//       const checkLoginSql = `CALL usp_peace_login(?,?,?,?,?,?)`;
//       const [check] = await db.promise().query(checkLoginSql, [
//         parsedData.email,
//         parsedData.password || null,
//         parsedData.device_id,
//         parsedData.os_type,
//         parsedData.loginVia,
//         parsedData.otp,
//       ]);
//         console.log(check,"checkk");
        
//         console.log(check[0][0].status,"checkcheck");
  

//       if (check[0][0].status === 1) {
//         return res.status(401).json({
//           success: false,
//           error: true,
//           message: check[0][0].result,
//         });
//       } else {
//         const sql = `CALL USP_GLOBAL_PEACEKEEPER_LOGIN(?)`;
//         const [result] = await db.promise().query(sql, [parsedData.email]);

//         if (result && result[0] && result[0][0]) {
//           const protocol = "https";
//           result[0][0].file_name = result[0][0].file_name
//             ? `${protocol}://${req.get("host")}/uploads/${result[0][0].file_name}`
//             : null;
//           result[0][0].url = result[0][0].url
//             ? `${protocol}://${req.get("host")}/uploads/batch/photo/${result[0][0].coupon_code}.png`
//             : null;
//         }

//         console.log("Login successful!2");
//         return res.status(200).json({ success: true, data: result[0][0] });
//       }
//     }
//   } catch (error) {
//     console.error("Database Error:", error);
//     return res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

const peacekeeper_login = async (parsedData) => {
  try {
    if (parsedData.loginVia == 1) {
      const pwdSql = `CALL USP_GLOBAL_GET_PWD(?)`;
      const [pwdResult] = await db.promise().query(pwdSql, [parsedData.email]);

      if (pwdResult?.[0]?.length > 0) {
        const userPwdData = pwdResult[0][0];
        console.log(userPwdData,"userPwdData")
        if (userPwdData.is_pwd_generated === -1) {
          return { success: false, error: true, message: "Email not found" };
        }
        if (userPwdData.is_pwd_generated == 1 ) {
          const encryptedPassword = userPwdData.pv_password;

          const decryptedPassword = CryptoJS.AES.decrypt(encryptedPassword, process.env.ENCRYPTION_KEY)
            .toString(CryptoJS.enc.Utf8)
            .replace(/"/g, "");

          if (decryptedPassword === parsedData.password) {
            const sql = `CALL USP_GLOBAL_PEACEKEEPER_LOGIN(?)`;
            const [result] = await db.promise().query(sql, [parsedData.email]);

            if (result?.[0]?.[0]) {
              return { success: true, data: result[0][0] };
            }
            return { success: false, error: true, message: "Login failed" };
          }
          return { success: false, error: true, message: "Invalid Password" };
        }
        return { success: false, error: true, message: "Password not generated please generate password", is_pwd_generated: 0 };
      }
      return { success: false, error: true, message: "User not found" };
    } else {
      const checkLoginSql = `CALL usp_peace_login(?,?,?,?,?,?)`;
      // console.log(checkLoginSql);
      
      const [check] = await db.promise().query(checkLoginSql, [
        parsedData.email,
        parsedData.password || null,
        parsedData.device_id,
        parsedData.os_type,
        parsedData.loginVia,
        parsedData.otp,
      ]);

      console.log(check[0],"checkcheck");
      console.log(check[0][0].status,"checkcheck");

      const loginResponse = check[0][0];

      console.log(loginResponse, "checkcheck");

      if (loginResponse.status === -1) {
        return { success: false, error: true, message: loginResponse.result };
      }

      if (loginResponse.status === 1) {
        return { success: false, error: true, message: loginResponse.result };
      }

      const sql = `CALL USP_GLOBAL_PEACEKEEPER_LOGIN(?)`;
      const [result] = await db.promise().query(sql, [parsedData.email]);

      if (result?.[0]?.[0]) {
        return { success: true, data: result[0][0] };
      }
      return { success: false, error: true, message: "Login failed" };
    }
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: true, message: "Internal Server Error" };
  }
};



const download_badge = async (req, res) => {
  try {
    console.log("B"); 
    const sql = `CALL USP_DOWNLOAD_BADGE(?)`;
    console.log(req.params.email,"email");
    const [result] = await db.promise().query(sql, [req.params.email]);
    console.log("Login Result:", result);

    console.log(result,"ckec")
    // Return the response
    return result;

  } catch (error) {
    console.error("Database Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const edit_peacekeeper_details =async(parsedData,req,res)=>{
  try {
    const file_name = req.file ? req.file.filename : null;
    const file_path = req.file ? req.file.filename : null; 
    const file_type = req.file ? req.file.mimetype : null; 
    console.log("B"); 
    const sql = `CALL USP_GLOBAL_UPDATE_PEACE_KEEPER_DETAILS(?,?,?,?,?,?,?)`;
    // console.log(req.params.email,"email");
    const [result] = await db.promise().query(sql, 
      [
        parsedData.id,
        parsedData.full_name,
        parsedData.mobile_number,
        parsedData.dob,
        file_name || null,
        file_path || null,
        file_type || null
      ]);
    console.log("Login Result:", result);

    console.log(result,"ckec")
    // Return the response
    return result;

  } catch (error) {
    console.error("Database Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const peacekeeper_details_id =async(req,res)=>{
  try {
    console.log("B"); 
    const sql = `CALL USP_GLOBAL_GET_PEACEKEEPER_DETAILS_BY_ID(?)`;
    console.log(req.body.peace_id,"email");
    const [result] = await db.promise().query(sql, 
      [
        req.body.peace_id,
       
      ]);
    console.log("Login Result:", result);

    console.log(result,"ckec")
    // Return the response
    return result;

  } catch (error) {
    console.error("Database Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const get_delegate_by_reference =async(req,res)=>{
  try {
    console.log("B"); 
    const sql = `CALL USP_GLOBAL_GET_ALL_DELEGATE_BY_COUPON_CODE(?,?)`;
    const [result] = await db.promise().query(sql, 
      [
        req.body.reference_code,
        req.body.p_limit
       
      ]);
    console.log("Login Result:", result);

    console.log(result,"ckec")
    // Return the response
    return result;

  } catch (error) {
    console.error("Database Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
module.exports={
    peacekeeper_login,
    download_badge,
    edit_peacekeeper_details,
    peacekeeper_details_id,
    get_delegate_by_reference
}