const { json } = require('express');
const db = require('../../db.config'); 
const { decrypt, encrypt } = require('../middleware/auth');
const CryptoJS = require("crypto-js");
const { error } = require('pdf-lib');
const e = require('express');



// const peacekeeper_login = async (parsedData, req) => {
//   try {
//     if (parsedData.loginVia == 1) {
//       const pwdSql = `CALL USP_GLOBAL_GET_PWD(?)`;
//       const [pwdResult] = await db.promise().query(pwdSql, [parsedData.email]);
//         console.log(pwdResult,"pwww");
        
//       // if (!pwdResult?.[0]?.length) {
//       //   return { success: false, error: true, message: "User does not exist1" };
//       // }

//       const userPwdData = pwdResult[0][0];
//       console.log("User password data:", userPwdData);

//       if (userPwdData.is_pwd_generated === -1) {
//         const checkLoginSql = `CALL usp_peace_login(?,?,?,?,?,?)`;
//       const [check] = await db.promise().query(checkLoginSql, [
//         parsedData.email,
//         parsedData.password || null,
//         parsedData.device_id,
//         parsedData.os_type,
//         parsedData.loginVia,
//         parsedData.otp,
//       ]);

//       if (!check?.[0]?.[0]) {
//         console.error("Unexpected DB response:", check);
//         return { success: false, error: true, message: "Unexpected response from database" };
//       }

//       const loginResponse = check[0][0];
//       console.log("Login Response:", loginResponse);

//       if (loginResponse.status === -1) {
//         return { success: false, error: true, message: loginResponse.message || "Incorrect email, please enter the correct one" };
//       }

//       if (loginResponse.status === -2) {
//         return { success: false, error: true, message: loginResponse.message || "User does not exist3" };
//       }

//       if (loginResponse.status === 1) {
//         return { success: false, error: true, message: loginResponse.message || "Invalid OTP or OTP expired" };
//       }

//       const sql = `CALL USP_GLOBAL_PEACEKEEPER_LOGIN(?)`;
//       const [result] = await db.promise().query(sql, [parsedData.email]);

//       if (result?.[0]?.[0]) {
//         const hostUrl = `https://${req.get("host")}`;

//         result[0][0].file_name = result[0][0].file_name
//           ? `${hostUrl}/uploads/${result[0][0].file_name}`
//           : null;
//         result[0][0].url = result[0][0].coupon_code
//           ? `${hostUrl}/uploads/batch/photo/${result[0][0].coupon_code}.png`
//           : null;
//       }
      
//       return { success: true, data: result[0][0] };
//     }
//       }

//       if (userPwdData.is_pwd_generated == 1) {
//         const encryptedPassword = userPwdData.pv_password;
//         let decryptedPassword = "";

//         try {
//           decryptedPassword = CryptoJS.AES.decrypt(encryptedPassword, process.env.ENCRYPTION_KEY)
//             .toString(CryptoJS.enc.Utf8)
//             .replace(/"/g, "");
//         } catch (decryptError) {
//           console.error("Password decryption failed:", decryptError);
//           return { success: false, error: true, message: "Error processing password" };
//         }

//         if (decryptedPassword === parsedData.password) {
//           const sql = `CALL USP_GLOBAL_PEACEKEEPER_LOGIN(?)`;
//           const [result] = await db.promise().query(sql, [parsedData.email]);

//           if (result?.[0]?.[0]) {
//             const hostUrl = `https://${req.get("host")}`;

//             result[0][0].file_name = result[0][0].file_name
//               ? `${hostUrl}/uploads/${result[0][0].file_name}`
//               : null;
//             result[0][0].url = result[0][0].coupon_code
//               ? `${hostUrl}/uploads/batch/photo/${result[0][0].coupon_code}.png`
//               : null;

//             console.log("Login successful!");
//             return { success: true, data: result[0][0] };
//           }
//         }
//         return { success: false, error: true, message: "Invalid Password" };
//       }
//       return {
//         success: false,
//         error: true,
//         message: "Password not generated. Please generate a password.",
//         is_pwd_generated: 0
//       };
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

//       if (!check?.[0]?.[0]) {
//         console.error("Unexpected DB response:", check);
//         return { success: false, error: true, message: "Unexpected response from database" };
//       }

//       const loginResponse = check[0][0];
//       console.log("Login Response:", loginResponse);

//       if (loginResponse.status === -1) {
//         return { success: false, error: true, message: loginResponse.message || "Incorrect email, please enter the correct one" };
//       }

//       if (loginResponse.status === -2) {
//         return { success: false, error: true, message: loginResponse.message || "User does not exist3" };
//       }

//       if (loginResponse.status === 1) {
//         return { success: false, error: true, message: loginResponse.message || "Invalid OTP or OTP expired" };
//       }

//       const sql = `CALL USP_GLOBAL_PEACEKEEPER_LOGIN(?)`;
//       const [result] = await db.promise().query(sql, [parsedData.email]);

//       if (result?.[0]?.[0]) {
//         const hostUrl = `https://${req.get("host")}`;

//         result[0][0].file_name = result[0][0].file_name
//           ? `${hostUrl}/uploads/${result[0][0].file_name}`
//           : null;
//         result[0][0].url = result[0][0].coupon_code
//           ? `${hostUrl}/uploads/batch/photo/${result[0][0].coupon_code}.png`
//           : null;
//       }
      
