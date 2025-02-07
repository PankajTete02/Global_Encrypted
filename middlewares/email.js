const { log } = require('handlebars');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const qrcode = require('qrcode');
const { body } = require('express-validator');
const config = process.env;



const transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com",
  secureConnection: false, // TLS requires secureConnection to be false
  port: 587,
  auth: {
    user: process.env.AuthMail, // Your email address
    pass: process.env.AuthPass, // Your email password or an app-specific password
  },
});
async function email(filepath, username, company, designation, userEmail, urn_no, qr_code, statusType) {

  console.log(process.env.AuthMail, process.env.AuthPass);

  console.log("email", username, company, designation, userEmail, urn_no, qr_code, statusType, filepath);
  if (statusType === 1 || statusType === 'email' || statusType === 'generate_badge') {
    var subject = "Registration Approved - Pharma Pre-connect";
    var body = `Dear ${username},

Thank you for showing interest & registering for Pharma Pre-connect Conference scheduled on 27th  Nov 2023 at Delhi.
 
Show timings: 10.00am to 6.00pm

Your online registration for the conference is complete. Please carry your badge (either in soft copy or print-out) 
This badge is non-transferrable.

Please find your registration details below:

URN No.	: ${urn_no}
Name	: ${username}
Company Name	: ${company}
Designation	: ${designation}
Conference Dates: 27th Nov 2023 
Venue: Le Meridian Hotel, New Delhi 
https://maps.app.goo.gl/Xg3uCwZAFmpgWJJp6

It is a pleasure to see you at the conference and you can count on us for delivering a highly successful participation. 
 

Regards,
Team CPHI Pharma Pre-connect Congress
 ` // Email body (plain text)
  }
  else {
    subject = "Registration Unapproved - Pharma Pre-connect",
      body = `Dear ${username},

We regret to inform you that your registration is rejected by the organizer.
    
Please note:
    
•  Registration is complimentary only for Pharma Drug manufacturing companies.

•  Registration is chargeable for all companies providing solutions to Pharma Drug manufacturing companies.

•  Registration entries are limited.

To know more on the charges, please contact Dimple Harchandani at Dimple.Harchandani@informa.com and mark Diya Thakkar at Diya.Thakkar@informa.com in CC


Regards,
Team CPHI Pharma Pre-connect Congress`// Email body (plain text)
  }
  // Email data 
  let mailOptions;
  console.log("path............", path.join(__dirname, `../`, filepath));

  if (statusType === 1 || statusType === 'email' || statusType === 'generate_badge') {
    mailOptions = {
      from: 'noreply@pharmapreconnectcongress.com', // Sender's email address
      to: userEmail, // Recipient's email address
      subject: subject, // Email subject
      text: body, // Email body (plain text)
      attachments: [
        {
          // filename: 'delegate.pdf',
          filename: `${urn_no}.pdf`,
          // path: path.join(__dirname, '../src/delegate.pdf'), // Adjust the path here
          path: path.join(__dirname, `../`, filepath), // Adjust the path here
        }
      ]
    };
  } else {
    mailOptions = {
      from: 'noreply@pharmapreconnectcongress.com', // Sender's email address
      to: userEmail, // Recipient's email address
      subject: subject, // Email subject
      text: body, // Email body (plain text)
    };
  }
  // Send email
  const res = await transporter.sendMail(mailOptions);
  console.log("Email sent with message ID:", res.messageId);
}


async function registrationEmail(userEmail, username) {

  console.log(process.env.AuthMail, process.env.AuthPass);

  let subject = "Registration Successful - Pharma Pre-connect";
  let body = `Dear ${username},

Thank you for showing interest in Pharma Pre-connect Conference.

Your registration screening is under process once validated you will receive your entry badge on WhatsApp and Email.


Regards,
Team CPHI Pharma Pre-connect Congress 
`
  // Email data
  const mailOptions = {
    from: 'noreply@pharmapreconnectcongress.com', // Sender's email address
    to: userEmail, // Recipient's email address
    subject: subject, // Email subject
    text: body, // Email body (plain text)
  };


  // Send email
  const res = await transporter.sendMail(mailOptions);
  console.log("Email message sent with message ID:", res.messageId);
}


