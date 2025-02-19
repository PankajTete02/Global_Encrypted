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
    const sql = `CALL CreateCollaborator(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
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
    return results[0][0];
  },

  // Update a Collaborator
  update: async (id, data) => {
    const sql = `CALL UpdateCollaborator(?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [results] = await db.promise().query(sql, [
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
    return results[0][0];
  },

  // Delete a Collaborator
  delete: async (id) => {
    const sql = `CALL DeleteCollaborator(?)`;
    await db.promise().query(sql, [id]);
  },

  checkEmailExists: async (email, id) => {
    try {
        // Initialize the session variable
        await db.promise().execute("SET @emailExists = NULL");

        // Call the stored procedure
        await db.promise().execute("CALL CheckEmailExistsCollaborator(?, ?, @emailExists)", [email, id]);

        // Retrieve the result
        const [results] = await db.promise().execute("SELECT @emailExists AS existsFlag");

        return results[0]?.existsFlag === 1;
    } catch (error) {
        console.error("Error checking email existence:", error);
        return false; // Default to false in case of an error
    }
  }

};

module.exports = CollaboratorModel;
