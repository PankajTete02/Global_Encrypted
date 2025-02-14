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
    let sql = `CALL CreateCollaborator(?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [
      data.full_name,
      data.dob,            // Ensure dob is included here
      data.email,
      data.mobile_no,
      data.country_id,
      data.country,
      data.is_active,
      data.logo_image
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
};

module.exports = CollaboratorModel;