async function NotificationEmailtoAdmin(userdata) {

  console.log("userdata notification", userdata);
  console.log(process.env.AuthMail, process.env.AuthPass);
  let form_name;
  if (userdata.registration_type === "1") {
    form_name = "Conference Delegate"
  } else if (userdata.registration_type === "2") {
    form_name = "Conference Partner"
  }
  else {
    form_name = "Conference Speaker"

  }

  let num;
  if (userdata.is_whatsapp_number === true) {
    num = "Yes"
  }
  else {
    num = "No"
  }
  let term;
  if (userdata.terms_condition === true) {
    term = "Yes"
  }
  else {
    term = "No"
  }
  let subject = `Enquiry Details - New ${form_name}`;

  // Define the email content in HTML format with a table
  const body = `
  <html>
  <head>
  <style>
  table, th, td {
    border: 1px solid black;
    border-collapse: collapse;
  }
  .row-height {
    height: 50px; /* Adjust the height value as needed */
  }
  .cell-padding {
    padding: 10px; /* Adjust the padding as needed */
  }
    table {
      width: 100%;
    }

  </style>
</head>
    <body>
      <h4>Enquiry Details</h4>
      <table>
        <tr class="row-height">
          <td style="width: 75%;"   class="cell-padding"
          >Name</td>
          <td style="width: 25%;"  class="cell-padding"
          >${userdata.title} ${userdata.first_name} ${userdata.last_name}</td>
        </tr>
        <tr class="row-height">
          <td style="width: 75%;" class="cell-padding">Department</td>
          <td style="width: 25%;" class="cell-padding">${userdata.department}</td>
        </tr>
        <tr class="row-height">
          <td style="width: 75%;" class="cell-padding">Designation</td>
          <td style="width: 25%;" class="cell-padding">${userdata.designation}</td>
        </tr>
        <tr class="row-height">
        <td style="width: 75%;" class="cell-padding">Mobile</td>
        <td style="width: 25%;" class="cell-padding">${userdata.mobile_number}</td>
      </tr>
      <tr class="row-height">
      <td style="width: 75%;" class="cell-padding">Email</td>
      <td style="width: 25%;"class="cell-padding">${userdata.email_id}</td>
    </tr>
    <tr class="row-height">
    <td style="width: 75%;"class="cell-padding">Company</td>
    <td style="width: 25%;"class="cell-padding">${userdata.company_name}</td>
  </tr>
  <tr class="row-height">
  <td style="width: 75%;"class="cell-padding">Address Line 1</td>
  <td style="width: 25%;"class="cell-padding">${userdata.address_line_1}</td>
</tr>
<tr class="row-height">
  <td style="width: 75%;"class="cell-padding">Country </td>
  <td style="width: 25%;"class="cell-padding">${userdata.country}</td>
</tr>
<tr class="row-height">
  <td style="width: 75%;"class="cell-padding">State</td>
  <td style="width: 25%;"class="cell-padding">${userdata.state}</td>
</tr>
<tr class="row-height">
  <td style="width: 75%;"class="cell-padding">City </td>
  <td style="width: 25%;"class="cell-padding">${userdata.city}</td>
</tr>
<tr class="row-height">
  <td style="width: 75%;"class="cell-padding">Pincode </td>
  <td style="width: 25%;"class="cell-padding">${userdata.pin_code}</td>
</tr>
<tr class="row-height">
  <td style="width: 75%;"class="cell-padding">Which day would you like to attend conference on? </td>
  <td style="width: 25%;"class="cell-padding">${userdata.conference_day}</td>
</tr>
<tr class="row-height">
  <td style="width: 75%;"class="cell-padding">Interested in attending as </td>
  <td style="width: 25%;"class="cell-padding">${form_name}</td>
</tr>
<tr class="row-height">
  <td style="width: 75%;"class="cell-padding">How did you learn about the confex</td>
  <td style="width: 25%;"class="cell-padding"></td>
</tr>
<tr class="row-height">
  <td style="width: 75%;"class="cell-padding">utm_campaign </td>
  <td style="width: 25%;"class="cell-padding"></td>
</tr>
<tr class="row-height">
  <td style="width: 75%;"class="cell-padding">utm_medium </td>
  <td style="width: 25%;"class="cell-padding"></td>
</tr>
<tr class="row-height">
  <td style="width: 75%;"class="cell-padding">utm_source </td>
  <td style="width: 25%;"class="cell-padding"></td>
</tr>
<tr class="row-height">
  <td style="width: 75%;"class="cell-padding">utm_content </td>
  <td style="width: 25%;"class="cell-padding"></td>
</tr>
<tr class="row-height">
  <td style="width: 75%;"class="cell-padding">utm_term </td>
  <td style="width: 25%;"class="cell-padding">${term}</td>
</tr>
<tr class="row-height">
  <td style="width: 75%;"class="cell-padding">I Confirm that my Whatsapp number is same as the mobile number registered above. I also provide my consent to Informa Markets India Pvt Ltd for sending messages/notifications on my whatsapp number. </td>
  <td style="width: 25%;"class="cell-padding">${num}</td>
</tr>
      </table>
      <br><br>
Regards,
<br>
Team CPHI Pharma Pre-connect Congress 
    </body>
  </html>
`;
  // Email data
  const mailOptions = {
    from: 'noreply@pharmapreconnectcongress.com', // Sender's email address
    to: 'Sheron.david@informa.com', // Recipient's email address
    subject: subject, // Email subject
    html: body, // Email body as HTML
  };


  // Send email
  const res = await transporter.sendMail(mailOptions);
  console.log("Email notification sent with message ID:", res.messageId);
}


