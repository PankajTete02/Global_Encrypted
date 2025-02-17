// routes/sponsershipRoute.js
const express = require('express');
const router = express.Router();

const collaboratorController = require('../controllers/collaboratorController');
const validateCollaborator = require('../middleware/validationCollaborator');

router.get('/list', collaboratorController.getAllCollaborator);
router.get('/get/:id', collaboratorController.getCollaboratorById);
router.post('/add', validateCollaborator, collaboratorController.createCollaborator);
router.put('/edit/:id', validateCollaborator, collaboratorController.updateCollaborator);
router.delete('/delete/:id', collaboratorController.deleteCollaborator);

module.exports = router;