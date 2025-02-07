const { log } = require("handlebars/runtime");
const sales_brochure = require("../models/sales_brochure");

exports.sales_brochure = function (req, res) {
  const new_details = new sales_brochure(req.body);

  sales_brochure.create(new_details, function (err, details) {
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
  sales_brochure.findAll(function (err, details) {
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

// ==================================================================================

  
exports.findBySearch_sales_brochure = function (req, res) {
  console.log('.................', req.body);
  sales_brochure.findBySearch_sales_brochure(req.body, function (err, data) {
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



exports.delete = function (req, res) {
  sales_brochure.delete(req.body.sales_brochure_id, function (err, role) {
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

