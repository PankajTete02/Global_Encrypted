
var dbConn = require("../../db.config");


exports.findAllCountry = function (result) {
  dbConn.query("call USP_GET_ALL_COUNTRY_DETAILS();", function (err, res) {
    if (err) {(err);

      result(err, null);
    } else {
      result(null, res);
    }
  });
};
exports.findAllCountry_delegate = function (result) {
  dbConn.query("call USP_GET_ALL_DELEGATE_COUNTRY_DETAILS();", function (err, res) {
    if (err) {(err);

      result(err, null);
    } else {
      result(null, res);
    }
  });
};

exports.findStatebyCountryid = function (country_id, result) {
  dbConn.query(
    "call USP_GET_STATE_DETAILS_BY_COUN_ID(?);",
    country_id,
    function (err, res) {
      if (err) {(err);
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
};

exports.findStatebyCountryid_delegate = function (country_id, result) {
  dbConn.query(
    "call USP_GLOBAL_DELEGATE_STATE(?);",
    country_id,
    function (err, res) {
      if (err) {(err);
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
};

exports.findCitybyStateid = function (state_id, result) {
  dbConn.query(
    "call  USP_GET_ALL_CITY_DETAILS_BY_ID(?);",
    state_id,
    function (err, res) {
      if (err) {(err);
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
};

// ---------------------------------------------------------------------------------------
exports.findCountryCode = function (country_id, result) {
  dbConn.query(
    "call microsite_getcountry_mobile_code();",
    country_id,
    function (err, res) {
      if (err) {(err);
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
};

exports.findDates = function ( result) {
  dbConn.query(
    "call microsite_getDates();",
    
    function (err, res) {
      if (err) {(err);
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
};

exports.findCitybyStateid_delegate = function (state_id, result) {
  dbConn.query(
    "call  USP_GLOBAL_DELEGATE_CITY(?);",
    state_id,
    function (err, res) {
      if (err) {(err);
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
};