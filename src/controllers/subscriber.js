const Subscriber = require("../models/subscriber");

exports.Subscriber = function (req, res) {
  const new_details = new Subscriber(req.body);

  Subscriber.create(new_details, function (err, details) {
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
      return res.json({
        success: false,
        error: true,
        message: "This details already exist in this Form ",
      });
    else
      return res.json({
        success: true,
        error: false,
        message: "Details Added Successfully!",
      });
  });
}


exports.findAll = function (req, res) {
  Subscriber.findAll(function (err, details) {
    if (err) {
      console.log(err);
      return res.status(400).json({
        status: false,
        error: true,
        message: "Something went wrong. Please try again.",

      });
    }
   
    else
      return res.json({
        data: details[0],
        success: true,
        error: false,
        message: "details fetched successfully!",
      });
  });
};


exports.delete = function (req, res) {
  Subscriber.delete(req.body.mail_id, function (err, role) {
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



  
exports.findBySearch_Subscriber = function (req, res) {
  console.log('.................', req.body);
  Subscriber.findBySearch_Subscriber(req.body, function (err, data) {
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