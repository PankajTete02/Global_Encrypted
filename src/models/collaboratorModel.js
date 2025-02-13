var db = require("../../db.config");

const CollaboratorModel = {
  getAll: (search, sort, order, limit, offset, callback ) => {
    let sql = `SELECT * FROM tbl_collaborator WHERE full_name LIKE ? ORDER BY ${sort} ${order} LIMIT ? OFFSET ?`;
    db.query(sql, [`%${search}%`, limit, offset], callback);
  },

  getTotalCount: (search, callback) => {
    let sql = `SELECT COUNT(*) AS total FROM tbl_collaborator WHERE full_name LIKE ?`;
    db.query(sql, [`%${search}%`], callback);
  },

  getById: (id, callback) => {
    db.query('SELECT * FROM tbl_collaborator WHERE id = ?', [id], callback);
  },

  create: (data, callback) => {
    db.query('INSERT INTO tbl_collaborator SET ?', data, callback);
  },

  update: (id, data, callback) => {
    db.query('UPDATE tbl_collaborator SET ? WHERE id = ?', [data, id], callback);
  },

  delete: (id, callback) => {
    db.query('DELETE FROM tbl_collaborator WHERE id = ?', [id], callback);
  },
};

module.exports = CollaboratorModel;
