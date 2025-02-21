const nodemailer = require('nodemailer');
const delegateProfileModel = require('../models/delegateProfileModel');
const path = require('path');
const fs = require('fs');
const qrcode = require('qrcode');
const sharp = require('sharp');
const ejs = require('ejs');
const { createCanvas, loadImage } = require("canvas");
// const { PDFDocument } = require('pdf-lib');
const { PDFDocument } = require('pdf-lib');
const peacekeeperModel = require('../models/peacekeeperModel');
const { error } = require('console');
//const stripe = require('stripe')(process.env.STRIPE_TEST);
const stripe = require('stripe')('sk_test_51QSuqmCco9ltycd0nRlrJoCLGhFItJ1IEzUqdMUimJ14hNOvWLCGiQbiNTrzDOOWAVCnEesjlcnZ6Vu0Wd4ozbNQ00Suza4H9F');
//live
//const stripe = require('stripe')('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');
// Ensure the directory exists, if not, create it

const createDelegateProfile = (req, res) => {
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

  // If there are validation errors, return response
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
      console.log(response,"cjeedvfdv");
      console.log(is_nomination,"response.nomination");
       
          console.log(email_id,"email_id_check");
          const nomination = [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: 'Without coupon',
                },
                unit_amount: 280000,
              },
              quantity: 1,
            },
          ];
        
          const delegate = [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: reference_no.length === 0 ? 'Without coupon' : 'With coupon',
                },
                unit_amount: reference_no.length === 0 ? 280000 : 260400,
              },
              quantity: 1,
            },
          ];
       
         
          const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: email_id,
            line_items: is_nomination === "1" ? nomination : delegate,
            mode: 'payment',
            success_url: `https://globaljusticeuat.cylsys.com/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `https://globaljusticeuat.cylsys.com/`,
            expires_at: Math.floor(Date.now() / 1000) + 86400,
          });
        
      // const discount_url=`https://globaljusticeuat.cylsys.com/payment-status/?email=${email_id}`;
      const discount_url = `${session.url}`
      const with_discount = `<!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8" />
                <title>Discount</title>
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
                                                <p><b>Hi ${first_name} ${last_name} ,</b></p>
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
                                                  We are delighted to confirm that your
                                                  reference QR code has been successfully
                                                  applied, entitling you to an exclusive 7%
                                                  discount on the registration fee. To
                                                  complete your registration, please proceed
                                                  with the discounted payment of USD 2604 via
                                                  the link below:
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
                                                  <a href=${discount_url}  target="_blank"
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
                                                  We are excited to have you join us at this
                                                  extraordinary event. Should you require
                                                  any assistance, our support team is here
                                                  to help.
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
                                                  href="https://www.instagram.com/globaljusticelovepeacesummit/"
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
                                                  payment of USD 2800 via the link below:
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
        html: is_nomination === "1" ? with_full : (reference_no.length === 0 ? with_full : with_discount),
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

const createNominateProfile = async (req, res) => {
  try {
    const {
      delegate_id,
      nomination_name,
      relation_id,
      dob,
      email,
      mobile_no,
      institution
    } = req.body;

    // Validate required fields
    const errors = [];
    if (!delegate_id) errors.push("delegate_id is required");
    if (!nomination_name) errors.push("nomination_name is required");
    if (!relation_id) errors.push("relation_id is required");
    if (!dob) errors.push("dob is required");
    if (!email) errors.push("email is required");
    if (!mobile_no) errors.push("mobile_no is required");
    // Validate DOB format
    if (dob) {
      const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dobRegex.test(dob)) {
        errors.push("dob should be in the format YYYY-MM-DD");
      } else {
        const dobDate = new Date(dob);
        const today = new Date();
        if (dobDate >= today) {
          errors.push("dob should be a past date");
        }
      }
    }

    if (req.body.mobile_no && !/^\d+$/.test(req.body.mobile_no)) {
      errors.push("mobile_number should be a valid number");
    }
    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: true, errors: errors[0] });
    }
    const result = await delegateProfileModel.insert_nomination(req, res);
    if(result[0].status == 0)
    {
      return res.status(500).json({
        success: false,
        error: true,
        message: result[0].result,
      });
    }
    else
    {
      return res.status(200).json({
        success: true,
        error: false,
        message: result[0].result,
      });
    }
    

  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
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
const verify_session_status = async (req, res) => {
  try {
    const sessionId = req.body.sessionId;
    console.log("sessionId", sessionId);
    // Retrieve the session details from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log(session, "session");
    console.log("assasasa", session.customer_details.name);
    if (session.payment_status === 'paid') {
      console.log("session",session.payment_status);
      const peacekeeperData = await peacekeeperModel.inserting_transcation_details(req, session);
      console.log(peacekeeperData, "peacekeeperData");
      console.log(peacekeeperData[0], "[0][0].result1");
      console.log(peacekeeperData[0].result, "[0][0].result1");

      if (peacekeeperData[0].result === "inserted successfully") {
           
        if (peacekeeperData[0].status_id == 0) {
          console.log(peacekeeperData[0], "peacekeeperData[0]");
          console.log(peacekeeperData[0].nominations[0].TND_EMAIL, "peacekeeperData[0]");
          async function generateTicket(data) {
            for (const entry of data) {
              const imageName = `${entry.random_id}.png`;
              const imagePath = path.join(__dirname, "../uploads/ticket_qr", imageName);
              const qr_url = `${entry.random_id}`;

              async function generateQRCodeWithImage(imagePath, qr_url) {
                try {
                  const logoPath = path.join(__dirname, "../uploads/delegate_qr", "Logo.png");
                  const qrCodeBuffer = await qrcode.toBuffer(qr_url, { errorCorrectionLevel: 'H', scale: 10, margin: 1 });
                  const qrDimensions = await sharp(qrCodeBuffer).metadata();
                  const logoSize = Math.floor(qrDimensions.width / 4);
                  const logoBuffer = await applyCircleMaskToLogo(logoPath, logoSize);

                  await sharp(qrCodeBuffer)
                    .resize(qrDimensions.width, qrDimensions.height)
                    .composite([{ input: logoBuffer, gravity: 'center', blend: 'over' }])
                    .toFile(imagePath);






                } catch (error) {
                  console.error("Error generating QR code:", error);
                }
              }

              async function applyCircleMaskToLogo(logoPath, logoSize) {
                const logoImage = await sharp(logoPath).resize(logoSize, logoSize).toBuffer();
                const circleMask = Buffer.from(`<svg width="${logoSize}" height="${logoSize}"><circle cx="${logoSize / 2}" cy="${logoSize / 2}" r="${logoSize / 2}" fill="white" /></svg>`);
                return sharp(logoImage).composite([{ input: circleMask, blend: 'dest-in' }]).sharpen(2).toBuffer();
              }

              await generateQRCodeWithImage(imagePath, qr_url);
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
            }

          }
          const nominations = [
            {
              title: '',
              email_id: peacekeeperData[0].nominations[0].TND_EMAIL,
              last_name: '',
              random_id: peacekeeperData[0].nominations[0].TND_Nomination_id,
              first_name: peacekeeperData[0].nominations[0].TND_NOMINATION_NAME
            }
          ];
          const parent_details = [
            {
              title: peacekeeperData[0].parent_details[0].title,
              email_id: peacekeeperData[0].parent_details[0].email_id,
              last_name: peacekeeperData[0].parent_details[0].last_name,
              random_id: peacekeeperData[0].parent_details[0].random_id,
              first_name: peacekeeperData[0].parent_details[0].first_name
            }
          ];

          const allDetails = [...nominations, ...parent_details];
          await generateTicket(allDetails);
        }
      }
      else {
        try {
          console.log(peacekeeperData[0], "peacekeeperData[0]");
          const imageName = `${peacekeeperData[0].random_id}.png`;
          const imagePath = path.join(__dirname, "../uploads/ticket_qr", imageName);
          const qr_url = `${peacekeeperData[0].qr_url}`;
          console.log(qr_url, "qr_url");
          async function generateQRCodeWithImage(imagePath, qr_url) {
            try {
              // Define paths
              const logoPath = path.join(__dirname, "../uploads/delegate_qr", "Logo.png"); // Logo path

              const qrCodeBuffer = await qrcode.toBuffer(qr_url, {
                errorCorrectionLevel: 'H', // High error correction for logo overlay
                scale: 10,// Scale for higher resolution QR code
                margin: 1
              });

              // Get QR code dimensions
              const qrDimensions = await sharp(qrCodeBuffer).metadata();
              const logoSize = Math.floor(qrDimensions.width / 4); // Resize logo to 1/4 of the QR code size

              // Apply circular mask to the logo and enhance quality
              const logoBuffer = await applyCircleMaskToLogo(logoPath, logoSize);

              // Process the QR code with the logo overlay
              await sharp(qrCodeBuffer)
                .resize(qrDimensions.width, qrDimensions.height) // Ensure QR code is correct size
                .composite([{
                  input: logoBuffer,
                  gravity: 'center', // Center the logo in the middle
                  blend: 'over', // Overlay the logo onto the QR code
                }])
                .toFile(imagePath); // Save the final image

              console.log("QR Code with sharp logo saved at:", imagePath);
            } catch (error) {
              console.error("Error generating QR code:", error);
            }
          }

          // Function to apply circular mask to the logo and sharpen it
          async function applyCircleMaskToLogo(logoPath, logoSize) {
            const logoImage = await sharp(logoPath)
              .resize(logoSize, logoSize) // Resize logo to desired size
              .toBuffer();

            // Create a circular mask for the logo
            const circleMask = Buffer.from(
              `<svg width="${logoSize}" height="${logoSize}">
                      <circle cx="${logoSize / 2}" cy="${logoSize / 2}" r="${logoSize / 2}" fill="white" />
                  </svg>`
            );

            // Apply circular mask on logo and sharpen the image
            return sharp(logoImage)
              .composite([{ input: circleMask, blend: 'dest-in' }]) // Apply mask to the logo
              .sharpen(2) // Apply sharpening for better clarity
              .toBuffer();
          }

          // Example Usage
          await generateQRCodeWithImage(imagePath, qr_url);

          const destFolder = path.join(__dirname, "../uploads/Ticket_photo");
          const baseImagePath = path.join(__dirname, "../uploads/delegate_qr/FinalTicket.png");
          console.log(baseImagePath, "baseImagePath");

          logError(baseImagePath);
          const qrCodePath = path.join(__dirname, `../uploads/ticket_qr/${peacekeeperData[0].random_id}.png`);
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

          //   logError("hi");

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

          var name = `${peacekeeperData[0].title}. ${peacekeeperData[0].first_name} ${peacekeeperData[0].last_name}`;
          drawVerticalText(ctx, name, 400, 1450, 260, "#005B94"); // Name on the left
          drawVerticalText(ctx, "Delegate", 850, 1350, 200, "green");

          const address = "North Halls\nExhibition\nCentre (DEC),\nExpo City, \nDubai";
          drawVerticalText1(ctx, address, 6600, 1360, 160, "#005B94");

          const qrCodeX = 6220, qrCodeY = 1600, qrCodeWidth = 1225, qrCodeHeight = 1250;
          ctx.drawImage(qrCode, qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);

          // Save the output image
          const outputFilePath = path.join(destFolder, `${peacekeeperData[0].random_id}.png`);
          logError(outputFilePath);
          const out = fs.createWriteStream(outputFilePath);
          const stream = canvas.createPNGStream();
          stream.pipe(out);

          out.on("finish", async () => {
            console.log(`Badge saved as PNG at: ${outputFilePath}`);

            const destFolderPdf = path.join(__dirname, "../uploads/Ticket_pdf");
            const pdfFilePath = path.join(destFolderPdf, `${peacekeeperData[0].random_id}.pdf`);
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

        }
        catch (err) {
          console.error("Error generating ticket:", err);
          logError(err.message);
        }
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'Peacekeeper@global-jlp-summit.com',
          pass: 'tusi xeoi hxoz fwwb'
        }
      });
     
    
      const bodyContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Discount</title>
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
                                      Thank you for completing your registration
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
                                      We are pleased to confirm receipt of your
                                      payment. Please find attached your
                                      official receipt and your event ticket.
                                      Kindly ensure you bring your ticket and
                                      personal QR code for entry to the event.
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
                                        font-weight: 500;
                                        line-height: 22px;
                                        text-align: left;
                                        text-underline-position: from-font;
                                        text-decoration-skip-ink: none;
                                      "
                                    >
                                     
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
                                      We look forward to welcoming you to this
                                      global gathering of change-makers, where
                                      together, we will strive towards justice,
                                      love, and peace.
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
                                      Should you have any questions or need
                                      further assistance, feel free to contact
                                      us.
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
                                      _ngcontent-iqa-c29=""
                                      href="https://www.facebook.com/GlobalJusticeLoveandPeaceSummit
                          "
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      ><img
                                        _ngcontent-iqa-c29=""
                                        src="https://devglobaljusticeapis.cylsys.com/middle_ware/photo/fb.svg"
                                        alt=""
                                    /></a>
                                  </td>
                                  <td align="center">
                                    <a
                                      _ngcontent-iqa-c29=""
                                      href="https://www.youtube.com/@GlobalJusticeLovePeaceSummit/videos"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      ><img
                                        _ngcontent-iqa-c29=""
                                        src="https://devglobaljusticeapis.cylsys.com/middle_ware/photo/youtube.svg"
                                        alt=""
                                    /></a>
                                  </td>
                                  <td align="center">
                                    <a
                                      _ngcontent-iqa-c29=""
                                      href="https://wa.me/+91 9324064978"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      ><img
                                        _ngcontent-iqa-c29=""
                                        src="https://devglobaljusticeapis.cylsys.com/middle_ware/photo/whatsApp.svg"
                                        alt=""
                                    /></a>
                                  </td>
                                  <td align="center">
                                    <a
                                      _ngcontent-iqa-c29=""
                                      href="https://www.linkedin.com/company/global-justice-love-peace-summit-2025/posts/?feedView=all"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      ><img
                                        _ngcontent-iqa-c29=""
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
</html>
`;

      if (peacekeeperData[0].status_id == 0) {
        const nominations = [
          {
            title: '',
             email_id: peacekeeperData[0].nominations[0].TND_EMAIL,
            //email_id: "udayshimpi2000@gmail.com",
            last_name: '',
            random_id: peacekeeperData[0].nominations[0].TND_Nomination_id,
            first_name: peacekeeperData[0].nominations[0].TND_NOMINATION_NAME
          }
        ];
        const parent_details = [
          {
            title: peacekeeperData[0].parent_details[0].title,
            email_id: peacekeeperData[0].parent_details[0].email_id,
            last_name: peacekeeperData[0].parent_details[0].last_name,
            random_id: peacekeeperData[0].parent_details[0].random_id,
            first_name: peacekeeperData[0].parent_details[0].first_name
          }
        ];
        const allDetails = [...nominations, ...parent_details];
        const recipients = allDetails.map(user => user.email_id).join(',');

        const mailOptions = {
          from: 'Peacekeeper@global-jlp-summit.com',
          to: recipients,
          subject: 'Payment Confirmation',
          html: bodyContent,
          attachments: allDetails.map(user => ({
            filename: `${user.random_id}.pdf`,
            path: path.join(__dirname, '../uploads/Ticket_pdf', `${user.random_id}.pdf`)
          }))
        };

          await transporter.sendMail(mailOptions, (error, info) => {
            if (error) console.error('Error sending email:', error);
            else console.log('Email sent: ' + info.response);
          });
        // });
      }
      else {
        console.log(peacekeeperData[0],"check_delgate");
        try{
        const imageName = `${peacekeeperData[0].random_id}.png`;
        const imagePath = path.join(__dirname, "../uploads/ticket_qr", imageName);
        const qr_url = `${peacekeeperData[0].qr_url}`;
        console.log(qr_url, "qr_url");
        async function generateQRCodeWithImage(imagePath, qr_url) {
          try {
            // Define paths
            const logoPath = path.join(__dirname, "../uploads/delegate_qr", "Logo.png"); // Logo path

            const qrCodeBuffer = await qrcode.toBuffer(qr_url, {
              errorCorrectionLevel: 'H', // High error correction for logo overlay
              scale: 10,// Scale for higher resolution QR code
              margin: 1
            });

            // Get QR code dimensions
            const qrDimensions = await sharp(qrCodeBuffer).metadata();
            const logoSize = Math.floor(qrDimensions.width / 4); // Resize logo to 1/4 of the QR code size

            // Apply circular mask to the logo and enhance quality
            const logoBuffer = await applyCircleMaskToLogo(logoPath, logoSize);

            // Process the QR code with the logo overlay
            await sharp(qrCodeBuffer)
              .resize(qrDimensions.width, qrDimensions.height) // Ensure QR code is correct size
              .composite([{
                input: logoBuffer,
                gravity: 'center', // Center the logo in the middle
                blend: 'over', // Overlay the logo onto the QR code
              }])
              .toFile(imagePath); // Save the final image

            console.log("QR Code with sharp logo saved at:", imagePath);
          } catch (error) {
            console.error("Error generating QR code:", error);
          }
        }

        // Function to apply circular mask to the logo and sharpen it
        async function applyCircleMaskToLogo(logoPath, logoSize) {
          const logoImage = await sharp(logoPath)
            .resize(logoSize, logoSize) // Resize logo to desired size
            .toBuffer();

          // Create a circular mask for the logo
          const circleMask = Buffer.from(
            `<svg width="${logoSize}" height="${logoSize}">
                    <circle cx="${logoSize / 2}" cy="${logoSize / 2}" r="${logoSize / 2}" fill="white" />
                </svg>`
          );

          // Apply circular mask on logo and sharpen the image
          return sharp(logoImage)
            .composite([{ input: circleMask, blend: 'dest-in' }]) // Apply mask to the logo
            .sharpen(2) // Apply sharpening for better clarity
            .toBuffer();
        }

        // Example Usage
        await generateQRCodeWithImage(imagePath, qr_url);

        const destFolder = path.join(__dirname, "../uploads/Ticket_photo");
        const baseImagePath = path.join(__dirname, "../uploads/delegate_qr/FinalTicket.png");
        console.log(baseImagePath, "baseImagePath");

        logError(baseImagePath);
        const qrCodePath = path.join(__dirname, `../uploads/ticket_qr/${peacekeeperData[0].random_id}.png`);
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

        //   logError("hi");

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

        var name = `${peacekeeperData[0].title}. ${peacekeeperData[0].first_name} ${peacekeeperData[0].last_name}`;
        drawVerticalText(ctx, name, 400, 1450, 260, "#005B94"); // Name on the left
        drawVerticalText(ctx, "Delegate", 850, 1350, 200, "green");

        const address = "North Halls\nExhibition\nCentre (DEC),\nExpo City, \nDubai";
        drawVerticalText1(ctx, address, 6600, 1360, 160, "#005B94");

        const qrCodeX = 6220, qrCodeY = 1600, qrCodeWidth = 1225, qrCodeHeight = 1250;
        ctx.drawImage(qrCode, qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);

        // Save the output image
        const outputFilePath = path.join(destFolder, `${peacekeeperData[0].random_id}.png`);
        logError(outputFilePath);
        const out = fs.createWriteStream(outputFilePath);
        const stream = canvas.createPNGStream();
        stream.pipe(out);

        out.on("finish", async () => {
          console.log(`Badge saved as PNG at: ${outputFilePath}`);

          const destFolderPdf = path.join(__dirname, "../uploads/Ticket_pdf");
          const pdfFilePath = path.join(destFolderPdf, `${peacekeeperData[0].random_id}.pdf`);
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

      }
      catch (err) {
        console.error("Error generating ticket:", err);
        logError(err.message);
      }
        const mailOptions = {
          from: 'Peacekeeper@global-jlp-summit.com',
          to: `${session.customer_email}`,
          //to: "udayshimpi2000@gmail.com",
          subject: 'Payment Confirmation',
          html: bodyContent,
          attachments: [
            {
              filename: `${peacekeeperData[0].random_id}.pdf`,
              path: path.join(__dirname, '../uploads/Ticket_pdf', `${peacekeeperData[0].random_id}.pdf`)
            }
          ]
        };
        await transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email:', error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
      }

      res.json({ success: true, session });
    }

    else {
      res.json({ success: false, message: 'Payment not completed' });
    }
  } catch (error) {
    logError(error);
    res.status(500).json({ error: error.message });
  }


};



module.exports = {
  createDelegateProfile,
  createNominateProfile,
  verify_session_status
};
