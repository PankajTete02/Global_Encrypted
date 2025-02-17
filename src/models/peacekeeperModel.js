const db = require('../../db.config');  // Assuming you have a database configuration file
const { shortenURL } = require("../middleware/tiny_url");




const insertPeacekeeper = (peacekeeperData, callback) => {
  const { full_name, country, email_id, dob, mobile_number, country_code, file_name, file_path, file_type, Check_email, url, is_active } = peacekeeperData;

  const query = `
        CALL SP_INSERT_PEACEKEEPER_MM(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
    `;

  db.query(query, [full_name, country, email_id, dob, mobile_number, country_code, file_name, file_path, file_type, Check_email, url, is_active], (err, results) => {
    if (err) {
      console.error("Database error: ", err);
      return callback(err, null);
    }
    callback(null, results[0]);  // results[0] contains the response from the stored procedure
  });
};

const updatePeacekeeper = (req, callback) => {

  const query = `CALL USP_GLOBAL_UPDATE_DISCOUNT_DETAILS_BY_ID(?)`;

  db.query(query, [req.body.peace_id], (err, results) => {
    if (err) {
      console.error("Database error: ", err);
      return callback(err, null);
    }
    callback(null, results[0]);  // results[0] contains the response from the stored procedure
  });
};

const tinyurl = async (req, url, callback) => {
  console.log(url, "url");
  const query = `CALL USP_UPDATE_TINY_URL(?,?)`;
  const tinyurl1 = await shortenURL(url);
  console.log(tinyurl1, "tinyurl");
  db.query(query, [tinyurl1, req.body.peace_id], (err, results) => {
    if (err) {
      console.error("Database error: ", err);
      return callback(err, null);
    }
    callback(null, results[0]);
  });
};

const tinyurl1 = async (req, url) => {
  console.log(req.body.peace_id, "req");
  console.log(url, "url");
  const query = `CALL USP_UPDATE_TINY_URL(?,?)`;
  const result = await db.query(query, [url, req.body.peace_id]);
  console.log(result, "url check");
  return result;
};


const getPeacekeeperData = (peacekeeperId) => {
  return new Promise((resolve, reject) => {
    const query = 'CALL USP_GetPeacekeeperData(?)';
    db.query(query, [peacekeeperId], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results[0]); // Assuming the first result contains the data
      }
    });
  });
};


const getAllPeacekeepers = (req, auth, callback) => {
  console.log("Callback type:", typeof callback);
  const { page_no, page_size, name, email, sort_column, sort_order } = req.body;

  const sql = `CALL USP_GetAllPeacekeeperData(?,?,?,?,?,?,?);`;

  db.query(
    sql,
    [
      page_no,
      page_size,
      auth.user_id,
      name || null,
      email || null,
      sort_column ,
      sort_order || "ASC",
    ],
    (err, results) => {
      if (err) {
        console.error("Database Error:", err);
        return callback(err, null);
      }
      console.log("Results:", results[1]);
     
      const Data = results && results[1] && results[0] ? results[0] : [];
      const totalCount = results && results[1] && results[1][0] ? results[1][0].total_count : 0;
      let finalData = {
        Data,
        totalCount: totalCount
        };
      return callback(null, finalData );
    }
  );
};



const getAllContactUs = (page_no, page_size, name, email, sort_column, sort_order, callback) => {
  const sql = `CALL USP_GetAllContactUsData(?, ?, ?, ?, ?, ?);`;  // Calling the stored procedure

  db.query(sql, [page_no, page_size, name, email, sort_column, sort_order], (err, results) => {
    if (err) {
      return callback(err, null);
    }

    // Return fetched results, assuming the first result set contains the data and the second contains total records
    return callback(null, results);
  });
};

const getAllEmaildetails = (req, callback) => {
  const sql = `CALL SP_MICRO_GET_DETAILS_VOLUNTER_BY_ID(?);`;  // Calling the stored procedure to get all peacekeeper data
  console.log(req.body.id, "id");
  db.query(sql, [req.body.id], (err, results) => {
    if (err) {
      return callback(err, null);
    }

    // Return the fetched results from the procedure
    return callback(null, results[0]); // Assuming the first result set contains the desired data
  });
};


const deletePeacekeeperData = (peacekeeperId) => {
  return new Promise((resolve, reject) => {
    const query = 'CALL USP_DELETE_PEACEKEEPER_DETAILS(?)';
    db.query(query, [peacekeeperId], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results[0]); // Assuming the first result contains the data
      }
    });
  });
};

const discountPeacekeeperData = (peacekeeperId) => {
  return new Promise((resolve, reject) => {
    const query = 'CALL USP_GET_PEACE_KEEPER_DETAILS_new(?)';
    db.query(query, [peacekeeperId], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results[0]); // Assuming the first result contains the data
      }
    });
  });
};

const sessionPeacekeeperData = (peacekeeperId) => {
  return new Promise((resolve, reject) => {
    const query = 'CALL USP_GLOBAL_GET_DETAILS_FOR_SESSION(?)';
    db.query(query, [peacekeeperId], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results[0]); // Assuming the first result contains the data
      }
    });
  });
};
function generateCouponCode(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let couponCode = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    couponCode += characters[randomIndex];
  }

  return couponCode;
}
const inserting_transcation_details = async (req, session) => {

  const query1 = 'CALL USP_NOMINATION_DETAILS_GET_NOMINATION_ID(?)';
  return new Promise((resolve, reject) => {
    db.query(query1, [session.customer_email], (error, results) => {
      if (error) {
        console.log(error,"resultserror");
        return reject(error);
      }
      console.log(results,"results11111111");
      console.log(results[0][0].nominations, "nomination");
      const random = generateCouponCode(10);
      console.log(random, "random");
      const nominationCode = results[0][0].nominations !== null ? `${random}-NOM` : null;
  
      const query = 'CALL USP_INSERT_TRANSCATION_DETAILS(?,?,?,?,?,?,?)';
      const protocol = "https";
  
      db.query(query, [
        session.customer_email,
        session.payment_intent,
        session.payment_status,
        random,
        `${protocol}://${req.get("host")}/uploads/ticket/photo/${random}.png`,
        "hall address",
        nominationCode
      ], (error, results) => {
        if (error) {
          return reject(error);
        } else {
          console.log(results[0], "result");
          resolve(results[0]); // Assuming the first result contains the data
        }
      });
    });
  });
  

};

const getAllPeacekeepersdropdown = (callback) => {
  const sql = `CALL USP_GETALL_PEACEKEEPERS();`;  // Calling the stored procedure to get all peacekeeper data

  db.query(sql, (err, results) => {
    if (err) {
      return callback(err, null);
    }

    // Return the fetched results from the procedure
    return callback(null, results[0]); // Assuming the first result set contains the desired data
  });
};

module.exports = {
  tinyurl1, tinyurl, inserting_transcation_details, sessionPeacekeeperData, discountPeacekeeperData, deletePeacekeeperData, insertPeacekeeper, getPeacekeeperData, getAllPeacekeepers, getAllContactUs, updatePeacekeeper, getAllEmaildetails, getAllPeacekeepersdropdown
};
