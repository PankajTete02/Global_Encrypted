const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const conn = require('../../db.config').promise();
const express = require("express");
const app = express();
app.use(express.json());

exports.forgetPassword = async (req, res, next) => {
  const errors = validationResult(req);    

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const hashPass = await bcrypt.hash(req.body.password, 12);

    const [rows] = await conn.execute(
      'call microsite_forget_password(?,?)',
    [
      hashPass,
      req.body.otp,
    ]);

    if (rows.affectedRows === 1) {
      return res.status(201).json({
        success: true,
        message: "Password updated successfully.",
        data: rows,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "OTP not found.",
      });
    }
  } catch (err) {
    next(err);
  }
}