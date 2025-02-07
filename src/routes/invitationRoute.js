const express = require('express');
const detailsController = require('../controllers/contactfileController');
const router = express.Router();
// const { verifyJwt } = require("../Controller/jwtAuth");
const fs = require('fs');

const multer = require('multer');

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // var userDetails = verifyJwt(req);
        const folderPath = `./src/uploads/contacts`;
        if (!fs.existsSync(folderPath)){
            fs.mkdirSync(folderPath,{ recursive: true });

            }
        cb(null, folderPath); // Destination folder for file uploads
    },
    filename: function (req, file, cb) {
        cb(null, Date.now()+'-'+file.originalname); // Use the original filename
    }
});
const upload = multer({ storage: storage });
router.post('/insertContactBulkDataInList', upload.single('contacts'), detailsController.addBulkdetails);
router.post('/getAllContacts', detailsController.getAllContacts);
router.post('/check_list', detailsController.check_list);
router.post('/getAllList', detailsController.getAllList);
router.put('/updateContactBulkDataInList', upload.single('contacts'), detailsController.updateBulkdetails);
router.post('/addMultipleCheckedContactInList', detailsController.addMultipleContactInList); //not used anywhere
router.post('/updateMultipleCheckedContactInList', detailsController.saveContactToList);
router.post('/saveCheckedContactToNewList', detailsController.saveContactToNewList);
router.patch('/deleteContact', detailsController.deleteContact);

module.exports = router;
