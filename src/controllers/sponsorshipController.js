const SponsorshipModel = require('../models/sponsorshipModel');
const { checkEmailExists } = require("../models/collaboratorModel");

exports.getAllSponsorships = async (req, res) => {
  try {
    let { page, limit, sort, order, search } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 25;
    const offset = (page - 1) * limit;
    sort = sort || 'created_at';
    order = order && order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    search = search || '';

    const countResult = await SponsorshipModel.getTotalCount(search);
    const totalItems = countResult[0].total;

    const results = await SponsorshipModel.getAll(search, sort, order, limit, offset);
    res.json({ totalItems, page, limit, data: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSponsorshipById = async (req, res) => {
  try {
    const result = await SponsorshipModel.getById(req.params.id);
    if (!result.length) return res.status(404).json({ error: 'Sponsorship not found' });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createSponsorship = async (req, res) => {
  try {
    const { email } = req.body;
    const exists = await checkEmailExists(email, null);
    if (exists) return res.status(400).json({ message: "Email already exists." });

    await SponsorshipModel.create(req.body);
    res.status(201).json({ message: 'Sponsorship created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSponsorship = async (req, res) => {
  try {
    const { email } = req.body;
    const exists = await checkEmailExists(email, req.params.id);
    if (exists) return res.status(400).json({ message: "Email already exists." });

    await SponsorshipModel.update(req.params.id, req.body);
    res.json({ message: 'Sponsorship updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSponsorship = async (req, res) => {
  try {
    await SponsorshipModel.delete(req.params.id);
    res.json({ message: 'Sponsorship deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
