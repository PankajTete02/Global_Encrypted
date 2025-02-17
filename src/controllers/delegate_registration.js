const Delegatedetails = require("../models/delegate_registration");
const wspMsg = require("../../middlewares/whatsapp");
const emailMsg = require("../../middlewares/email")
const badge = require("../middleware/badge_pdf")
const qr_code = require("../middleware/qrcode_urn_no")
const notification = require("../../middlewares/email")
const fs = require('fs');
const path = require('path');
const IP=require('ip');
const { log, count } = require("console");
const {VerifyToken,encrypt}=require("../middleware/auth");


exports.Delegatedetails = async function (req, res) {
  const new_details = new Delegatedetails(req.body);
  userEmail = req.body.email_id;
  username = req.body.title + ' ' + req.body.first_name + ' ' + req.body.last_name
 

  try {
    const details = await new Promise((resolve, reject) => {
      Delegatedetails.create(new_details, function (err, details) {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(details);
        }
      });
    });
    if (details[0][0].response === "fail") {
      console.log(userEmail, username);
      return res.json({
        success: false,
        error: true,
        message: "This email already exist in this Form",
      });
    }
    else if (details[0][0].response === "fail1") {
      console.log(userEmail, username);
      return res.json({
        success: false,
        error: true,
        message: "This mobile number already exist in this Form ",
      });
    }
    else {
      console.log(userEmail, username);

      console.log(details);
      console.log(details[0][0]);
      console.log(details[1][0]);
      console.log(details[1][0].new_urn);
      const qrCodeBuffer = qr_code.generateQRCode_URN_NO(details[1][0].new_urn);
      console.log(qrCodeBuffer);

      await emailMsg.registrationEmail(userEmail, username);
      await notification.NotificationEmailtoAdmin(req.body)

      return res.json({
        success: true,
        error: false,
        message: "Details Added Successfully!",
      });

    }
  }
  // });
  // }
  catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: true,
      message: "Something went wrong. Please try again.",
    });
  }
};
// ------------------------------------------------------------------------------------------------------------------------
exports.findAll = function (req, res) {
  Delegatedetails.findAll(function (err, details) {
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
// ------------------------------------Delegate Form ------------------------------------------------------------------
exports.findById = async function (req, res) {
  try {
    // Verify the token
    const auth = await VerifyToken(req, res);
    console.log(auth, "auth");

    // Fetch the delegate details
    Delegatedetails.findById(req, res, auth, async function (err, Details) {
      if (err) {
        console.log(err);
        return res.status(400).json({
          status: false,
          error: true,
          message: "Something went wrong. Please try again.",
        });
      }

      console.log(Details[0].status, "Details");
      const encrypted_data = await encrypt(Details);
      console.log(encrypted_data, "encrypted_data");

      if (Details[0].status == 1) {
        return res.json({
          success: false,
          error: true,
          message: Details[0].result,
        });
      } else {
        return res.json({
          data: encrypted_data,
          success: true,
          error: false,
          message: "Delegate Details fetched successfully!",
        });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: true,
      message: "Internal Server Error. Please try again.",
    });
  }
};


// ==============Approve-Delegate=========

exports.findByApproved = async function (req, res) {
  try {
    // Verify the token
    const auth = await VerifyToken(req, res);
    const authId = auth.user_id;

    console.log("Authenticated User ID:", authId);

    // Extract parameters from request body
    const { page_no, page_size, search, sort_column, sort_order } = req.body;
    console.log(req.body,"req.body");
    
    // Call the model function
    Delegatedetails.findByApproved(
      authId,
      page_no,
      page_size,
      search,
      sort_column,
      sort_order,
      function (err, data) {
        if (err) {
          console.error("Database Error:", err);
          return res.status(400).json({
            success: false,
            error: true,
            message: "Something went wrong. Please try again.",
          });
        }
        // console.log(data,"data[0]");
        // console.log(data[0][0],"data[0][1]");

        console.log(data[1][0].total_records, "total_records");
        return res.json({
          success: true,
          error: false,
          message: "Approved Delegate Details fetched successfully!",
          totalCount: data[1][0].total_records,  // Include total count
          data: data[0]
        });
      }
    );
  } catch (error) {
    console.error("Error during token verification:", error);
    return res.status(500).json({
      success: false,
      error: true,
      message: "Internal Server Error. Please try again.",
    });
  }
};



//-------------------------------------Partner Form ----------------------------------------------

exports.findByPartner = function (req, res) {
  Delegatedetails.findByPartner(
    function (err, Details) {
      if (err) {
        console.log(err);
        return res.status(400).json({
          status: false,
          error: true,
          message: "Something went wrong. Please try again.",

        });
      }
      else
        // console.log("avbsbs", Details);
        return res.json({
          data: Details,
          success: true,
          error: false,
          message: "Partner Details fetched successfully!",
        });
    }
  );
}

// //==============Approve Partner ==============

exports.findByApprovePartner = function (req, res) {
  Delegatedetails.findByApprovePartner(
    function (err, Details) {
      if (err) {
        console.log(err);
        return res.status(400).json({
          status: false,
          error: true,
          message: "Something went wrong. Please try again.",

        });
      }
      else
        // console.log("avbsbs", Details);
        return res.json({
          data: Details,
          success: true,
          error: false,
          message: "Approve Partner Details fetched successfully!",
        });
    }
  );
}

// --------------------------------------Speaker Form data---------------------------------------------------------
exports.findBySpeaker = function (req, res) {
  Delegatedetails.findBySpeaker(
    function (err, Details) {
      if (err) {
        console.log(err);
        return res.status(400).json({
          status: false,
          error: true,
          message: "Something went wrong. Please try again.",
        });
      }
      else
        // console.log("avbsbs", Details);
        return res.json({
          data: Details,
          success: true,
          error: false,
          message: "Speaker Details fetched successfully!",
        });
    }
  );
}
// ================Approve-Speaker===================
exports.findByApproveSpeaker = function (req, res) {
  Delegatedetails.findByApproveSpeaker(
    function (err, Details) {
      if (err) {
        console.log(err);
        return res.status(400).json({
          status: false,
          error: true,
          message: "Something went wrong. Please try again.",
        });
      }
      else
        // console.log("avbsbs", Details);
        return res.json({
          data: Details,
          success: true,
          error: false,
          message: "Approve Speaker Details fetched successfully!",
        });
    }
  );
}
// -------------------------------------------------------------------------------------------------------------------------------
exports.update_approve = function (req, res) {
  console.log(req.params.user_id);
  Delegatedetails.update_approve(req.params.user_id, function (err, details) {
    if (err) {
      console.log(err);
      return res.status(400).json({
        status: false,
        error: true,
        message: "Something went wrong. Please try again.",

      });
    }
    else {
      return res.json({
        success: true,
        error: false,
        message: " Form Details Apporove Successfully!",
      });
    }
  });
}

// ---------------------------------------------------------------------------------------------------------------------------
exports.update_unapprove = function (req, res) {
  console.log(req.params.user_id);
  Delegatedetails.update_unapprove(req.params.user_id, function (err, details) {
    if (err) {
      console.log(err);
      return res.status(400).json({
        status: false,
        error: true,
        message: "Something went wrong. Please try again.",

      });
    }
    else {
      return res.json({
        success: true,
        error: false,
        message: " Form Details  Unapporove Successfully!",
      });
    }
  });
}

// --------------------------------------------Update All Status----------main-we using------------------------------------------------------

exports.update_status = function (req, res) {
  // const new_details = new Delegatedetails(req.body);
  const userIDs = req.body.user_id; // Example user IDs
  const statusType = req.body.status;   // Assuming 1 represents 'Approve'
  const userNames = req.body.user_name;
  const userEmails = req.body.user_email;
  const companys = req.body.company;
  const designations = req.body.designation;
  const updated_by = req.body.updated_by;
  const urn_nos = req.body.urn_no;
  const qr_codes = req.body.qr_code
  const userNumbers = req.body.user_number;
  const formName = req.body.form_name;

  console.log("usernames",userNames);
  async function unapprovalMessage(userId, userName, company, designation, userEmail, urn_no, qr_code, statusType, userNumber) {
    await emailMsg.email('', userName, company, designation, userEmail, urn_no, qr_code, statusType).then((message) => {
      console.log(`Email message sent with SID: ${message}`);
      return message;
    }).then(async (message) => {
      await wspMsg.sendWhatsAppMessage(userName, company, designation, urn_no, statusType, userNumber).then((message) => {
        console.log(`WhatsApp message sent with SID: ${message.sid}`);
      }).then(() => {
        Delegatedetails.update_status(userId, statusType, updated_by, '', (err, results) => {
          if (err) {
            console.error("err", err);
            return res.status(500).json({ error: 'An error occurred' });
          }
        })
      })
        .catch((error) => {
          console.error(`Error sending WhatsApp message: ${error.message}`);
          return error;
        });
      return message;
    })
      .catch((error) => {
        console.error(`Error sending Email: ${error.message}`);
        return error;
      });
  }
  // console.log("controller", body);
  if (statusType === 1 || statusType === 2) {
    if (userIDs.includes(",")) {
      if (!(userNames.includes(",") && userEmails.includes(",") && companys.includes(",") && designations.includes(",") && urn_nos.includes(",")
        && qr_codes.includes("|") && userNumbers.includes(","))) {
        return res.json({
          message: 'Invalid request! Found multiple IDs but no corresponding data',
          success: false,
          error: true,
        });
      }
      let userIds = userIDs.split(",");
      let userName = userNames.split(",");
      let userEmail = userEmails.split(",");
      let company = companys.split(",");
      let designation = designations.split(",");
      let urn_no = urn_nos.split(",");
      let qr_code = qr_codes.split("|");
      let userNumber = userNumbers.split(",");

      userIds.forEach(function (userId, i) {
        if (statusType === 2) {
          unapprovalMessage(userId, userName[i], company[i], designation[i], userEmail[i], urn_no[i], qr_code[i], statusType, userNumber[i]).then((message) => {
            console.error('approvad succesfully:', message);
            // return res.json({
            //   message: 'Status Updated Successfully!',
            //   success: true,
            //   error: false,
            // })
          })
            .catch((e) => {
              console.error('Unapproval error:', e);
              return res.status(500).send('An error occurred during Unapproving user.');
            });
          // })
          // return;
        }
        let filepath = `src/uploads/badges/${urn_no[i]}.pdf`;
        badge.generatePDF(userName[i], company[i], designation[i], userEmail[i], urn_no[i], qr_code[i], statusType, userNumber[i], filepath, formName).then((pdfBuffer) => {
          console.log("return filpath", filepath)
          Delegatedetails.update_status(userId, statusType, updated_by, filepath, (err, results) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ error: 'An error occurred' });
            }
          })
        }).catch((error) => {
          console.error('PDF generation error:', error);
          res.status(500).send('An error occurred during PDF generation.');
        });
      })
      return res.json({
        message: 'Status Updated Successfully!',
        success: true,
        error: false,
      });
    } else {
      if (statusType === 2) {
        unapprovalMessage(userIDs, userNames, companys, designations, userEmails, urn_nos, qr_codes, statusType, userNumbers).then((message) => {
          return res.json({
            message: 'Status Updated Successfully!',
            success: true,
            error: false,
          })
        }).catch((e) => {
          console.error('Unapproval error:', e);
          return res.status(500).send('An error occurred during Unapproving user.');
        });
        return;
      }
      let filepath = `src/uploads/badges/${urn_nos}.pdf`;
      badge.generatePDF(userNames, companys, designations, userEmails, urn_nos, qr_codes, statusType, userNumbers, filepath, formName).then((pdfBuffer) => {
        console.log("return filpath", filepath)
        Delegatedetails.update_status(userIDs, statusType, updated_by, filepath, (err, results) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'An error occurred' });
          }
          console.log("status", filepath, userNames, companys, designations, statusType, userEmails, urn_nos, qr_codes, userNumbers);
          
          return res.json({
            message: 'Status Updated Successfully!',
            success: true,
            error: false,
          });
        })
      }).catch((error) => {
        console.error('PDF generation error:', error);
        res.status(500).send('An error occurred during PDF generation.');
      });
    }
  }
  else {
    res.json({
      success: true,
      error: false,
      message: "invalid status!",
    });
  }
}