async function delegate_user_email(res, response) {
  console.log("resssss", response);
  console.log("resssss1", response[0]);
  const name = `${response[0].full_name}`;
  console.log(name, "name");

  const htmlFilePath = path.join(__dirname, '../src/middleware/badge-html/delegate_qr_code.html');
  const imageName = `${response[0].coupon_code}.png`;
  const imagePath = path.join(__dirname, '../src/uploads/delegate_qr/', imageName); // Correct path for saving the image
  const qrCodeUrl = "https://devglobaljusticeapis.cylsys.com/uploads/delegates/AC8113INCHH5XM1T.png";
  console.log(qrCodeUrl, "qrCodeUrl");

  // Generate the QR code and save it to a file
  const qrCodeBuffer = await qrcode.toBuffer(response[0].url);
  fs.writeFileSync(imagePath, qrCodeBuffer);
  console.log(`QR Code saved to: ${imagePath}`);

  // Read the HTML file
  let htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');



  // Replace placeholders in the HTML content
  htmlContent = htmlContent.replace('{{name}}', response[0].full_name);
  // console.log(htmlContent,"xzxzx");
  htmlContent = htmlContent.replace('{{coupon_code}}', `${qrCodeUrl}`);

  const transporter = nodemailer.createTransport({
    service: 'gmail', // or use any other email provider
    auth: {
      user: 'Peacekeeper@global-jlp-summit.com', // your email address
      pass: 'tusi xeoi hxoz fwwb'   // your email password
    }
  });
//   const body=`<!DOCTYPE html>
// <html>
//   <head>
//     <meta charset="utf-8" />
//     <title>Meeting Request</title>
//     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//     <style>
//       .mq {
//         width: 710px;
//       }

//       /* Extra small devices (phones, 600px and down) */
//       @media only screen and (max-width: 600px) {
//         .mq {
//           width: 300px;
//         }
//         .mqfont {
//           font-size: 16px;
//         }
//       }

//       /* Small devices (portrait tablets and large phones, 600px and up) */
//       @media only screen and (min-width: 600px) {
//         .mq {
//           width: 300px;
//         }
//       }

//       /* Medium devices (landscape tablets, 768px and up) */
//       @media only screen and (min-width: 768px) {
//         .mq {
//           width: 710px;
//         }
//       }

//       /* Large devices (laptops/desktops, 992px and up) */
//       @media only screen and (min-width: 992px) {
//         .mq {
//           width: 710px;
//         }
//       }

//       /* Extra large devices (large laptops and desktops, 1200px and up) */
//       @media only screen and (min-width: 1200px) {
//         .mq {
//           width: 710px;
//         }
//       }
//       .mqimg {
//         width: 100px !important;
//       }
//       .mqimg1 {
//         width: 100px !important;
//       }
//       .mqimg1 {
//         width: 100px !important;
//       }
//     </style>
//   </head>
//   <body style="padding: 0px; margin: 0px">
//     <table
//       width="100%"
//       border="0"
//       cellspacing="0"
//       cellpadding="0"
//       align="center"
//       style="
//         font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, sans-serif;
//       "
//     >
//       <tbody>
//         <tr>
//           <td>
//             <table
//               width="710"
//               border="0"
//               cellspacing="0"
//               cellpadding="5"
//               align="center"
//             >
//             <tbody>
//               <tr>
//                 <td style="padding: 0;">
//     <img src="https://devglobaljusticeapis.cylsys.com/uploads/head.png" alt="head.png" width="100%">
//   </td>
//               </tr>
//             </tbody>
//           </table>
//           </td>
//         </tr>
//         <tr>
//           <td>
//             <table
//               width="710"
//               border="0"
//               cellspacing="0"
//               cellpadding="5"
//               align="center"
//               style="
//                 background: linear-gradient(180deg, #bdc78c2e 0%, #bdc78c 100%);
//               "
//             >
//               <tbody>
//                 <tr>
//                   <td>
//                     <table style="padding: 0 50px">
//                       <tbody>
//                         <tr>
//                           <td>
//                             <table
//                               width="100%"
//                               border="0"
//                               cellspacing="0"
//                               cellpadding="0"
//                             >
//                               <tbody>
//                                 <tr>
//                                   <td
//                                     style="
//                                       font-size: 18px;
//                                       line-height: 25px;
//                                       font-family: Gotham, 'Helvetica Neue',
//                                         Helvetica, Arial, sans-serif;
//                                     "
//                                   >
//                                     <p><b>Hi ${response[0].full_name},</b></p>
//                                     <p
//                                       style="
//                                         font-size: 14px;
//                                         font-weight: 500;
//                                         line-height: 22px;
//                                         text-align: left;
//                                         text-underline-position: from-font;
//                                         text-decoration-skip-ink: none;
//                                       "
//                                     >
//                                       Thank you for joining the movement for
//                                       Global Justice, Love and Peace. Attached
//                                       is your unique QR code, which unlocks
//                                       exciting benefits for you.
//                                     </p>
//                                   </td>
//                                 </tr>
//                               </tbody>
//                             </table>
//                           </td>
//                         </tr>
//                         <tr>
//                           <td>
//                             <table
//                               width="100%"
//                               border="0"
//                               cellspacing="0"
//                               cellpadding="0"
//                               style="padding: 0"
//                             >
//                               <tbody>
//                                 <tr>
//                                   <td align="center">
//                                     <img
//                                       src="qr_code.png"
//                                       alt=""
//                                       style="width: 50%"
//                                     />
//                                   </td>
//                                   <td align="center">
//                                     <button
//                                       style="
//                                         background: #128940;
//                                         width: 193px;
//                                         height: 43px;
//                                         top: 425px;
//                                         left: 367px;
//                                         gap: 0px;
//                                         border-radius: 5px;
//                                         border: none;
//                                         opacity: 0px;
//                                         color: #fff;
//                                         box-shadow: 0px 0px 5px 1px #12894066;
//                                         cursor: pointer;
//                                       "
//                                     >
//                                       Download QR Code
//                                     </button>
//                                     <br />
//                                     <br />
//                                     <img src="cid:qrCodeImage" alt="QR Code" style="width:200px; height:200px;" />

//                                     <p
//                                       style="
//                                         font-size: 12px;
//                                         font-weight: 400;
//                                         text-align: center;
//                                         text-underline-position: from-font;
//                                         text-decoration-skip-ink: none;
//                                       "
//                                     >
//                                       Alternatively you can click
//                                       <a
//                                         style="
//                                           color: #148ad6;
//                                           text-decoration: none;
//                                         "
//                                         href="http://"
//                                         target="_blank"
//                                         rel="noopener noreferrer"
//                                         >
//                                         ${qrCodeUrl}
//                                         </a
//                                       >
//                                     </p>
//                                   </td>
//                                 </tr>
//                               </tbody>
//                             </table>
//                           </td>
//                         </tr>
//                         <tr>
//                           <td>
//                             <table
//                               width="100%"
//                               border="0"
//                               cellspacing="0"
//                               cellpadding="0"
//                             >
//                               <tbody>
//                                 <tr>
//                                   <td>
//                                     <ul
//                                       style="
//                                         font-size: 12px;
//                                         font-weight: 400;
//                                         line-height: 30px;
//                                         text-align: left;
//                                         text-underline-position: from-font;
//                                         text-decoration-skip-ink: none;
//                                         padding: 0;
//                                       "
//                                     >
//                                       <li>
//                                         Your Benefit: Enjoy a 7% discount on
//                                         your own registration when using this QR
//                                         code.
//                                       </li>
//                                       <li>
//                                         Your Reward: Earn a 7% incentive for
//                                         every successful registration completed
//                                         through your QR code.
//                                       </li>
//                                       <li>
//                                         Share your QR code widely with those who
//                                         align with our mission, and let’s create
//                                         a ripple effect of justice, love, and
//                                         peace together.
//                                       </li>
//                                     </ul>
//                                   </td>
//                                 </tr>
//                                 <tr>
//                                   <td
//                                     style="
//                                       font-size: 14px;
//                                       font-weight: 500;
//                                       line-height: 22px;
//                                       text-align: left;
//                                       text-underline-position: from-font;
//                                       text-decoration-skip-ink: none;
//                                     "
//                                   >
//                                     <br /><br />
//                                     Looking forward to welcoming you to Dubai on
//                                     13th April 2025.
//                                     <br /><br />
//                                   </td>
//                                 </tr>
//                                 <tr>
//                                   <td>
//                                     <p
//                                       style="
//                                         font-size: 14px;
//                                         font-weight: 400;
//                                         line-height: 22px;
//                                         text-align: left;
//                                         text-underline-position: from-font;
//                                         text-decoration-skip-ink: none;
//                                         margin: 0;
//                                       "
//                                     >
//                                       Warm regards,
//                                     </p>
//                                     <p
//                                       style="
//                                         font-size: 14px;
//                                         font-weight: 600;
//                                         line-height: 22px;
//                                         text-align: left;
//                                         text-underline-position: from-font;
//                                         text-decoration-skip-ink: none;
//                                         margin: 0;
//                                         color: #005a93;
//                                       "
//                                     >
//                                       The Global Justice, Love & Peace Summit
//                                       Team
//                                     </p>
//                                   </td>
//                                 </tr>
//                               </tbody>
//                             </table>
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>
//                     <br /><br />
//                   </td>
//                 </tr>
//                 <tr>
//                   <td>
//                     <table
//                       width="100%"
//                       border="0"
//                       cellspacing="0"
//                       cellpadding="0"
//                       style="
//                         border-top: 1px solid #fff;
//                         border-bottom: 1px solid #fff;
//                       "
//                     >
//                       <tbody>
//                         <tr>
//                           <td>
//                             <table width="100%">
//                               <tbody>
//                                 <tr>
//                                   <td align="center">
//                                     <p
//                                       style="
//                                         font-size: 10px;
//                                         font-weight: 400;
//                                         line-height: 18px;
//                                         text-align: center;
//                                         text-underline-position: from-font;
//                                         text-decoration-skip-ink: none;
//                                       "
//                                     >
//                                       For any assistance or support, please
//                                       reach out to us at
//                                       <a
//                                         style="color: #0573ba"
//                                         href="mailto:help@justice-love-peace.com"
//                                         >help@justice-love-peace.com</a
//                                       >
//                                       <br />
//                                       Explore more on our website:
//                                       <a
//                                         style="color: #0573ba"
//                                         href="www.justice-love-peace.com"
//                                         target="_blank"
//                                         rel="noopener noreferrer"
//                                         >www.justice-love-peace.com</a
//                                       >
//                                     </p>
//                                   </td>
//                                 </tr>
//                               </tbody>
//                             </table>
//                           </td>
//                         </tr>
//                         <tr>
//                           <td align="center">
//                             <table width="100%" style="padding: 1rem 12rem">
//                               <tbody>
//                                 <tr>
//                                   <td align="center">
//                                     <a
//                                       href="https://www.instagram.com/globaljusticelovepeacesummit/
//                                               "
//                                       target="_blank"
//                                       rel="noopener noreferrer"
//                                       ><img
//                                         src="https://www.justice-love-peace.com/assets/UIComponents/images/insta.svg"
//                                         alt=""
//                                     /></a>
//                                   </td>
//                                   <td align="center">
//                                     <a
//                                       _ngcontent-iqa-c29=""
//                                       href="https://www.facebook.com/GlobalJusticeLoveandPeaceSummit
//                           "
//                                       target="_blank"
//                                       rel="noopener noreferrer"
//                                       ><img
//                                         _ngcontent-iqa-c29=""
//                                         src="https://www.justice-love-peace.com/assets/UIComponents/images/fb.svg"
//                                         alt=""
//                                     /></a>
//                                   </td>
//                                   <td align="center">
//                                     <a
//                                       _ngcontent-iqa-c29=""
//                                       href="https://www.youtube.com/@GlobalJusticeLovePeaceSummit/videos"
//                                       target="_blank"
//                                       rel="noopener noreferrer"
//                                       ><img
//                                         _ngcontent-iqa-c29=""
//                                         src="https://www.justice-love-peace.com/assets/UIComponents/images/youtube.svg"
//                                         alt=""
//                                     /></a>
//                                   </td>
//                                   <td align="center">
//                                     <a
//                                       _ngcontent-iqa-c29=""
//                                       href="https://wa.me/+91 9324064978"
//                                       target="_blank"
//                                       rel="noopener noreferrer"
//                                       ><img
//                                         _ngcontent-iqa-c29=""
//                                         src="https://www.justice-love-peace.com/assets/UIComponents/images/whatsApp.svg"
//                                         alt=""
//                                     /></a>
//                                   </td>
//                                   <td align="center">
//                                     <a
//                                       _ngcontent-iqa-c29=""
//                                       href="https://www.linkedin.com/company/global-justice-love-peace-summit-2025/posts/?feedView=all"
//                                       target="_blank"
//                                       rel="noopener noreferrer"
//                                       ><img
//                                         _ngcontent-iqa-c29=""
//                                         src="https://www.justice-love-peace.com/assets/UIComponents/images/linkedIn.svg"
//                                         alt=""
//                                     /></a>
//                                   </td>
//                                 </tr>
//                               </tbody>
//                             </table>
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </td>
//                 </tr>
//                 <tr>
//                   <td align="center">
//                     <table>
//                       <tbody>
//                         <tr>
//                           <td
//                             align="center"
//                             style="
//                               font-size: 10px;
//                               font-weight: 400;
//                               line-height: 12.88px;
//                               text-align: center;
//                               text-underline-position: from-font;
//                               text-decoration-skip-ink: none;
//                             "
//                           >
//                             © 2025 Global Justice, Love & Peace Summit. All
//                             rights reserved.
//                             <br />
//                             <br />
//                           </td>
//                         </tr>
//                         <tr>
//                           <td
//                             align="center"
//                             style="
//                               font-size: 10px;
//                               font-weight: 400;
//                               line-height: 12.88px;
//                               text-align: center;
//                               text-underline-position: from-font;
//                               text-decoration-skip-ink: none;
//                             "
//                           >
//                             You are receiving this message because you
//                             registered to join the movement for Global Justice,
//                             Love, and <br />
//                             Peace. By signing up, you agreed to our Terms of Use
//                             and Privacy Policies.
//                           </td>
//                         </tr>
//                         <tr>
//                           <td
//                             align="center"
//                             style="
//                               font-size: 10px;
//                               font-weight: 400;
//                               line-height: 12.88px;
//                               text-align: center;
//                               text-underline-position: from-font;
//                               text-decoration-skip-ink: none;
//                             "
//                           >
//                             <ul
//                               style="
//                                 display: flex;
//                                 padding: 0;
//                                 justify-content: space-between;
//                               "
//                             >
//                               <li>
//                                 <a
//                                   style="color: #333333"
//                                   href="https://www.justice-love-peace.com/accessibility"
//                                   target="_blank"
//                                   rel="noopener noreferrer"
//                                   >Accessibility</a
//                                 >
//                               </li>
//                               <li>
//                                 <a
//                                   style="color: #333333"
//                                   href="https://www.justice-love-peace.com/privacy-policy"
//                                   target="_blank"
//                                   rel="noopener noreferrer"
//                                   >Privacy policy</a
//                                 >
//                               </li>
//                               <li>
//                                 <a
//                                   style="color: #333333"
//                                   href="https://www.justice-love-peace.com/cookie-policy"
//                                   target="_blank"
//                                   rel="noopener noreferrer"
//                                   >Cookie Policy</a
//                                 >
//                               </li>
//                               <li>
//                                 <a
//                                   style="color: #333333"
//                                   href="https://www.justice-love-peace.com/terms-of-use"
//                                   target="_blank"
//                                   rel="noopener noreferrer"
//                                   >Terms of use</a
//                                 >
//                               </li>
//                               <li>
//                                 <a
//                                   style="color: #333333"
//                                   href="https://www.justice-love-peace.com/visitor-terms-conditions"
//                                   target="_blank"
//                                   rel="noopener noreferrer"
//                                   >Visitor Terms and Conditions</a
//                                 >
//                               </li>
//                             </ul>
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </td>
//         </tr>
//       </tbody>
//     </table>
//   </body>
// </html>`;
  const mailOptions = {
    from: 'Peacekeeper@global-jlp-summit.com',
    to: response[0].email_id, // Or use  if it exists
    subject: 'Delegate Profile Registration Successful',
    html:`<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
      <!-- Header Image -->
      <div style="text-align: center; background-color: #f4f4f4; padding: 10px;">
        <img src="cid:headerImage" alt="Header Image" style="width: 100%; max-width: 600px;" />
      </div>
      
      <!-- Body Content -->
      <div style="padding: 20px; text-align: center;">
        <p style="font-size: 18px; color: #333;">Hi ${response[0].full_name},</p>
        <p style="font-size: 16px; color: #555;">
          Thank you for joining the movement for Global Justice, Love, and Peace. Attached is your unique QR code, which unlocks exciting benefits for you.
        </p>
        <!-- QR Code Image -->
        <div style="margin: 20px 0;">
          <img src="cid:qrCodeImage" alt="QR Code" style="width: 200px; height: 200px; border: 1px solid #ddd; padding: 5px;" />
        </div>
        <p style="font-size: 16px; color: #555;">Your QR code unlocks exciting benefits. Don't forget to share it!</p>
        <a href="${qrCodeUrl}" download style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download QR Code</a>
      </div>

      <!-- Footer -->
      <div style="background-color: #f4f4f4; padding: 10px; text-align: center;">
        <p style="font-size: 14px; color: #666;">Warm regards,<br>The Global Justice, Love & Peace Summit Team</p>
        <p style="font-size: 12px; color: #999;">
          For any assistance, reach out at <a href="mailto:help@justice-love-peace.com" style="color: #007bff;">help@justice-love-peace.com</a>
        </p>
      </div>
    </div>
  `,
    attachments: [
      {
        filename: 'head.png',
        path: path.join(__dirname, '../src/middleware/assets/images/head.png'), // Make sure this path is correct
        cid: 'headerImage' // Use this Content-ID in the HTML
      },
      {
        filename: `${response[0].coupon_code}.png`, // Make sure response[0].coupon_code exists
        path: path.join(__dirname, '../src/uploads/delegate_qr/', `${response[0].coupon_code}.png`), // Ensure the QR code path is correct
        cid: 'qrCodeImage' // Same Content-ID as used in the HTML
      }
    ]
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
    message: "Delegate profile registered successfully. A confirmation email has been sent."
  });
}
// Export the sendWhatsAppMessage function so it can be used in other files
module.exports = {
  email: email,
  registrationEmail: registrationEmail,
  NotificationEmailtoAdmin: NotificationEmailtoAdmin,
  delegate_user_email
};
