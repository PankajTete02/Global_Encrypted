const db = require("../../db.config");

const CollaboratorModel = {

  // Get All Collaborators with Pagination, Sorting & Searching
  getAll: (search, sort, order, limit, offset, callback) => {
    let sql = `CALL GetAllCollaborators(?, ?, ?, ?, ?)`;
    db.query(sql, [search, sort, order, limit, offset], (err, results) => {
      if (err) {
        console.error("Error getting collaborators:", err);
        return callback(err, null);
      }
      return callback(null, results[0]);
    });
  },

  // Get Total Count for Pagination
  getTotalCount: (search, callback) => {
    let sql = `CALL GetCollaboratorTotalCount(?)`;
    db.query(sql, [search], (err, results) => {
      if (err) {
        console.error("Error getting total count:", err);
        return callback(err, null);
      }
      return callback(null, results[0]);
    });
  },

  // Get Collaborator by ID
  getById: (id, callback) => {
    let sql = `CALL GetCollaboratorById(?)`;
    db.query(sql, [id], (err, results) => {
      if (err) {
        console.error("Error getting collaborator by ID:", err);
        return callback(err, null);
      }
      return callback(null, results[0]);
    });
  },

  // Create a Collaborator
  create: (data, callback) => {
    let sql = `CALL CreateCollaboratorNew(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [
      data.full_name,
      data.dob,            // Ensure dob is included here
      data.email,
      data.mobile_no,
      data.country_id,
      data.country,
      data.country_code,
      data.is_active,
      data.logo_image,
      data.domain_url,
      data.peacekeeper_id,
      data.peacekeeper_ref_code
    ], (err, results) => {
      if (err) {
        console.error("Error creating collaborator:", err);
        return callback(err, null);
      }
      return callback(null, results);
    });
  },

  // Update a Collaborator
  update: (id, data, callback) => {
    let sql = `CALL UpdateCollaborator(?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [
      id,
      data.full_name,
      data.dob,
      data.email,
      data.mobile_no,
      data.country_id,
      data.country,
      data.is_active,
      data.logo_image
    ], (err, results) => {
      if (err) {
        console.error("Error updating collaborator:", err);
        return callback(err, null);
      }
      return callback(null, results);
    });
  },

  // Delete a Collaborator
  delete: (id, callback) => {
    let sql = `CALL DeleteCollaborator(?)`;
    db.query(sql, [id], (err, results) => {
      if (err) {
        console.error("Error deleting collaborator:", err);
        return callback(err, null);
      }
      return callback(null, results);
    });
  },

  // Check if email exists using the stored procedure
  checkEmailExists: (email,id,callback) => {
    const sql = "CALL CheckEmailExistsCollaborator(?,?, @existsFlag)";
    
    db.query(sql, [email,id], (err) => {
      if (err) {
        console.error("Error checking email:", err);
        return callback(err, null);
      }
  
      // Retrieve the existsFlag value
      db.query("SELECT @existsFlag AS existsFlag", (err, result) => {
        if (err) {
          console.error("Error retrieving existsFlag:", err);
          return callback(err, null);
        }

        // Return true if email exists, false otherwise
        return callback(null, result[0].existsFlag === 1);
      });
    });
  }

};

module.exports = CollaboratorModel;
