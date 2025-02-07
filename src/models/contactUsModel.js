const db = require('../../db.config'); 

const contactUsModel = {
  createContact: (data, callback) => {
    const query = `
      CALL SP_INSERT_CONTACT_US(?, ?, ?, ?, ?, ?, ?);
    `;
    const values = [
      data.title,
      data.email,
      data.firstName,
      data.lastName,
      data.countryCode,
      data.phoneNumber,
      data.yourQuestion,
    ];

    db.query(query, values, (err, results) => {
      if (err) {
        console.error('Database Error:', err.message);
        return callback(err, null);
      }
      // Assuming successful execution, pass the results back
      callback(null, results);
    });
  },

  // Fetch all invited speakers
  getAllInviteSpeakers: (callback) => {
    const query = `CALL SP_GET_ALL_INVITE_SPEAKER_LIST();`;

    db.query(query, (err, results) => {
      if (err) {
        console.error('Database Error:', err.message);
        return callback(err, null);
      }

      // Assuming the results are in the first result set
      callback(null, results[0]);
    });
  },
};


module.exports = contactUsModel;
