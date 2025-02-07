'user strict';
 
const mysql = require('mysql2');
 
//local mysql db connection
const dbConn = mysql.createConnection({
  // host: "103.12.1.182",
  // user: "Kodiemysql", // USER NAME
  // database: "global_justice", // DATABASE NAME
  // password: "Cylsys@@2",
 
  // host: "103.228.83.115",
  // user: "root", // USER NAME
  // database: "microsite", // DATABASE NAME
  // password: "Cylsys@678",

  
  host: "103.12.1.183",
  user: "globalsql", // USER NAME
  database: "global_justice_db", // DATABASE NAME
  password: "global@tice@2",
});




// const dbConn = mysql.createPool({
//   host: "103.12.1.183",
//   user: "globalsql",
//   database: "global_justice_db",
//   password: "global@tice@2",
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });
dbConn.connect(function(err) {
  if (err) throw err;
  console.log("Database Connected!");
});
module.exports = dbConn;
 

