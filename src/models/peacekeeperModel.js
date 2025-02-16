const db = require('../../db.config');  // Assuming you have a database configuration file

const insertPeacekeeper = (peacekeeperData, callback) => {
    const { full_name, country, email_id, dob, mobile_number, country_code, file_name, file_path, file_type, Check_email,url, is_active } = peacekeeperData;
    
    const query = `
        CALL SP_INSERT_PEACEKEEPER_MM(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
    `;

    db.query(query, [full_name, country, email_id, dob, mobile_number, country_code, file_name, file_path, file_type, Check_email, url,is_active], (err, results) => {
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


  // const getAllPeacekeepers = (req, auth, callback) => {
  //   console.log("Callback type:", typeof callback);
  //   const { page_no, page_size, name, email, sort_column, sort_order } = req.body;
  
  //   const sql = `CALL USP_GetAllPeacekeeperData(?,?,?,?,?,?,?);`;
  
  //   db.query(
  //     sql,
  //     [
  //       page_no,
  //       page_size,
  //       auth.user_id,
  //       name || null,
  //       email || null,
  //       sort_column , 
  //       sort_order || "ASC",
  //     ],
  //     (err, results) => {
  //       if (err) {
  //         console.error("Database Error:", err);
  //         return callback(err, null);
  //       }
  //       console.log("Results:", results[1]);
        
  //       const Data = results && results[1] && results[0] ? results[0] : [];
  //       const totalCount = results && results[1] && results[1][0] ? results[1][0].total_count : 0;
  //       let finalData = {
  //         Data,
  //         totalCount: totalCount
  //         };
  //       return callback(null, finalData );
  //     }
  //   );
  // };
  
  const getAllPeacekeepers = (req, auth, callback) => {
    console.log("Callback type:", typeof callback);
    console.log( auth.user_id," auth.user_id,");
    
    const { page_no, page_size, search, sort_column, sort_order } = req.body;

    const sql = `CALL USP_GetAllPeacekeeperData(?,?,?,?,?,?);`;

    db.query(
        sql,
        [
            page_no || 1,             // Default page_no to 1
            page_size || 10,          // Default page_size to 10
            auth.user_id,             // Admin ID
            search  ,          // Global search input
            sort_column , // Default sorting column
            sort_order     // Default sorting order
        ],
        (err, results) => {
            if (err) {
                console.error("Database Error:", err);
                return callback(err, null);
            }
            
            console.log("Results:", results);

            const Data = results && results[0] ? results[0] : [];
            const totalCount = results && results[1] && results[1][0] ? results[1][0].total_count : 0;

            let finalData = {
                Data,
                totalCount
            };
            return callback(null, finalData);
        }
    );
};



const getAllContactUs = (page_no, page_size, search, sort_column, sort_order, callback) => {
  const sql = `CALL USP_GetAllContactUsData(?, ?, ?, ?, ?);`;  // Correct parameter count

  db.query(sql, [page_no, page_size, search, sort_column, sort_order], (err, results) => {
    if (err) {
      return callback(err, null);
    }

    return callback(null, results);
  });
};

const getAllEmaildetails = (req,callback) => {
  const sql = `CALL SP_MICRO_GET_DETAILS_VOLUNTER_BY_ID(?);`;  // Calling the stored procedure to get all peacekeeper data
   console.log(req.body.id,"id");
  db.query(sql,[req.body.id], (err, results) => {
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
const inserting_transcation_details = (session) => {
   const random=generateCouponCode(10);
   console.log(random,"random");
  return new Promise((resolve, reject) => {
    const query = 'CALL USP_INSERT_TRANSCATION_DETAILS(?,?,?,?,?,?)';
    db.query(query, 
    [
      session.customer_email,
      session.payment_intent,
      session.payment_status,
      random,
      `https://api.justice-love-peace.com/uploads/ticket/photo/${random}.png`,
      "hall address"
    ], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results[0]); // Assuming the first result contains the data
      }
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
  inserting_transcation_details,sessionPeacekeeperData,discountPeacekeeperData,deletePeacekeeperData,insertPeacekeeper,getPeacekeeperData,getAllPeacekeepers,getAllContactUs,updatePeacekeeper,getAllEmaildetails,getAllPeacekeepersdropdown
};
