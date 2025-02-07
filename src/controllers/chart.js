const chart = require("../models/chart");


exports.findpiechartdelegate = function (req, res) {
    chart.findpiechartdelegate(function (err, details) {
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



  exports.findpiechartpartner = function (req, res) {
    chart.findpiechartpartner(function (err, details) {
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


  exports.findpiechartspeaker = function (req, res) {
    chart.findpiechartspeaker(function (err, details) {
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

  // =====================================================================================================

  
  exports.findchart_delegateby_currentDate = function (req, res) {
    chart.findchart_delegateby_currentDate(function (err, details) {
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


  
  exports.findchart_partnerby_currentDate = function (req, res) {
    chart.findchart_partnerby_currentDate(function (err, details) {
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


  
  exports.findchart_speakerby_currentDate = function (req, res) {
    chart.findchart_speakerby_currentDate(function (err, details) {
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

    
  exports.findchart_delegate_refrence_chart = function (req, res) {
    chart.findchart_delegate_refrence_chart(function (err, details) {
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


  exports.findchart_partner_refrence_chart = function (req, res) {
    chart.findchart_partner_refrence_chart(function (err, details) {
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

  exports.findchart_speaker_refrence_chart = function (req, res) {
    chart.findchart_speaker_refrence_chart(function (err, details) {
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
