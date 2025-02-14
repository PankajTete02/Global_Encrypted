const db = require("../../db.config");

const SponsorshipModel = {
  
  // Get All Sponsorships with Pagination, Sorting & Searching
  getAll: (search, sort, order, limit, offset, callback) => {
    let sql = `CALL GetAllSponsorships(?, ?, ?, ?, ?)`;
    db.query(sql, [search, sort, order, limit, offset], (err, results) => {
      if (err) {
        console.error("Error getting sponsorships:", err);
        return callback(err, null);
      }
      return callback(null, results[0]);
    });
  },

  // Get Total Count for Pagination
  getTotalCount: (search, callback) => {
    let sql = `CALL GetSponsorshipTotalCount(?)`;
    db.query(sql, [search], (err, results) => {
      if (err) {
        console.error("Error getting sponsorship total count:", err);
        return callback(err, null);
      }
      return callback(null, results[0]);
    });
  },

  // Get Sponsorship by ID
  getById: (id, callback) => {
    let sql = `CALL GetSponsorshipById(?)`;
    db.query(sql, [id], (err, results) => {
      if (err) {
        console.error("Error getting sponsorship by ID:", err);
        return callback(err, null);
      }
      return callback(null, results[0]);
    });
  },

  // Create a Sponsorship
  create: (data, callback) => {
    let sql = `CALL CreateSponsorship(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [
      data.sponsorship_type,
      data.sponsorship_name,
      data.poc_name,
      data.poc_mobile,
      data.poc_email,
      data.country_id,
      data.country,
      data.state_id,
      data.state,
      data.city_id,
      data.city,
      data.address,
      data.ref_by,
      data.peacekeeper_id,
      data.peacekeeper_other_name,
      data.is_active
    ], (err, results) => {
      if (err) {
        console.error("Error creating sponsorship:", err);
        return callback(err, null);
      }
      return callback(null, results);
    });
  },

  // Update a Sponsorship
  update: (id, data, callback) => {
    let sql = `CALL UpdateSponsorship(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [
      id,
      data.sponsorship_type,
      data.sponsorship_name,
      data.poc_name,
      data.poc_mobile,
      data.poc_email,
      data.country_id,
      data.country,
      data.state_id,
      data.state,
      data.city_id,
      data.city,
      data.address,
      data.ref_by,
      data.peacekeeper_id,
      data.peacekeeper_other_name,
      data.is_active
    ], (err, results) => {
      if (err) {
        console.error("Error updating sponsorship:", err);
        return callback(err, null);
      }
      return callback(null, results);
    });
  },

  // Delete a Sponsorship
  delete: (id, callback) => {
    let sql = `CALL DeleteSponsorship(?)`;
    db.query(sql, [id], (err, results) => {
      if (err) {
        console.error("Error deleting sponsorship:", err);
        return callback(err, null);
      }
      return callback(null, results);
    });
  },
};

module.exports = SponsorshipModel;