//       return { success: true, data: result[0][0] };
//     }
//   } catch (error) {
//     console.error("Database Error:", error);
//     return { success: false, error: true, message: "Internal Server Error" };
//   }
// };

const peacekeeper_login = async (parsedData, req) => {
  try {
    if (parsedData.loginVia == 1) {
      const pwdSql = `CALL USP_GLOBAL_GET_PWD(?)`;
      const [pwdResult] = await db.promise().query(pwdSql, [parsedData.email]);
      console.log(pwdResult, "pwww");

      // if (!pwdResult?.[0]?.length) {
      //   return { success: false, error: true, message: "User does not exist1" };
      // }

      const userPwdData = pwdResult[0][0];
      console.log("User password data:", userPwdData);

      if (userPwdData.is_pwd_generated === -1) {
        const checkLoginSql = `CALL usp_peace_login(?,?,?,?,?,?)`;
        const [check] = await db.promise().query(checkLoginSql, [
          parsedData.email,
          parsedData.password || null,
          parsedData.device_id,
          parsedData.os_type,
          parsedData.loginVia,
          parsedData.otp,
        ]);

        if (!check?.[0]?.[0]) {
          console.error("Unexpected DB response:", check);
          return { success: false, error: true, message: "Unexpected response from database" };
        }

        const loginResponse = check[0][0];
        console.log("Login Response:", loginResponse);

        if (loginResponse.status === -1) {
          return { success: false, error: true, message: loginResponse.message || "Incorrect email, please enter the correct one" };
        }

        if (loginResponse.status === -2) {
          return { success: false, error: true, message: loginResponse.message  };
        }

        if (loginResponse.status === 1) {
          return { success: false, error: true, message: loginResponse.message || "Invalid OTP or OTP expired" };
        }

        const sql = `CALL USP_GLOBAL_PEACEKEEPER_LOGIN(?)`;
        const [result] = await db.promise().query(sql, [parsedData.email]);

        if (result?.[0]?.[0]) {
          const hostUrl = `https://${req.get("host")}`;

          result[0][0].file_name = result[0][0].file_name
            ? `${hostUrl}/uploads/${result[0][0].file_name}`
            : null;
          result[0][0].url = result[0][0].coupon_code
            ? `${hostUrl}/uploads/batch/photo/${result[0][0].coupon_code}.png`
            : null;
        }

        return { success: true, data: result[0][0] };
      } else if (userPwdData.is_pwd_generated == 1) {
        const encryptedPassword = userPwdData.pv_password;
        let decryptedPassword = "";

        try {
          decryptedPassword = CryptoJS.AES.decrypt(encryptedPassword, process.env.ENCRYPTION_KEY)
            .toString(CryptoJS.enc.Utf8)
            .replace(/"/g, "");
        } catch (decryptError) {
          console.error("Password decryption failed:", decryptError);
          return { success: false, error: true, message: "Error processing password" };
        }

        if (decryptedPassword === parsedData.password) {
          const sql = `CALL USP_GLOBAL_PEACEKEEPER_LOGIN(?)`;
          const [result] = await db.promise().query(sql, [parsedData.email]);

          if (result?.[0]?.[0]) {
            const hostUrl = `https://${req.get("host")}`;

            result[0][0].file_name = result[0][0].file_name
              ? `${hostUrl}/uploads/${result[0][0].file_name}`
              : null;
            result[0][0].url = result[0][0].coupon_code
              ? `${hostUrl}/uploads/batch/photo/${result[0][0].coupon_code}.png`
              : null;

            console.log("Login successful!");
            return { success: true, data: result[0][0] };
          }
        }
        return { success: false, error: true, message: "Invalid Password" };
      } else {
        return {
          success: false,
          error: true,
          message: "Password not generated. Please generate a password.",
          is_pwd_generated: 0
        };
      }
    } else {
      const checkLoginSql = `CALL usp_peace_login(?,?,?,?,?,?)`;
      const [check] = await db.promise().query(checkLoginSql, [
        parsedData.email,
        parsedData.password || null,
        parsedData.device_id,
        parsedData.os_type,
        parsedData.loginVia,
        parsedData.otp,
      ]);
      console.log(check,"")
      if (!check?.[0]?.[0]) {
        console.error("Unexpected DB response:", check);
        return { success: false, error: true, message: "Unexpected response from database" };
      }

      const loginResponse = check[0][0];
      console.log("Login Response:", loginResponse);

      if (loginResponse.status === -1) {
        return { success: false, error: true, message: loginResponse.message || "Incorrect email, please enter the correct one" };
      }

      if (loginResponse.status === -2) {
        return { success: false, error: true, message: loginResponse.message || "User does not exist3" };
      }

      if (loginResponse.status === 1) {
        return { success: false, error: true, message: loginResponse.message || "Invalid OTP or OTP expired" };
      }

      const sql = `CALL USP_GLOBAL_PEACEKEEPER_LOGIN(?)`;
      const [result] = await db.promise().query(sql, [parsedData.email]);

      if (result?.[0]?.[0]) {
        const hostUrl = `https://${req.get("host")}`;

        result[0][0].file_name = result[0][0].file_name
          ? `${hostUrl}/uploads/${result[0][0].file_name}`
          : null;
        result[0][0].url = result[0][0].coupon_code
          ? `${hostUrl}/uploads/batch/photo/${result[0][0].coupon_code}.png`
          : null;
      }

      return { success: true, data: result[0][0] };
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