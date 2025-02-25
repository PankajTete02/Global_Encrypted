const delegate_profile_adv_model = require('../models/delegate_profile_adv_model');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const qrcode = require('qrcode');
const sharp = require('sharp');
const ejs = require('ejs');
const { createCanvas, loadImage } = require("canvas");
const { PDFDocument } = require('pdf-lib');
const stripe = require('stripe')('sk_test_51QSuqmCco9ltycd0nRlrJoCLGhFItJ1IEzUqdMUimJ14hNOvWLCGiQbiNTrzDOOWAVCnEesjlcnZ6Vu0Wd4ozbNQ00Suza4H9F');
//live
//const stripe = require('stripe')('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');
const delegateProfileModel = require('../models/delegateProfileModel');

const bulk_delegate_insert = async (req, res) => {
  try {
    const delegate = req.body; // Expecting a single delegate object

    if (!delegate || typeof delegate !== 'object') {
      return res.status(400).json({ success: false, error: true, message: "Invalid input. Expecting a delegate object." });
    }

    const requiredFields = [
      "title", "first_name", "last_name", "country_code", "mobile_number",
      "email_id", "dob", "profession_1", "country", "city",
      "attendee_purpose", "conference_lever_interest", "is_nomination", "p_type", "p_reference_by"
    ];

    let errors = [];

    let delegateErrors = requiredFields
      .filter(field => !delegate[field])
      .map(field => `${field} is required`);

    if (delegate.mobile_number && !/^\d+$/.test(delegate.mobile_number)) {
      delegateErrors.push("mobile_number should be a valid number");
    }

    if (delegate.email_id && !/^\S+@\S+\.\S+$/.test(delegate.email_id)) {
      delegateErrors.push("email_id should be a valid email address");
    }

    if (delegate.dob) {
      const dobDate = new Date(delegate.dob);
      if (isNaN(dobDate.getTime()) || dobDate >= new Date()) {
        delegateErrors.push("dob should be a valid past date");
      }
    }

    if (delegateErrors.length > 0) {
      return res.status(400).json({ success: false, error: true, message: "Validation errors", details: delegateErrors });
    }

    // Insert delegate into the database
    delegate_profile_adv_model.bulk_delegate_insert(req, delegate, async (err, response) => {
      if (err) {
        return res.status(500).json({ success: false, error: true, message: err.message, details: err[0] });
      }

      let message = "Unknown error";
      let success = false;

      if (response.check === "fail") {
        message = "Email already registered as delegate.";
      } else if (response.check === "fail1") {
        message = "Mobile number with the given country code already registered.";
      } else if (response.check === "Coupon code invalid") {
        message = "Coupon code invalid";
      } else {
        await sendEmailNotification(req, delegate.email_id, delegate.is_nomination, delegate.reference_no, delegate);
        message = "Delegate profile registered successfully.";
        success = true;
      }

      return res.status(success ? 201 : 400).json({
        success,
        error: !success,
        message
      });
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ success: false, error: true, message: error.message });
  }
};
function logError(error) {

  const errorMessage = `[${new Date().toISOString()}] ${error.stack || error}\n`;
  const logFilePath = path.join(__dirname, 'error.log');
  console.log("logFilePath", logFilePath);
  // Append error message to file
  fs.appendFile(logFilePath, errorMessage, (err) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    }
  });
}
const get_speaker_list = async (req, res) => {
  try {
    const check = await delegate_profile_adv_model.get_all_speaker_list(req, res);
    console.log("Database transaction result:", check);
    return res.status(200).json({ success: true, error: false, data: check });
  }
  catch (err) {
    return res.status(500).json({ success: false, error: true, message: err.message });
  }

};
const create_delegate_profile_online = (req, res) => {
  const {
    title,
    first_name,
    last_name,
    country_code,
    mobile_number,
    email_id,
    linkedIn_profile,
    instagram_profile,
    dob,
    profession_1,
    profession_2,
    website,
    organization_name,
    address,
    country,
    state,
    city,
    pin_code,
    attend_summit,
    attendee_purpose,
    conference_lever_interest,
    created_by,
    status,
    passport_no,
    passport_issue_by,
    reference_no,
    country_id,
    state_id,
    city_id,
    is_nomination,
    p_type,
    p_reference_by
  } = req.body;

  const requiredFields = [
    "title",
    "first_name",
    "last_name",
    "country_code",
    "mobile_number",
    "email_id",
    "dob",
    "profession_1",
    "country",
    "city",
    "attendee_purpose",
    "conference_lever_interest",
    "is_nomination",
    "p_type"
  ];

  const errors = [];

  requiredFields.forEach(field => {
    if (!req.body[field]) {
      errors.push(`${field} is required`);
    }
  });

  // Validate specific fields
  if (req.body.mobile_number && !/^\d+$/.test(req.body.mobile_number)) {
    errors.push("mobile_number should be a valid number");
  }

  if (req.body.dob) {
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(req.body.dob)) {
      errors.push("dob should be in the format YYYY-MM-DD");
    } else {
      const dobDate = new Date(req.body.dob);
      const today = new Date();
      if (dobDate >= today) {
        errors.push("dob should be a past date");
      }
    }
  }


  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: true,
      message: errors[0]
    });
  }

  // If everything is valid, continue processing...


  const delegateData = {
    title,
    first_name,
    last_name,
    country_code,
    mobile_number,
    email_id,
    linkedIn_profile,
    instagram_profile,
    dob,
    profession_1,
    profession_2,
    website,
    organization_name,
    address,
    country,
    state,
    city,
    pin_code,
    attend_summit,
    attendee_purpose,
    conference_lever_interest,
    created_by,
    status,
    passport_no,
    passport_issue_by,
    reference_no,
    country_id,
    state_id,
    city_id,
    is_nomination,
    p_type,
    p_reference_by
  };

  // Call model function to insert the delegate profile
  delegateProfileModel.insertDelegateProfile(req, delegateData, async (err, response) => {
    if (err) {
      console.error("Error inserting delegate profile: ", err);
      return res.status(500).json({
        success: false,
        error: true,
        message: "Server error.",
        details: err
      });
    }

    // Handling the response based on status
    if (response.response === "fail") {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Email already registered as delegate."
      });
    }
    else if (response.response === "fail1") {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Mobile number with the given country code already registered."
      });
    }
    else if (response.response === "Coupon code invalid") {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Coupon code invalid"
      });
    }
    else if (response.response === "success") {

      const delegate = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Online delegate',
            },
            unit_amount: 28000,
          },
          quantity: 1,
        },
      ];


      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: email_id,
        line_items: delegate,
        mode: 'payment',
        success_url: `https://globaljusticeuat.cylsys.com/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://globaljusticeuat.cylsys.com/`,
        expires_at: Math.floor(Date.now() / 1000) + 86400,
      });

      // const discount_url=`https://globaljusticeuat.cylsys.com/payment-status/?email=${email_id}`;
      const discount_url = `${session.url}`
      const with_full = `<!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8" />
                <title>Submitting Registration</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <style>
                  .mq {
                    width: 710px;
                  }
            
                  /* Extra small devices (phones, 600px and down) */
                  @media only screen and (max-width: 600px) {
                    .mq {
                      width: 300px;
                    }
                    .mqfont {
                      font-size: 16px;
                    }
                  }
            
                  /* Small devices (portrait tablets and large phones, 600px and up) */
                  @media only screen and (min-width: 600px) {
                    .mq {
                      width: 300px;
                    }
                  }
            
                  /* Medium devices (landscape tablets, 768px and up) */
                  @media only screen and (min-width: 768px) {
                    .mq {
                      width: 710px;
                    }
                  }
            
                  /* Large devices (laptops/desktops, 992px and up) */
                  @media only screen and (min-width: 992px) {
                    .mq {
                      width: 710px;
                    }
                  }
            
                  /* Extra large devices (large laptops and desktops, 1200px and up) */
                  @media only screen and (min-width: 1200px) {
                    .mq {
                      width: 710px;
                    }
                  }
                  .mqimg {
                    width: 100px !important;
                  }
                  .mqimg1 {
                    width: 100px !important;
                  }
                  .mqimg1 {
                    width: 100px !important;
                  }
                </style>
              </head>
              <body style="padding: 0px; margin: 0px">
                <table
                  width="100%"
                  border="0"
                  cellspacing="0"
                  cellpadding="0"
                  align="center"
                  style="
                    font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, sans-serif;
                  "
                >
                  <tbody>
                    <tr>
                      <td>
                        <table
                          width="710"
                          border="0"
                          cellspacing="0"
                          cellpadding="5"
                          align="center"
                        >
                          <tbody>
                            <tr>
                              <td style="padding: 0">
                                <img src="https://devglobaljusticeapis.cylsys.com/middle_ware/photo/head.png" alt="" width="100%" />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <table
                          width="710"
                          border="0"
                          cellspacing="0"
                          cellpadding="5"
                          align="center"
                          style="
                            background: linear-gradient(180deg, #bdc78c2e 0%, #bdc78c 100%);
                          "
                        >
                          <tbody>
                            <tr>
                              <td>
                                <table style="padding: 0 50px">
                                  <tbody>
                                    <tr>
                                      <td>
                                        <table
                                          width="100%"
                                          border="0"
                                          cellspacing="0"
                                          cellpadding="0"
                                        >
                                          <tbody>
                                            <tr>
                                              <td
                                                style="
                                                  font-size: 18px;
                                                  line-height: 25px;
                                                  font-family: Gotham, 'Helvetica Neue',
                                                    Helvetica, Arial, sans-serif;
                                                "
                                              >
                                                <p><b>Hi ${first_name} ${last_name},</b></p>
                                                <p
                                                  style="
                                                    font-size: 14px;
                                                    font-weight: 500;
                                                    line-height: 22px;
                                                    text-align: left;
                                                    text-underline-position: from-font;
                                                    text-decoration-skip-ink: none;
                                                  "
                                                >
                                                  Thank you for submitting your registration
                                                  for the Global Justice, Love & Peace
                                                  Summit in Dubai on 12th-13th April 2025.
                                                </p>
                                                <p
                                                  style="
                                                    font-size: 14px;
                                                    font-weight: 500;
                                                    line-height: 22px;
                                                    text-align: left;
                                                    text-underline-position: from-font;
                                                    text-decoration-skip-ink: none;
                                                  "
                                                >
                                                  We are thrilled to have you join us at
                                                  this momentous gathering. To complete your
                                                  registration, please proceed with the
                                                  payment of USD 280 via the link below:
                                                </p>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>
                                        <table
                                          width="100%"
                                          border="0"
                                          cellspacing="0"
                                          cellpadding="0"
                                          style="padding: 0"
                                        >
                                          <tbody>
                                            <tr>
                                              <td>
                                                <p
                                                  style="
                                                    font-size: 14px;
                                                    font-weight: 700;
                                                    line-height: 22px;
                                                    text-align: left;
                                                    text-underline-position: from-font;
                                                    text-decoration-skip-ink: none;
                                                    color: #128940;
                                                    display: flex;
                                                    align-items: center;
                                                  "
                                                >
                                                  Payment Link Here -
                                                  <a href=${discount_url} target="_blank"
                                                    style="
                                                      background-color: #128940;
                                                      color: #ffffff;
                                                      box-shadow: 0px 0px 5px 1px #12894066;
                                                      border: none;
                                                      width: 81px;
                                                      padding: 3px;
                                                      border-radius: 5px;
                                                      margin: 0 10px;
                                                      text-decoration: none;
                                                      text-align: center;
                                                    "
                                                  >
                                                    Pay
                                                  </a>
                                                </p>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td>
                                                <p
                                                  style="
                                                    font-size: 14px;
                                                    font-weight: 500;
                                                    line-height: 22px;
                                                    text-align: left;
                                                    text-underline-position: from-font;
                                                    text-decoration-skip-ink: none;
                                                  "
                                                >
                                                  We eagerly await your participation in
                                                  this inspiring event. Should you need any
                                                  assistance, please do not hesitate to
                                                  reach out to our support team.
                                                </p>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>
                                        <table
                                          width="100%"
                                          border="0"
                                          cellspacing="0"
                                          cellpadding="0"
                                        >
                                          <tbody>
                                            <tr>
                                              <td>
                                                <p
                                                  style="
                                                    font-size: 14px;
                                                    font-weight: 400;
                                                    line-height: 22px;
                                                    text-align: left;
                                                    text-underline-position: from-font;
                                                    text-decoration-skip-ink: none;
                                                    margin: 0;
                                                  "
                                                >
                                                  Warm regards,
                                                </p>
                                                <p
                                                  style="
                                                    font-size: 14px;
                                                    font-weight: 600;
                                                    line-height: 22px;
                                                    text-align: left;
                                                    text-underline-position: from-font;
                                                    text-decoration-skip-ink: none;
                                                    margin: 0;
                                                    color: #005a93;
                                                  "
                                                >
                                                  The Global Justice, Love & Peace Summit
                                                  Team
                                                </p>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                                <br /><br />
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <table
                                  width="100%"
                                  border="0"
                                  cellspacing="0"
                                  cellpadding="0"
                                  style="
                                    border-top: 1px solid #fff;
                                    border-bottom: 1px solid #fff;
                                  "
                                >
                                  <tbody>
                                    <tr>
                                      <td>
                                        <table width="100%">
                                          <tbody>
                                            <tr>
                                              <td align="center">
                                                <p
                                                  style="
                                                    font-size: 10px;
                                                    font-weight: 400;
                                                    line-height: 18px;
                                                    text-align: center;
                                                    text-underline-position: from-font;
                                                    text-decoration-skip-ink: none;
                                                  "
                                                >
                                                  For any assistance or support, please
                                                  reach out to us at
                                                  <a
                                                    style="color: #0573ba"
                                                    href="mailto:help@justice-love-peace.com"
                                                    >help@justice-love-peace.com</a
                                                  >
                                                  <br />
                                                  Explore more on our website:
                                                  <a
                                                    style="color: #0573ba"
                                                    href="https://www.justice-love-peace.com"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    >www.justice-love-peace.com</a
                                                  >
                                                </p>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td align="center">
                                        <table width="100%" style="padding: 1rem 12rem">
                                          <tbody>
                                            <tr>
                                              <td align="center">
                                                <a
                                                  href="https://www.instagram.com/globaljusticelovepeacesummit/
                                                          "
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  ><img
                                                    src="https://devglobaljusticeapis.cylsys.com/middle_ware/photo/insta.svg"
                                                    alt=""
                                                /></a>
                                              </td>
                                              <td align="center">
                                                <a
                                                  href="https://www.facebook.com/GlobalJusticeLoveandPeaceSummit
                                      "
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  ><img
                                                    src="https://devglobaljusticeapis.cylsys.com/middle_ware/photo/fb.svg"
                                                    alt=""
                                                /></a>
                                              </td>
                                              <td align="center">
                                                <a
                                                  href="https://www.youtube.com/@GlobalJusticeLovePeaceSummit/videos"
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  ><img
                                                    src="https://devglobaljusticeapis.cylsys.com/middle_ware/photo/youtube.svg"
                                                    alt=""
                                                /></a>
                                              </td>
                                              <td align="center">
                                                <a
                                                  href="https://wa.me/+91 9324064978"
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  ><img
                                                    src="https://devglobaljusticeapis.cylsys.com/middle_ware/photo/whatsApp.svg"
                                                    alt=""
                                                /></a>
                                              </td>
                                              <td align="center">
                                                <a
                                                  href="https://www.linkedin.com/company/global-justice-love-peace-summit-2025/posts/?feedView=all"
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  ><img
                                                    src="https://devglobaljusticeapis.cylsys.com/middle_ware/photo/linkedIn.svg"
                                                    alt=""
                                                /></a>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td align="center">
                                <table>
                                  <tbody>
                                    <tr>
                                      <td
                                        align="center"
                                        style="
                                          font-size: 10px;
                                          font-weight: 400;
                                          line-height: 12.88px;
                                          text-align: center;
                                          text-underline-position: from-font;
                                          text-decoration-skip-ink: none;
                                        "
                                      >
                                        © 2025 Global Justice, Love & Peace Summit. All
                                        rights reserved.
                                        <br />
                                        <br />
                                      </td>
                                    </tr>
                                    <tr>
                                      <td
                                        align="center"
                                        style="
                                          font-size: 10px;
                                          font-weight: 400;
                                          line-height: 12.88px;
                                          text-align: center;
                                          text-underline-position: from-font;
                                          text-decoration-skip-ink: none;
                                        "
                                      >
                                        You are receiving this message because you
                                        registered to join the movement for Global Justice,
                                        Love & <br />
                                        Peace. By signing up, you agreed to our Terms of Use
                                        and Privacy Policies.
                                      </td>
                                    </tr>
                                    <tr>
                                      <td
                                        align="center"
                                        style="
                                          font-size: 10px;
                                          font-weight: 400;
                                          line-height: 12.88px;
                                          text-align: center;
                                          text-underline-position: from-font;
                                          text-decoration-skip-ink: none;
                                        "
                                      >
                                        <ul
                                          style="
                                            display: flex;
                                            padding: 0;
                                            justify-content: space-between;
                                          "
                                        >
                                          <li>
                                            <a
                                              style="color: #333333"
                                              href="https://www.justice-love-peace.com/accessibility"
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              >Accessibility</a
                                            >
                                          </li>
                                          <li>
                                            <a
                                              style="color: #333333"
                                              href="https://www.justice-love-peace.com/privacy-policy"
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              >Privacy policy</a
                                            >
                                          </li>
                                          <li>
                                            <a
                                              style="color: #333333"
                                              href="https://www.justice-love-peace.com/cookie-policy"
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              >Cookie Policy</a
                                            >
                                          </li>
                                          <li>
                                            <a
                                              style="color: #333333"
                                              href="https://www.justice-love-peace.com/terms-of-use"
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              >Terms of use</a
                                            >
                                          </li>
                                          <li>
                                            <a
                                              style="color: #333333"
                                              href="https://www.justice-love-peace.com/visitor-terms-conditions"
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              >Visitor Terms and Conditions</a
                                            >
                                          </li>
                                        </ul>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </body>
            </html>`

      const transporter = nodemailer.createTransport({
        service: 'gmail', // or use any other email provider
        auth: {
          user: 'Peacekeeper@global-jlp-summit.com', // your email address
          pass: 'tusi xeoi hxoz fwwb'   // your email password
        }
      });



      const mailOptions = {
        from: 'Peacekeeper@global-jlp-summit.com',
        to: email_id,
        subject: 'Delegate at the Global Justice Summit - It’s just one step away',
        html: with_full,
      };

      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

      return res.status(201).json({
        success: true,
        error: false,
        url: session.url,
        delegate_id: response.id,
        message: "Delegate profile registered successfully.You are now being redirected to the payment gateway."
      });
    } else {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Unknown error occurred."
      });
    }
  });
};

