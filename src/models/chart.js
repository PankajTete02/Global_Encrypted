"user strict";
var dbConn = require("../../db.config");

const chart = {};
  
chart.findpiechartdelegate = function ( result) {
    let sql = `call microsite_pie_chart_delegate();`;
    dbConn.query(sql, function (err, res) {
      if (err) {
        result(null, err);
      } else {
        result(null, res);
      }
    });
  };
  
  chart.findpiechartpartner = function ( result) {
    let sql = `call microsite_pie_chart_partner();`;
    dbConn.query(sql, function (err, res) {
      if (err) {
        result(null, err);
      } else {
        result(null, res);
      }
    });
  };

  chart.findpiechartspeaker = function ( result) {
    let sql = `call microsite_pie_chart_speaker();`;
    dbConn.query(sql, function (err, res) {
      if (err) {
        result(null, err);
      } else {
        result(null, res);
      }
    });
  };
  
  // ===================================================================================================

  
  chart.findchart_delegateby_currentDate = function ( result) {
    let sql = `call microsite_count_userRegistrations_delegate();`;
    dbConn.query(sql, function (err, res) {
      if (err) {
        result(null, err);
      } else {
        result(null, res);
      }
    });
  };

  chart.findchart_partnerby_currentDate = function ( result) {
    let sql = `call microsite_count_userRegistrations_partner();`;
    dbConn.query(sql, function (err, res) {
      if (err) {
        result(null, err);
      } else {
        result(null, res);
      }
    });
  };

  chart.findchart_speakerby_currentDate = function ( result) {
    let sql = `call microsite_count_userRegistrations_speaker();`;
    dbConn.query(sql, function (err, res) {
      if (err) {
        result(null, err);
      } else {
        result(null, res);
      }
    });
  };
  
  

  chart.findchart_delegate_refrence_chart = function ( result) {
    let sql = `call microsite_refrence_pie_chart_delegate();`;
    dbConn.query(sql, function (err, res) {
      if (err) {
        result(null, err);
      } else {
        result(null, res);
      }
    });
  };
  chart.findchart_partner_refrence_chart = function ( result) {
    let sql = `call microsite_refrence_pie_chart_partner();`;
    dbConn.query(sql, function (err, res) {
      if (err) {
        result(null, err);
      } else {
        result(null, res);
      }
    });
  };
  chart.findchart_speaker_refrence_chart = function ( result) {
    let sql = `call microsite_refrence_pie_chart_speaker();`;
    dbConn.query(sql, function (err, res) {
      if (err) {
        result(null, err);
      } else {
        result(null, res);
      }
    });
  };
  module.exports = chart;