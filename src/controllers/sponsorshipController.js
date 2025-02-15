const SponsorshipModel = require('../models/sponsorshipModel');

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

exports.createSponsorship = async (req, res) => {
  try {
    const qrUniqueCode = generateQRCodeUniqueCode();
    const qrImagePath = path.join(__dirname, '../uploads/collaborator_qr', `${qrUniqueCode}.png`);
    const badgeImagePath = path.join(__dirname, '../uploads/collaborator_badge_image', `${qrUniqueCode}_badge.png`);
    const badgePdfPath = path.join(__dirname, '../uploads/collaborator_badge_pdf', `${qrUniqueCode}_badge.pdf`);

    
    const additionalProperties = {
      qr_unique_code : qrUniqueCode,
      qr_code_url : qrImagePath,
      badge_image_url : badgeImagePath,
      badge_pdf_url : badgePdfPath
    };

    const finalReqBodyObj = { ...req.body, ...additionalProperties };

    // Execute background tasks in parallel
    await Promise.all([
      generateQRCodeWithImage(additionalProperties),
      generateBadgeWithImage(additionalProperties),
      generateBadgeWithPdf(additionalProperties)
    ]);

    // After all background tasks complete, proceed to create sponsorship
    SponsorshipModel.create(finalReqBodyObj, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Sponsorship created'});
    });

  }catch (err) {
    // Handle errors from background tasks
    res.status(500).json({ error: 'Error executing background tasks: ' + err.message });
  }
};

exports.updateSponsorship = (req, res) => {
  SponsorshipModel.update(req.params.id, req.body, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Sponsorship updated'});
  });
};

exports.deleteSponsorship = (req, res) => {
  SponsorshipModel.delete(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Sponsorship deleted' });
  });
};

async function generateQRCodeWithImage(req) {
  // Simulate async background task
  return new Promise(resolve => setTimeout(() => resolve('Task 1 completed'), 1000));
}

async function generateBadgeWithImage(req) {
  // Simulate async background task
  return new Promise(resolve => setTimeout(() => resolve('Task 2 completed'), 2000));
}

async function generateBadgeWithPdf(req) {
  // Simulate async background task
  return new Promise(resolve => setTimeout(() => resolve('Task 3 completed'), 1500));
}