const create_sample_delegate_online = async (req, res) => {
  try {

    const requiredFields = [
      "name",
      "email",
      "mobile_no"
    ]

    const errors = [];

    requiredFields.forEach(field => {
      if (!req.body[field]) {
        errors.push(`${field} is required`);
      }
    });

    if (req.body.mobile_no && !/^\d+$/.test(req.body.mobile_no)) {
      errors.push("mobile_number should be a valid number");
    }
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: true,
        message: errors[0]
      });
    }

    const result = await delegate_profile_adv_model.sample_delegate_online(req, res);
    console.log(result[0].result, "result");
    if (result[0].status == 4) {
      const delegate = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Online delegate',
            },
            unit_amount: 28000,
          },
          quantity: 1,
        },
      ];


      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: req.body.email,
        line_items: delegate,
        mode: 'payment',
        success_url: `https://globaljusticeuat.cylsys.com/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://globaljusticeuat.cylsys.com/`,
        expires_at: Math.floor(Date.now() / 1000) + 86400,
      });
      // const discount_url = `${session.url}`
      return res.status(200).json({
        success: true,
        error: false,
        message: result[0].result,
        delegate_id: result[0].delegate_id,
        payment_link:session.url
      });
    }
    else {
      return res.status(400).json({
        success: true,
        error: false,
        message: result[0].result
      });
    }

  }
  catch (err) {
    return res.status(500).json({ success: false, error: true, message: err.message });
  }
};

