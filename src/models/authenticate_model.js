const db = require('../../db.config'); 


const peacekeeper_login = async (parsedData,req, res) => {
  try {
    console.log("B"); 
    const sql = `CALL USP_GLOBAL_PEACEKEEPER_LOGIN(?)`;
    console.log("C"); 
    // Execute the query
    const [result] = await db.promise().query(sql, [parsedData.email]);
    console.log("D"); 
    // Logging for debugging
    console.log("Login Result:", result);

    console.log(result,"ckec")
    console.log(result[0][0].file_name,"file_name")
    if (result && result[0] && result[0][0]) {
      const protocol = "https";
      result[0][0].file_name = result[0][0].file_name 
          ? `${protocol}://${req.get("host")}/uploads/${result[0][0].file_name}`
          : []; 
          result[0][0].url = result[0][0].url 
          ? `${protocol}://${req.get("host")}/uploads/batch/photo/${result[0][0].coupon_code}.png`
          : [];     
          
  }
    // Return the response
    console.log(result[0][0].file_name,"file_name2")
    return result;

  } catch (error) {
    console.error("Database Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
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