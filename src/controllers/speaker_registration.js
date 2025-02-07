const Speakerdetails = require("../models/speaker_registration");

exports.Speakerdetails = function (req, res) {
  const new_details = new Speakerdetails(req.body);

  //  Check if status is valid
   if (!['0', '1', '2'].includes(new_details.status)) {
    return res.status(400).json({
      success: false,
      error: true,
      message: "Invalid status value. Status must be 0, 1, or 2.",
    });
  }

  Speakerdetails.create(new_details, function (err, details) {
    if (err) {
      console.log(err);
      return res.status(400).json({
        status: false,
        error: true,
        message: "Something went wrong. Please try again.",

      });
    }
    if (details[0][0].response === "fail")
      return res.json({
        success: false,
        error: true,
        message: "This details already exist with this Form!",
      });
    else
      return res.json({
        success: true,
        error: false,
        message: "details added successfully!",
      });
  });
}

exports.findAll = function (req, res) {
  Speakerdetails.findAll(function (err, details) {
    if (err) {
      console.log(err);
      return res.status(400).json({
        status: false,
        error: true,
        message: "Something went wrong. Please try again.",

      });
    }
    if (details[0][0].response === "fail")
      return res.status(200).json({
        success: false,
        error: true,
        message: "details does not exist with this company!",
      });
    else
      return res.json({
        data: details[0],
        success: true,
        error: false,
        message: "details fetched successfully!",
      });
  });
};

exports.findById = function (req, res) {

  Speakerdetails.findById(
    req.params.email_id,
    function (err, Details) {
      if (err) {
        console.log(err);
        return res.status(400).json({
          status: false,
          error: true,
          message: "Something went wrong. Please try again.",

        });
      }
      else
        console.log("avbsbs", Details);
      return res.json({
        data: Details,
        success: true,
        error: false,
        message: "Details fetched successfully!",
      });
    }
  );
};

// exports.delete = function (req, res) {
//   Speakerdetails.delete(req.params.form_id, function (err, role) {
//     if (err) {
//       console.log(err);
//       return res.status(400).json({
//         status: false,
//         error: true,
//         message: "Something went wrong. Please try again.",
//       });
//     } else if (!role || !Array.isArray(role) || role.length === 0 || !role[0][0] || role[0][0].response !== "fail") {
//       return res.status(404).send({
//         success: false,
//         error: true,
//         message: "This Speakerdetails does not exist with this id!",
//       });
//     } else {
//       return res.json({
//         success: true,
//         error: false,
//         message: "Speakerdetails deleted successfully!",
//       });
//     }
//   });
// };


