var db = require("../../db.config");

const SponsorshipModel = {
  getAll: (search, sort, order, limit, offset, callback ) => {
    let sql = `SELECT * FROM tbl_sponsorships WHERE sponsorship_name LIKE ? ORDER BY ${sort} ${order} LIMIT ? OFFSET ?`;
    db.query(sql, [`%${search}%`, limit, offset], callback);
  },

  getTotalCount: (search, callback) => {
    let sql = `SELECT COUNT(*) AS total FROM tbl_sponsorships WHERE sponsorship_name LIKE ?`;
    db.query(sql, [`%${search}%`], callback);
  },

  getById: (id, callback) => {
    db.query('SELECT * FROM tbl_sponsorships WHERE id = ?', [id], callback);
  },

  create: (data, callback) => {
    db.query('INSERT INTO tbl_sponsorships SET ?', data, callback);
  },

  update: (id, data, callback) => {
    db.query('UPDATE tbl_sponsorships SET ? WHERE id = ?', [data, id], callback);
  },

  delete: (id, callback) => {
    db.query('DELETE FROM tbl_sponsorships WHERE id = ?', [id], callback);
  },
};

module.exports = SponsorshipModel;
