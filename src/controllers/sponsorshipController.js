const SponsorshipModel = require('../models/sponsorshipModel');
const validateCollaborator = require("../middleware/validation");
const { checkEmailExists } = require("../models/collaboratorModel");

exports.getAllSponsorships = (req, res) => {
  let { page, limit, sort, order, search } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 25;
  const offset = (page - 1) * limit;
  sort = sort || 'created_at';
  order = order && order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  search = search || '';

  SponsorshipModel.getTotalCount(search, (err, countResult) => {
    if (err) return res.status(500).json({ error: err.message });

    const totalItems = countResult[0].total;
    
    SponsorshipModel.getAll(search, sort, order, limit, offset, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ totalItems, page, limit, data: results });
    });
  });
};

exports.getSponsorshipById = (req, res) => {
  SponsorshipModel.getById(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!result.length) return res.status(404).json({ error: 'Sponsorship not found' });
    res.json(result[0]);
  });
};

exports.createSponsorship = (req, res) => {
  const { email } = req.body;

  checkEmailExists(email,null, (err, exists) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (exists) {
      return res.status(400).json({ message: "Email already exists." });
    }

    SponsorshipModel.create(req.body, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Sponsorship created'});
    });

  });
  
};

exports.updateSponsorship = (req, res) => {
  const { email } = req.body;

  // Check if email exists before validation
  checkEmailExists(email, req.params.id, (err, exists) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (exists) {
      return res.status(400).json({ message: "Email already exists." });
    }
    
    SponsorshipModel.update(req.params.id, req.body, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Sponsorship updated'});
    });
  });

};

exports.deleteSponsorship = (req, res) => {
  SponsorshipModel.delete(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Sponsorship deleted' });
  });
};
