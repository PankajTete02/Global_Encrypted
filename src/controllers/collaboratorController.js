const CollaboratorModel = require('../models/collaboratorModel');
const shortenURL = require("../middleware/tiny_url");
const {generateQRCodeWithImage, generateBadge} = require("../middleware/helper");

// API to get all collaborators
exports.getAllCollaborator = async (req, res) => {
  try {
    let { page, limit, sort, order, search } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 25;
    const offset = (page - 1) * limit;
    sort = sort || 'created_at';
    order = order && order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    search = search || '';

    const countResult = await CollaboratorModel.getTotalCount(search);
    const totalItems = countResult[0].total;

    const results = await CollaboratorModel.getAll(search, sort, order, limit, offset);
    res.json({ totalItems, page, limit, data: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// API to get collaborator by ID
exports.getCollaboratorById = async (req, res) => {
  try {
    const result = await CollaboratorModel.getById(req.params.id);
    if (!result.length) return res.status(404).json({ error: 'Collaborator not found' });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// API to create a collaborator
exports.createCollaborator = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email exists
    const exists = await CollaboratorModel.checkEmailExists(email, null);
    if (exists) return res.status(400).json({ message: "Email already exists." });

    const result = await CollaboratorModel.create(req.body);

    // Generate tiny URL
    const tiny_url = await shortenURL(result.qr_code_url);

    //generate qr
    await generateQRCodeWithImage('',tiny_url);

    //generate batch image
    //generate batch pdf
    //await generateBadge()

    res.status(201).json({ message: 'Collaborator created', tiny_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// API to update a collaborator
exports.updateCollaborator = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if email exists
    const exists = await CollaboratorModel.checkEmailExists(email, req.params.id);
    if (exists) return res.status(400).json({ message: "Email already exists." });

    await CollaboratorModel.update(req.params.id, req.body);
    res.json({ message: 'Collaborator updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// API to delete a collaborator
exports.deleteCollaborator = async (req, res) => {
  try {
    await CollaboratorModel.delete(req.params.id);
    res.json({ message: 'Collaborator deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
