const Tracking = require("../models/tracking_link");

exports.Tracking = function (req, res) {
  const new_details = new Tracking(req.body);

  Tracking.create(new_details, function (err, details) {
    if (err) {
      console.log(err);
      return res.status(400).json({
        status: false,
        error: true,
        message: "Something went wrong. Please try again.",

      });
    }

    console.log("deee ",details);
    if (details[0][0].response === "fail")
      return res.status(400).json({
        success: false,
        error: true,
        message: "This details already exist!",
      });
    else
      return res.json({
        success: true,
        error: false,
        message: "Details Added Successfully!",
      });
  });
}

exports.findAlltracking = function (req, res) {
    Tracking.findAlltracking(function (err, details) {
      if (err) {
        console.log(err);
        return res.status(400).json({
          status: false,
          error: true,
          message: "Something went wrong. Please try again.",
  
        });
      }
      console.log(details);
      if (details[0][0].response === "fail")
        return res.status(200).json({
          success: false,
          error: true,
          message: "details does not exist with this company!",
        });
      else{
        return res.json({
          data: details[0],
          success: true,
          error: false,
       
          message: "details fetched successfully!",
        });}
    });
  };

//   =======================================================================================================


exports.findAllrefrences = function (req, res) {
    Tracking.findAllrefrences(function (err, details) {
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


  // ==============================================================================================

  
exports.findAllform = function (req, res) {
  Tracking.findAllform(function (err, details) {
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


  // ========================================================================================================

  exports.delete = function (req, res) {
    Tracking.delete(req.body.tracking_link_id, function (err, role) {
      // console.log("res",role[0][0]);
      if (err) {
        console.log(err);
        return res.status(400).json({
          status: false,
          error: true,
          message: "Something went wrong. Please try again.",
        });
      }
  
      // else if (role[0][0].response === "fail") {
      //   return res.status(404).send({
      //     success: false,
      //     error: true,
      //     message: "data does not exist with this id!",
      //   });
      // }
      // else {
        return res.json({
          success: true,
          error: false,
          message: "data deleted successfully!",
        });
      }
    );
  };


  // =====================================================================================

  
exports.findBySearch_Tracking_user = function (req, res) {
  console.log('.................', req.body);
  Tracking.findBySearch_Tracking_user(req.body, function (err, data) {
    if (err) {
      res.send(err);
    } else {
      if (data && data.length > 0) {
        res.json({ message: "Data exists", data: data });
      } else {
        res.json({ message: "Data does not exist" });
      }
    }
  });
};

  