const sendEmailNotification = async (req, email, is_nomination, reference_no, delegate) => {
  try {
    console.log("Processing delegate:", delegate);

    const check = await delegate_profile_adv_model.insert_sponsered_transcation_details(req, delegate);
    console.log("Database transaction result:", check);
    console.log(check[0].random_id, "check");

    async function generateTicket(data) {
      for (const entry of data) {
        try {
          const imageName = `${entry.random_id}.png`;
          const imagePath = path.join(__dirname, "../uploads/ticket_qr", imageName);
          const qr_url = entry.random_id;

          async function generateQRCodeWithImage(imagePath, qr_url) {
            try {
              const logoPath = path.join(__dirname, "../uploads/delegate_qr", "Logo.png");
              const qrCodeBuffer = await qrcode.toBuffer(qr_url, { errorCorrectionLevel: 'H', scale: 10, margin: 1 });
              const qrDimensions = await sharp(qrCodeBuffer).metadata();
              const logoSize = Math.floor(qrDimensions.width / 4);
              const logoBuffer = await applyCircleMaskToLogo(logoPath, logoSize);

              await sharp(qrCodeBuffer)
                .composite([{ input: logoBuffer, gravity: 'center', blend: 'over' }])
                .toFile(imagePath);

            } catch (error) {
              console.error("Error generating QR code:", error);
            }
          }

          async function applyCircleMaskToLogo(logoPath, logoSize) {
            try {
              const logoImage = await sharp(logoPath).resize(logoSize, logoSize).toBuffer();
              const circleMask = Buffer.from(`<svg width="${logoSize}" height="${logoSize}"><circle cx="${logoSize / 2}" cy="${logoSize / 2}" r="${logoSize / 2}" fill="white" /></svg>`);
              return sharp(logoImage).composite([{ input: circleMask, blend: 'dest-in' }]).toBuffer();
            } catch (error) {
              console.error("Error applying circle mask:", error);
            }
          }

          await generateQRCodeWithImage(imagePath, qr_url);
          console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
          const destFolder = path.join(__dirname, "../uploads/Ticket_photo");
          const baseImagePath = path.join(__dirname, "../uploads/delegate_qr/FinalTicket.png");
          console.log(baseImagePath, "baseImagePath");


          logError(baseImagePath);
          const qrCodePath = path.join(__dirname, `../uploads/ticket_qr/${imageName}`);
          console.log(qrCodePath, "qrCodePath");
          logError(qrCodePath);
          // Load Images

          if (fs.existsSync(baseImagePath)) {
            logError("Exists");
            logError(baseImagePath);

          }
          if (fs.existsSync(qrCodePath)) {
            logError("Exists qrCodePath");
            logError(qrCodePath);

          }
          const baseImage = await loadImage(baseImagePath);
          const qrCode = await loadImage(qrCodePath);


          const canvas = createCanvas(baseImage.width, baseImage.height);
          const ctx = canvas.getContext("2d"); // Move this before using ctx

          ctx.drawImage(baseImage, 0, 0);

          function drawVerticalText(ctx, text, x, y, maxFontSize, color, maxWidth, maxHeight) {
            ctx.save();
            ctx.translate(x, y); // Move to position
            ctx.rotate(-Math.PI / 2); // Rotate counterclockwise
            ctx.fillStyle = color;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            let fontSize = 175;
            const minFontSize = 50; // Minimum font size
            ctx.font = `bold ${fontSize}px Arial`;

            // Dynamic logic to split the text into two balanced lines
            const words = text.split(" ");
            let line1 = [];
            let line2 = [];

            // Divide words roughly into two balanced lines
            const midIndex = Math.ceil(words.length / 2);
            line1 = words.slice(0, midIndex).join(" ");
            line2 = words.slice(midIndex).join(" ");

            // Adjust font size to fit both lines within maxWidth and maxHeight
            const adjustFontSize = () => {
              while (
                (ctx.measureText(line1).width > maxHeight ||
                  ctx.measureText(line2).width > maxHeight ||
                  fontSize * 2 > maxWidth) &&
                fontSize > minFontSize
              ) {
                fontSize -= 1;
                ctx.font = `bold ${fontSize}px Arial`;
              }
            };
            adjustFontSize();

            // Calculate line spacing
            const lineHeight = fontSize * 1.2; // Adjust spacing proportional to font size
            const totalHeight = 2 * lineHeight;
            const startY = -(totalHeight / 2) + lineHeight / 2;

            // Draw the text lines
            ctx.fillText(line1, 0, startY); // First line
            ctx.fillText(line2, 0, startY + lineHeight); // Second line
            logError(line1);
            logError(line2);
            ctx.restore();
          }

          function drawVerticalText1(ctx, text, x, y, font, color, lineHeight = 160) {
            ctx.save();
            ctx.translate(x, y); // Move to position
            ctx.rotate(-Math.PI / 2); // Rotate counterclockwise
            ctx.font = `bold ${font}px Arial`; // Font size
            ctx.fillStyle = color;
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            const lines = text.split("\n");
            lines.forEach((line, index) => {
              ctx.fillText(line, 0, index * lineHeight); // Adjust `lineHeight` for spacing
            });
            logError(lines);
            ctx.restore();
          }

          var name = `${entry.title} ${entry.first_name} ${entry.last_name}`;
          drawVerticalText(ctx, name, 400, 1450, 260, "#005B94"); // Name on the left
          drawVerticalText(ctx, "Delegate", 850, 1350, 200, "green");

          const address = "North Halls\nExhibition\nCentre (DEC),\nExpo City, \nDubai";
          drawVerticalText1(ctx, address, 6600, 1360, 160, "#005B94");

          const qrCodeX = 6220, qrCodeY = 1600, qrCodeWidth = 1225, qrCodeHeight = 1250;
          ctx.drawImage(qrCode, qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);

          // Save the output image
          const outputFilePath = path.join(destFolder, `${entry.random_id}.png`);
          logError(outputFilePath);
          const out = fs.createWriteStream(outputFilePath);
          const stream = canvas.createPNGStream();
          stream.pipe(out);

          out.on("finish", async () => {
            console.log(`Badge saved as PNG at: ${outputFilePath}`);

            const destFolderPdf = path.join(__dirname, "../uploads/Ticket_pdf");
            const pdfFilePath = path.join(destFolderPdf, `${entry.random_id}.pdf`);
            console.log(pdfFilePath, "pdfFilePath");
            async function pngToPdf() {
              console.log("A");
              try {
                console.log("outputFilePath", outputFilePath);
                // Read the PNG file from the "png" folder
                const imagePath = outputFilePath;
                console.log(imagePath, "imagePath");
                const pngBytes = fs.readFileSync(imagePath);

                // Create a new PDF document
                const pdfDoc = await PDFDocument.create();
                const pngImage = await pdfDoc.embedPng(pngBytes);

                // Get original dimensions
                let { width, height } = pngImage;

                // Define the max dimensions for resizing
                const maxWidth = 500;  // Adjust this for the desired width
                const maxHeight = 700; // Adjust this for the desired height

                // Resize while maintaining aspect ratio
                if (width > maxWidth || height > maxHeight) {
                  const aspectRatio = width / height;
                  if (width > height) {
                    width = maxWidth;
                    height = maxWidth / aspectRatio;
                  } else {
                    height = maxHeight;
                    width = maxHeight * aspectRatio;
                  }
                }

                // Add a properly sized page to the PDF
                const page = pdfDoc.addPage([width, height]);
                page.drawImage(pngImage, {
                  x: 0,
                  y: 0,
                  width,
                  height,
                });

                // Save the resized PDF
                const pdfBytes = await pdfDoc.save();
                fs.writeFileSync(pdfFilePath, pdfBytes);
                logError("sucess_;pdf");
              } catch (error) {
                console.error('Error converting PNG to PDF:', error);
                logError(error.message);
              }
            }
            pngToPdf();
            console.log(`Badge saved as PDF at: ${pdfFilePath}`);
          });

        } catch (error) {
          console.error("Error processing ticket for entry:", entry, error);
        }
      }
    }

    const nominations = [{
      title: check[0].title,
      email_id: check[0].email_id,
      last_name: check[0].last_name,
      random_id: check[0].random_id,
      first_name: check[0].first_name
    }];
    console.log(nominations);
    await generateTicket(nominations);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'Peacekeeper@global-jlp-summit.com',
        pass: 'tusi xeoi hxoz fwwb'
      }
    });


    const mailOptions = {
      from: 'Peacekeeper@global-jlp-summit.com',
      to: check[0].email_id,
      //to:"udayshimpi2000@gmail.com",
      subject: 'Delegate at the Global Justice Summit - It’s just one step away',
      html: `<img src="cid:qrCodeImage" alt="QR Code" style="width: 50%; height: 50%;" />`,
      attachments: [
        {
          filename: `${check[0].random_id}.png`, // Assuming coupon_code exists in response[0]
          path: path.join(__dirname, '../uploads/Ticket_photo', `${check[0].random_id}.png`),
          cid: 'qrCodeImage' // Same Content-ID as used in the HTML
        }
      ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  } catch (error) {
    console.error("Error in sendEmailNotification:", error);
  }
};


module.exports = { bulk_delegate_insert, get_speaker_list, create_delegate_profile_online, create_sample_delegate_online }