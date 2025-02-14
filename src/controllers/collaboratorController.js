const CollaboratorModel = require('../models/collaboratorModel');

// API to get all collaborators
exports.getAllCollaborator = (req, res) => {
  let { page, limit, sort, order, search } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 25;
  const offset = (page - 1) * limit;
  sort = sort || 'id';
  order = order && order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  search = search || '';

  CollaboratorModel.getTotalCount(search, (err, countResult) => {
    if (err) return res.status(500).json({ error: err.message });

    const totalItems = countResult[0].total;

    CollaboratorModel.getAll(search, sort, order, limit, offset, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ totalItems, page, limit, data: results });
    });
  });
};

// API to get collaborator by ID
exports.getCollaboratorById = (req, res) => {
  CollaboratorModel.getById(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!result.length) return res.status(404).json({ error: 'Collaborator not found' });
    res.json(result[0]);
  });
};

// API to create a collaborator
exports.createCollaborator = (req, res) => {
  CollaboratorModel.create(req.body, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Collaborator created', id: result.insertId });
  });
};

// API to update a collaborator
exports.updateCollaborator = (req, res) => {
  CollaboratorModel.update(req.params.id, req.body, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Collaborator updated' });
  });
};

// API to delete a collaborator
exports.deleteCollaborator = (req, res) => {
  CollaboratorModel.delete(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Collaborator deleted' });
  });
};
