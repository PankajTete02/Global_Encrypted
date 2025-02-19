const db = require("../../db.config");

const CollaboratorModel = {

  // Get All Collaborators with Pagination, Sorting & Searching
  getAll: async (search, sort, order, limit, offset) => {
    const sql = `CALL GetAllCollaborators(?, ?, ?, ?, ?)`;
    const [results] = await db.promise().query(sql, [search, sort, order, limit, offset]);
    return results[0];
  },

  // Get Total Count for Pagination
  getTotalCount: async (search) => {
    const sql = `CALL GetCollaboratorTotalCount(?)`;
    const [results] = await db.promise().query(sql, [search]);
    return results[0];
  },

  // Get Collaborator by ID
  getById: async (id) => {
    const sql = `CALL GetCollaboratorById(?)`;
    const [results] = await db.promise().query(sql, [id]);
    return results[0];
  },

  // Create a Collaborator
  create: async (data) => {
    const sql = `CALL CreateCollaboratorNew(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [results] = await db.promise().query(sql, [
      data.full_name,
      data.dob,
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
    ]);
    return results;
  },

  // Update a Collaborator
  update: async (id, data) => {
    const sql = `CALL UpdateCollaborator(?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    await db.promise().query(sql, [
      id,
      data.full_name,
      data.dob,
      data.email,
      data.mobile_no,
      data.country_id,
      data.country,
      data.is_active,
      data.logo_image
    ]);
  },

  // Delete a Collaborator
  delete: async (id) => {
    const sql = `CALL DeleteCollaborator(?)`;
    await db.promise().query(sql, [id]);
  },

  // Check if email exists using the stored procedure
  checkEmailExists: async (email, id) => {
    const sql = "CALL CheckEmailExistsCollaborator(?, ?)";
    const [results] = await db.promise().query(sql, [email, id]);
    
    // Ensure result exists
    return results[0]?.[0]?.existsFlag === 1;
  }

};

module.exports = CollaboratorModel;
