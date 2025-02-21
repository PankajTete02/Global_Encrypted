const CollaboratorModel = require('../models/collaboratorModel');
const {generateQRCodeWithImage, generateBadge, ensureDirectoryExists} = require("../middleware/helper");
const path = require("path");

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
    if (await CollaboratorModel.checkEmailExists(email, null)) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const result = await CollaboratorModel.create(req.body);

    // Build required paths.
    const qr_code_url = result.qr_code_url;
    const qr_unique_code = result.qr_unique_code;
    const base_image_path = path.join(__dirname, "../uploads/collaborator/base/collaborator_card.png");
    const destination_path_img = path.join(__dirname, "../uploads/collaborator/batch/image");
    const destination_path_pdf = path.join(__dirname, "../uploads/collaborator/batch/pdf");

    // Ensure necessary directories exist.
    [
      path.join(__dirname, "../uploads/collaborator/qr"),
      path.join(__dirname, "../uploads/collaborator/base"),
      destination_path_img,
      destination_path_pdf
    ].forEach(ensureDirectoryExists);

    // Send response immediately.
    res.status(201).json({ message: 'Collaborator created', tiny_url: qr_code_url });

    // Run background tasks after sending the response.
    setImmediate(async () => {
      try {
        // Build the QR code path.
        const qrCodePath = path.join(__dirname, "../uploads/collaborator/qr/", `${qr_unique_code}.png`);
        console.log("Background task started for create collaborator.");

        // Generate QR code image first.
        await generateQRCodeWithImage(qrCodePath, qr_code_url);
        // Generate the badge.
        await generateBadge({
          baseImagePath: base_image_path,
          response: result,
          qrCodePath,
          destFolderImg: destination_path_img,
          destFolderPdf: destination_path_pdf
        });
        console.log("Background task completed for create collaborator.");
      } catch (err) {
        console.error("Error in background task for create collaborator:", err);
        // Optionally log error details or notify an error monitoring system.
      }
    });
  } catch (err) {
    console.error("Create Collaborator Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// API to update a collaborator
exports.updateCollaborator = async (req, res) => {
  try {
    const { email } = req.body;
    // Check if the email exists for a different collaborator.
    const exists = await CollaboratorModel.checkEmailExists(email, req.params.id);
    if (exists) return res.status(400).json({ message: "Email already exists." });

    const result = await CollaboratorModel.update(req.params.id, req.body);

    // Send response immediately.
    res.json({ message: 'Collaborator updated', tiny_url: result.qr_code_url });

    // Only run background task if badge generation is required.
    if (!req.body.is_updated_by_activated) {
      setImmediate(async () => {
        try {
          const base_image_path = path.join(__dirname, "../uploads/collaborator/base/collaborator_card.png");
          const destination_path_img = path.join(__dirname, "../uploads/collaborator/batch/image");
          const destination_path_pdf = path.join(__dirname, "../uploads/collaborator/batch/pdf");

          // Ensure necessary directories exist.
          [
            path.join(__dirname, "../uploads/collaborator/base"),
            destination_path_img,
            destination_path_pdf
          ].forEach(ensureDirectoryExists);

          // Build the QR code path.
          const qrCodePath = path.join(__dirname, "../uploads/collaborator/qr/", `${result.qr_unique_code}.png`);
          console.log("Background task started for update collaborator.");

          // For update, we assume the QR code already exists.
          await generateBadge({
            baseImagePath: base_image_path,
            response: result,
            qrCodePath,
            destFolderImg: destination_path_img,
            destFolderPdf: destination_path_pdf
          });
          console.log("Background task completed for update collaborator.");
        } catch (err) {
          console.error("Error in background task for update collaborator:", err);
          // Optionally log error details or notify an error monitoring system.
        }
      });
    }
  } catch (err) {
    console.error("Update Collaborator Error:", err);
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