// --------------------------------------------------------------------------------------------------------------
exports.delete = function (req, res) {
  Delegatedetails.delete(req.body.user_id, function (err, role) {
    // console.log("res",role[0][0]);
    if (err) {
      console.log(err);
      return res.status(400).json({
        status: false,
        error: true,
        message: "Something went wrong. Please try again.",
      });
    }

    else if (role[0][0].response === "fail") {
      return res.status(404).send({
        success: false,
        error: true,
        message: "User does not exist with this id!",
      });
    }
    else {
      return res.json({
        success: true,
        error: false,
        message: "User deleted successfully!",
      });
    }
  });
};

// ----------------------------------------search delegate user---------------------------------------

exports.findBySearch_delegate_user = function (req, res) {
  console.log('.................', req.body);
  Delegatedetails.findBySearch_delegate_user(req.body, function (err, data) {
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

// ----------------------------------search partner user-----------------------------------------------------

exports.findBySearch_partner_user = function (req, res) {
  console.log('.................', req.body);
  Delegatedetails.findBySearch_partner_user(req.body, function (err, data) {
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

// ----------------------------------------------------------------------------------------------------------

exports.findBySearch_speaker_user = function (req, res) {
  console.log('.................', req.body);
  Delegatedetails.findBySearch_speaker_user(req.body, function (err, data) {
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

// =============================================search nonregistered========================================

exports.findBySearch_delegate_nonregistered = function (req, res) {
  // console.log('.................', req.body);
  Delegatedetails.findBySearch_delegate_nonregistered(req.body, function (err, data) {
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

// -------------------------------------------------------------------------------------------------------

exports.findBySearch_partner_nonregistered = function (req, res) {
  console.log('.................', req.body);
  Delegatedetails.findBySearch_partner_nonregistered(req.body, function (err, data) {
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

// -----------------------------------------------------------------------------------------------------------
exports.findBySearch_speaker_nonregistered = function (req, res) {
  console.log('.................', req.body);
  Delegatedetails.findBySearch_speaker_nonregistered(req.body, function (err, data) {
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

// ========================================================================================================

exports.microsite_get_already_exixts_delegate = function (req, res) {
  Delegatedetails.microsite_get_already_exixts_delegate(req.body.registration_type,req.body.email_id, req.body.mobile_number,req.body.urn_no, function (err, data) {
    if (err) {
      res.send(err);
    } else {
      if (data && data.length > 0) {
        res.json({
          message: "Data is already exists.",
          success: true,
          error: false,
          data: data,
        });
        //  Assuming data is an array and you want to process the first item
        //  const userData = data[0];
        //   badge.generatePDF(userData).then((pdfBuffer) => {
        //    console.log("2",pdfBuffer);
        //    // Handle the PDF buffer here (e.g., send it as a response)        
        //    res.setHeader('Content-Type', 'application/pdf');
        //    res.setHeader('Content-Disposition', 'attachment; filename=delegate.pdf');
        //    res.send(pdfBuffer);  
        //  })
        //  .catch((error) => {
        //    console.error('PDF generation error:', error);
        //    res.status(500).send('An error occurred during PDF generation.');
        //  });
      } else {
        res.json({
          message: "Record not found. Please enter correct details.",
          success: false,
          error: true,
        });
      }
    }
  });
};

//==========================================================================================


exports.microsite_get_already_exixts_partner = function (req, res) {
  Delegatedetails.microsite_get_already_exixts_partner(req.body.email_id, req.body.mobile_number,req.body.urn_no, function (err, data) {
    if (err) {
      res.send(err);
    } else {
      if (data && data.length > 0) {
        res.json({
          message: "Data is already exists",
          success: true,
          error: false,
          data: data,
        });
      } else {
        res.json({
          message: "Record not found. Please enter correct details.",
          success: false,
          error: true,
        });
      }
    }
  });
};

// =============================================================================================


exports.microsite_get_already_exixts_speaker = function (req, res) {
  Delegatedetails.microsite_get_already_exixts_speaker(req.body.email_id, req.body.mobile_number,req.body.urn_no, function (err, data) {
    if (err) {
      res.send(err);
    } else {

      if (data && data.length > 0) {

        console.log("hello");
        res.json({
          message: "Data is already exists",
          success: true,
          error: false,
          data: data
        });
        // Assuming data is an array and you want to process the first item
        const userData = data[0];


        //  badge.generatePDF(userData).then((pdfBuffer) => {
        //   console.log("2",pdfBuffer);
        //   // Handle the PDF buffer here (e.g., send it as a response)

        //   res.setHeader('Content-Type', 'application/pdf');
        //   res.setHeader('Content-Disposition', 'attachment; filename=converted.pdf');
        //   res.send(pdfBuffer);

        // })
        // .catch((error) => {
        //   console.error('PDF generation error:', error);
        //   res.status(500).send('An error occurred during PDF generation.');
        // });


      } else {
        res.json({
          message: "Record not found. Please enter correct details.",
          success: false,
          error: true,
        });
      }
    }
  });
};



// ..................................send email...............
exports.sendemail_Todelegte = function (req, res) {
  // const new_details = new Delegatedetails(req.body);
  const userIDs = req.body.user_id; // Example user IDs
  const statusType = 'email';   // Assuming 1 represents 'Approve'
  const userNames = req.body.user_name;
  const userEmails = req.body.user_email;
  const companys = req.body.company;
  const designations = req.body.designation;
  const urn_nos = req.body.urn_no;
  const qr_codes = req.body.qr_code
  const userNumbers = req.body.user_number;
  const formName = req.body.form_name;


  if (statusType === 'email') {
    {
      let filepath = `src/uploads/badges/${urn_nos}.pdf`;
      badge.generatePDF(userNames, companys, designations, userEmails, urn_nos, qr_codes, statusType, userNumbers, filepath, formName).then((pdfBuffer) => {
        console.log("return filpath", filepath)
        return res.json({
          message: 'Email sent successfully!',
          success: true,
          error: false,
        })
      }).catch((error) => {
        console.error('PDF generation error:', error);
        res.status(500).send('An error occurred during PDF generation.');
      });
    }
  }
  else {
    res.json({
      success: true,
      error: false,
      message: "invalid status!",
    });
  }
}

//...................regenerate badge ................

exports.geneateBadge_delegte = function (req, res) {
  // const new_details = new Delegatedetails(req.body);
  const userIDs = req.body.user_id; // Example user IDs
  const statusType = 'generate_badge';   // Assuming 1 represents 'Approve'
  const userNames = req.body.user_name;
  const userEmails = req.body.user_email;
  const companys = req.body.company;
  const designations = req.body.designation;
  const urn_nos = req.body.urn_no;
  const qr_codes = req.body.qr_code
  const userNumbers = req.body.user_number;
  const formName = req.body.form_name;

  if (statusType === 'generate_badge') {
    {
      let filepath = `src/uploads/badges/${urn_nos}.pdf`;
      badge.generatePDF(userNames, companys, designations, userEmails, urn_nos, qr_codes, statusType, userNumbers, filepath, formName).then((pdfBuffer) => {
        console.log("return filpath", filepath)
        return res.json({
          message: 'Badge generated successfully!',
          success: true,
          error: false,
        })
      }).catch((error) => {
        console.error('PDF generation error:', error);
        res.status(500).send('An error occurred during PDF generation.');
      });
    }
  }
  else {
    res.json({
      success: true,
      error: false,
      message: "invalid status!",
    });
  }
}


exports.download_badge = function (req, res) {
  try {
    // Get the "filepath" parameter from the request body (you might want to validate and sanitize it).
    const filepath = req.body.filepath;
    console.log(req.body.filepath)
    console.log(filepath);
    // Construct the full absolute path to the PDF file.
    const fullFilePath = path.join(__dirname, '..', '..', filepath);
    // const fullFilePath = path.join(__dirname, filepath);
    console.log("f", fullFilePath);
    // Check if the file exists.
    if (fs.existsSync(fullFilePath)) {
      // Read the file into a buffer.
      const fileBuffer = fs.readFileSync(fullFilePath);

      // Set the response headers for the download.
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=downloaded.pdf');

      // Send the file buffer as the response.
      res.send(fileBuffer);
    } else {
      // Handle the case where the file doesn't exist.
      res.status(404).send('File not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}


// ....................update details..........

exports.update_details = function (req, res) {
  const new_details = new Delegatedetails(req.body);

  Delegatedetails.update_details(new_details, function (err, details) {

    console.log(new_details);
    if (err) {
      console.log(err);
      return res.status(400).json({
        status: false,
        error: true,
        message: "Something went wrong. Please try again.",

      });
    }
    else {
      return res.json({
        success: true,
        error: false,
        message: "Details Updated Successfully!",
      });
    }
  });


}

exports.userById = function (req, res) {
  Delegatedetails.userById(req.body.user_id,
    function (err, Details) {
      if (err) {
        console.log(err);
        return res.status(400).json({
          status: false,
          error: true,
          message: "Something went wrong. Please try again.",
        });
      }
      else
        // console.log("avbsbs", Details);
        return res.json({
          data: Details,
          success: true,
          error: false,
          message: "Details fetched successfully!",
        });
    }
  );
};
// --------------------------------------cancelled users----------------------------------------------------------------------------------
exports.findAllCancelledUsersDelegates = function (req, res) {
  Delegatedetails.findAllCancelledUsersDelegates(function (err, details) {
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
        count: details[1][0].count,
        message: "details fetched successfully!",
      });
  });
};

exports.findAllCancelledUsersPartners = function (req, res) {
  Delegatedetails.findAllCancelledUsersPartners(function (err, details) {
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
        count: details[1][0].count,
        message: "details fetched successfully!",
      });
  });
};

exports.findAllCancelledUsersSpeakers = function (req, res) {
  Delegatedetails.findAllCancelledUsersSpeakers(function (err, details) {
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
        count: details[1][0].count,
        message: "details fetched successfully!",
      });
  });
};