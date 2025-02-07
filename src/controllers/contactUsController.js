// controllers/contactUsController.js
const nodemailer = require('nodemailer');
const contactUsModel = require('../models/contactUsModel');
const contactUsController = {
  // Controller for creating a contact
  createContact: (req, res) => {
    const data = req.body;

    contactUsModel.createContact(data, (err, response) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: true,
          message: 'Error creating contact.',
          details: err,
        });
      }

      // Email logic
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        secureConnection: false,
        port: 587,
        auth: {
          user: "Peacekeeper@global-jlp-summit.com",
          pass: "tusi xeoi hxoz fwwb",
        },
      });


      const htmlTemplate = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #4CAF50;">New Contact Submission</h2>
          <p>You have received a new contact submission on Global Justice:</p>
          <table style="border-collapse: collapse; width: 100%; max-width: 600px; margin: 20px 0;">
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;"><strong>Title:</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data.title || 'N/A'}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;"><strong>Email:</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data.email || 'N/A'}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;"><strong>First Name:</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data.firstName || 'N/A'}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;"><strong>Last Name:</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data.lastName || 'N/A'}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;"><strong>Country Code:</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data.countryCode || 'N/A'}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;"><strong>Phone Number:</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data.phoneNumber || 'N/A'}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;"><strong>Question:</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data.yourQuestion || 'N/A'}</td>
            </tr>
          </table>
          <p style="color: #555;">This is an automated email. Please do not reply.</p>
        </div>
      `;

      const mailOptions = {
        from: 'Peacekeeper@global-jlp-summit.com', // Sender
        to: 'maneeshy440@gmail.com', // Receiver
        subject: 'New Contact Submission',
        html: htmlTemplate, 
      };

      transporter.sendMail(mailOptions, (emailErr, emailInfo) => {
        if (emailErr) {
          console.error('Error sending email:', emailErr.message);
          return res.status(500).json({
            success: true,
            error: true,
            message: 'Contact created but email sending failed.',
            emailError: emailErr,
          });
        }

        return res.status(201).json({
          success: true,
          error: false,
          message: 'Contact created successfully, email sent.',
          data: response,
          emailInfo,
        });
      });
    });
  },


  // Controller for fetching all invited speakers
  getAllInviteSpeakers: (req, res) => {
    contactUsModel.getAllInviteSpeakers((err, data) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: true,
          message: 'Error fetching invite speaker list.',
          details: err
        });
      }
      return res.status(200).json({
        success: true,
        error: false,
        message: 'Details fetched successfully.',
        data: data
      });
    });
  },
};

module.exports = contactUsController;
