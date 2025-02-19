const db = require("../../db.config");

const SponsorshipModel = {
  getAll: async (search, sort, order, limit, offset) => {
    const sql = `CALL GetAllSponsorships(?, ?, ?, ?, ?)`;
    const [results] = await db.promise().query(sql, [search, sort, order, limit, offset]);
    return results[0];
  },

  getTotalCount: async (search) => {
    const sql = `CALL GetSponsorshipTotalCount(?)`;
    const [results] = await db.promise().query(sql, [search]);
    return results[0];
  },

  getById: async (id) => {
    const sql = `CALL GetSponsorshipById(?)`;
    const [results] = await db.promise().query(sql, [id]);
    return results[0];
  },

  create: async (data) => {
    const sql = `CALL CreateSponsorship(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    await db.promise().query(sql, [
      data.sponsorship_type, data.sponsorship_name, data.poc_name, data.poc_mobile,
      data.poc_email, data.country_id, data.country, data.state_id, data.state,
      data.city_id, data.city, data.address, data.ref_by, data.peacekeeper_id,
      data.peacekeeper_other_name, data.is_active
    ]);
  },

  update: async (id, data) => {
    const sql = `CALL UpdateSponsorship(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    await db.promise().query(sql, [
      id, data.sponsorship_type, data.sponsorship_name, data.poc_name,
      data.poc_mobile, data.poc_email, data.country_id, data.country, data.state_id,
      data.state, data.city_id, data.city, data.address, data.ref_by, data.peacekeeper_id,
      data.peacekeeper_other_name, data.is_active
    ]);
  },

  delete: async (id) => {
    const sql = `CALL DeleteSponsorship(?)`;
    await db.promise().query(sql, [id]);
  },

  checkEmailExists: async (email, id) => {
    const sql = "CALL CheckEmailExistsSponsorship(?, ?)";
    const [results] = await db.promise().query(sql, [email, id]);
    return results[0]?.[0]?.existsFlag === 1;
  }
};

module.exports = SponsorshipModel;
