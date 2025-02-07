const { log } = require("handlebars");
const contactModel = require("../models/contactfileModel");
const XLSX = require("xlsx");
const { body } = require("express-validator");
// const { verifyJwt } = require("../Controller/jwtAuth");
const dbConn = require("../../db.config").promise();

const contactController = {
   addBulkdetails: async (req, res) => {
    try {
      // Retrieve user details (ensure this logic is correct)
      // const userDetails = verifyJwt(req); // Ensure userDetails is available
      // if (!userDetails) {
      //   return res.status(401).json({
      //     success: false,
      //     error: true,
      //     message: "Unauthorized access!",
      //   });
      // }
  
      const newData = req.body;
  
      // Validate required fields
      // if (!newData.list_name) {
      //   return res.status(400).json({
      //     success: false,
      //     error: true,
      //     message: "List name is required!",
      //   });
      // }
  
      // Read the uploaded Excel file
      
      const excelFile = req.file;
      if (!excelFile) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "No file uploaded!",
        });
      }
  
      const workbook = XLSX.readFile(excelFile.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const dataArray = XLSX.utils.sheet_to_json(worksheet, { raw: false });
  
      // Process date values in the Excel data
      dataArray.forEach((entry) => {
        for (const key in entry) {
          if (!Object.prototype.hasOwnProperty.call(entry, key)) continue;
          const value = entry[key];
          if (typeof value === "number" && XLSX.SSF.is_date(value)) {
            const date = XLSX.SSF.parse_date_code(value);
            entry[key] = new Date(Date.UTC(date.y, date.m - 1, date.d));
          }
        }
      });
      
      // Validate contacts
      const validationResults = await validateContact(dataArray, newData);
      
      const { duplicatContactCount: dupEmailCount, invalidEmail: ignoredCount, dataArray: validatedContacts } = validationResults;
      let existingCount = 0;
      let newCount = 0;
      // console.log(newData.peacekeeper_id,"newDataaaapeacekeeper_id");
  
      // If step_1, return counts without saving data
      if (newData.status === "step_1") {
        for (let contact of validatedContacts) {
          // console.log(contact,"contactss");
          
          if (contact.isvalidcontact && !contact.isDuplicatecontact) {
            const result = await contactModel.validateConatctInListExistance(newData, newData.peacekeeper_id, contact.email_key);
            // console.log(result,"resultsss");
            
            if (result[0][0].response === "exist") {
              existingCount++;
            } else if (result[0][0].response === "new") {
              newCount++;
            }
          }
        }
        return res.json({
          success: true,
          error: false,
          message: "Count Fetched successfully!",
          dupEmailCount,
          ignoredCount: ignoredCount + dupEmailCount,
          reAddedContact: existingCount,
          newData: newCount,
          total: dataArray.length,
        });
      }
 
  
      // If complete, save contacts
      if (newData.status === "complete") {
        const Res_file_id = await contactModel.saveContactReview(
          excelFile.originalname,
          excelFile.path,
          excelFile.mimetype,
          dataArray.length,
          dupEmailCount,
          existingCount,
          ignoredCount + dupEmailCount,
          newCount,
          newData.peacekeeper_id
        );
        // console.log(Res_file_id,"Res_file_iddddd");
  
        const contact_file_id = Res_file_id[0][0].contact_file_id;
        // console.log(contact_file_id,"contact_file_id");
        // console.log(validatedContacts,"validatedContacts");
  
        for (let contact of validatedContacts) {
          if (contact.isvalidcontact && !contact.isDuplicatecontact) {
            const result = await contactModel.validateConatctInListExistance(newData, newData.peacekeeper_id, contact.email_key);
            // console.log(result,"result");
            
            if (result[0][0].response === "new") {
              const filteredContact = Object.fromEntries(
                Object.entries(contact).filter(
                  ([key]) => !["isvalidcontact", "isDuplicatecontact", "email_key"].includes(key)
                )
              );
  
              const keys = Object.keys(filteredContact);
              const values = Object.values(filteredContact);
  
              newCount++;
  
              await contactModel.addBulkdetails(
                newData,
                contact,
                contact.email_key,
                keys,
                values,
                newData.peacekeeper_id,
                filteredContact,
                contact_file_id
              );
            } else {
              existingCount++;
            }
          }
        }
  
        const totalValidationCount = ignoredCount + dupEmailCount + existingCount;
        if (dataArray.length === totalValidationCount) {
          return res.status(400).json({
            success: true,
            error: false,
            message: "Contact Details already exist!",
            dupEmailCount,
            ignoredCount: ignoredCount + dupEmailCount,
            reAddedContact: existingCount,
            newData: newCount,
            total: dataArray.length,
          });
        }
  
        return res.status(200).json({
          success: true,
          error: false,
          message: "Contact Details uploaded successfully!",
          dupEmailCount,
          ignoredCount: ignoredCount + dupEmailCount,
          reAddedContact: existingCount,
          newData: newCount,
          total: dataArray.length,
        });
      }
    } catch (err) {
      console.error("Error inserting data:", err);
      res.status(500).json({ message: err.message });
    }
  },

  getAllContacts: async (req, res) => {
    try {
      // const userDetails = verifyJwt(req);

      // const userDetails =  6;
      // console.log(req.body);
      

      let list_id = req.body.list_id;
      let userDetails = req.body.peacekeeper_id;
      let page_number = req.body.page_number;

      // console.log(list_id, typeof list_id);
      const result = await contactModel.getAllContacts(
        userDetails,
        list_id
      );
      // console.log(result[0]);
      // Transforming the data
      if (result[0]?.[0]?.response === 'fail') {
        res.json({
          success: true,
          error: false,
          message: "No Data found!",
          totalCount: 0,
          data: []
        });
      } else {
        const transformedData = result[0].map((item) => {
          const newItem = {
            // Extracting properties from contact_detail
            company_id: item?.company_id,
            contact_id: item?.contact_id,
            is_active: item?.is_active,
            created_at: item?.created_at,
            created_by: item?.created_by,
          };

          // Merging other properties
          if (item.contact_detail) {
            const contactDetail = item.contact_detail;

            // Dynamically add properties from contact_detail
            Object.keys(contactDetail).forEach((key) => {
              // Check if the key is not already present
              if (!(key in newItem)) {
                newItem[key] = contactDetail[key];
              }
            });
          } else {
            newItem.company_id = item.company_id;
          }

          return newItem;
        })
 // Filter out items where all properties are null
 .filter(
  (item) =>
    Object.values(item).some((value) => value !== null && value !== undefined)
);

        // console.log("transformedData",transformedData)
        // console.log(transformedData.length)
  
        res.json({
          success: true,
          error: false,
          message: "Details fetched successfully!",
          // totalCount: result[1][0].count,
          // data:transformedData
          totalCount: transformedData.length,
          data: transformedData,
        });
      }
    }
    catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },
  check_list: async (req, res) => {
    try {
      // const userDetails = verifyJwt(req);
      const body = req.body;
      console.log(body,"body");
      
     
      const result = await contactModel.check_list(body);
      // console.log("res",result[0][0].response);
      if (result[0] && result[0][0]?.response === "fail") {
        res.status(400).json({
          success: false,
          error: true,
          message: "List name already exist!",
        });
      } else {
        res.json({ success: true, error: false, message: "yahoo,Go ahead!" });
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },

  getAllList: async (req, res) => {
    try {
      // const userDetails = verifyJwt(req);
    
      const userDetails = req.body.peacekeeper_id;
      const result = await contactModel.getAllList(userDetails);

      if (result[0] && result[0][0]?.response === "fail") {
        res.json({
          success: false,
          error: true,
          data: [],
          count: result[0].length,

        });
      } else {
        // console.log(``,result[0] );
        res.json({
          success: true,
          error: false,
          message: "List fetched successfully!",
          data: result[0],
          count: result[0].length,
        });
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },

  updateBulkdetails: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);

      const newData = req.body;
      const excelFile = req.file;
      // console.log(excelFile);
      const workbook = XLSX.readFile(excelFile.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert the worksheet to JSON format
      const dataArray = XLSX.utils.sheet_to_json(worksheet);

      // validateContact(dataArray, newData, userDetails);
      const validationResults = await validateContact(
        dataArray,
        newData,
        userDetails
      );
      let dataArr = validationResults[dataArray];
      let dupEmailCount = validationResults.duplicatContactCount;
      let ignoredCount = validationResults.invalidEmail;
      // console.log("...........", validationResults.dataArray);
      let existingCount = 0;
      let newCount = 0;

      if (newData.status === "step_1") {
        for (let contact of validationResults.dataArray) {
          if (contact.isvalidcontact && !contact.isDuplicatecontact) {

            var result = await contactModel.validateConatctInListExistance(
              newData,
              userDetails,
              contact.email_key
            );

            if (result[0][0].response === "exist") {
              existingCount++;
            } else if (result[0][0].response === "new") {
              newCount++;
            }
          }
        }

        return res.json({
          success: true,
          error: false,
          message: "Count Fetched successfully!",
          dupEmailCount: dupEmailCount,
          ignoredCount: ignoredCount + dupEmailCount,
          reAddedContact: existingCount,
          newData: newCount,
          total: dataArray.length,
        });
      } else if (newData.status === "complete") {
        const Res_file_id = await contactModel.saveContactReview(
          excelFile.originalname,
          excelFile.path,
          excelFile.mimetype,
          userDetails.companyId,
          dataArray.length,
          dupEmailCount,
          existingCount,
          ignoredCount + dupEmailCount,
          newCount,
          userDetails.user_id
        );
        // console.log("Res_file_id",Res_file_id[0][0].contact_file_id)
        const contact_file_id = Res_file_id[0][0].contact_file_id;
        for (let contact of validationResults.dataArray) {

          if (contact.isvalidcontact && !contact.isDuplicatecontact) {
            var result = await contactModel.validateConatctInListExistance(
              newData,
              userDetails,
              contact.email_key
            );

            // console.log("result[0][0].response",result[0][0].response);
            // console.log("req.body.replace",req.body.replace)
            // console.log("result[2]",result[2])

            if (
              result[0][0].response === "exist" &&
              req.body.let_it_be === "1"
            ) {
              existingCount++;
              console.log("INSIDE - let it be");

              const filteredContact = Object.fromEntries(
                Object.entries(contact).filter(
                  ([key]) =>
                    ![
                      "isvalidcontact",
                      "isDuplicatecontact",
                      "email_key",
                    ].includes(key)
                )
              );

              var keys = Object.keys(filteredContact);
              var values = Object.values(filteredContact);

             
              await contactModel.updateBulkdetails(
                newData,
                contact,
                contact.email_key,
                keys,
                values,
                userDetails,
                filteredContact,
                contact_file_id
              );

            }
            if (result[0][0].response === "exist" && req.body.replace === "1") {
              existingCount++;
              console.log("replace existing contact- replace");

              const filteredContact = Object.fromEntries(
                Object.entries(contact).filter(
                  ([key]) =>
                    ![
                      "isvalidcontact",
                      "isDuplicatecontact",
                      "email_key",
                    ].includes(key)
                )
              );
              for (let contactId of result[2]) {
                await contactModel.update_ReplaceBulkdetails(
                  newData,
                  contactId.contact_id,
                  contact.email_key,
                  userDetails,
                  filteredContact
                );
              }

            } else if (result[0][0].response === "new") {

              const filteredContact = Object.fromEntries(
                Object.entries(contact).filter(
                  ([key]) =>
                    ![
                      "isvalidcontact",
                      "isDuplicatecontact",
                      "email_key",
                    ].includes(key)
                )
              );
              var keys = Object.keys(filteredContact);
              var values = Object.values(filteredContact);


              newCount++;
           
              await contactModel.updateBulkdetails(
                newData,
                contact,
                contact.email_key,
                keys,
                values,
                userDetails,
                filteredContact,
                contact_file_id
              );
            }
          }
        }


        res.json({
          success: true,
          error: false,
          message: "Contact Details updated successfully!",
          dupEmailCount: dupEmailCount,
          ignoredCount: ignoredCount + dupEmailCount,
          reAddedContact: existingCount,
          newData: newCount,
          total: dataArray.length,
        });
        // }
      }
    } catch (err) {
      console.error("Error inserting data:", err);
      res.status(500).json({ message: err.message });
    }
  },

  addMultipleContactInList: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);
      // console.log("userDetails", userDetails);
      const newData = req.body;
      const dataArray = req.body.contacts;

      // validateContact(dataArray, newData, userDetails);
      const validationResults = await validateContact(
        dataArray,
        newData,
        userDetails
      );
      let dataArr = validationResults[dataArray];
      let dupEmailCount = validationResults.duplicatContactCount;
      let ignoredCount = validationResults.invalidEmail;
      // console.log("...........", validationResults.dataArray);
      let existingCount = 0;
      let newCount = 0;

      if (newData.status === "step_1") {
        for (let contact of validationResults.dataArray) {
          if (contact.isvalidcontact && !contact.isDuplicatecontact) {
            var result = await contactModel.validateConatctInListExistance(
              newData,
              userDetails,
              contact.email_key
            );
            // console.log(contact.isvalidcontact);
            // console.log(result[0][0],result[0][0].response === 'exist');
            if (result[0][0].response === "exist") {
              existingCount++;
            } else if (result[0][0].response === "new") {
              newCount++;
            }
          }
        }
        // console.log("Existing data count:", existingCount);
        // console.log("New data count:", newCount);
        return res.json({
          success: true,
          error: false,
          message: "Count Fetched successfully!",
          dupEmailCount: dupEmailCount,
          ignoredCount: ignoredCount + dupEmailCount,
          reAddedContact: existingCount,
          newData: newCount,
          total: dataArray.length,
        });
      } else if (newData.status === "complete") {
        for (let contact of validationResults.dataArray) {
          // console.log(contact);
          if (contact.isvalidcontact && !contact.isDuplicatecontact) {
            var result = await contactModel.validateConatctInListExistance(
              newData,
              userDetails,
              contact.email_key
            );
            // console.log(result[0][0].response);
            if (result[0][0].response === "exist") {
              existingCount++;
              // existingCount=result[1][0].existcount;
              // console.log("skipping existing contact",  result[1][0].existcount);
            } else if (result[0][0].response === "new") {
              const Res_file_id = await contactModel.saveContactReview(
                null,
                 null,
                 null,
                 userDetails.companyId,
                 dataArray.length,
                 dupEmailCount,
                 existingCount,
                 ignoredCount + dupEmailCount,
                 newCount,
                 userDetails.user_id
               );
                // console.log("Res_file_id",Res_file_id[0][0].contact_file_id)
        const contact_file_id = Res_file_id[0][0].contact_file_id;
              // for (let contact of validationResults.dataArray) {
              //   // console.log(contact);
              //   if (contact.isvalidcontact && !contact.isDuplicatecontact) {
              // Filter out unwanted keys
              const filteredContact = Object.fromEntries(
                Object.entries(contact).filter(
                  ([key]) =>
                    ![
                      "isvalidcontact",
                      "isDuplicatecontact",
                      "email_key",
                    ].includes(key)
                )
              );
              var keys = Object.keys(filteredContact);
              var values = Object.values(filteredContact);
              // console.log("keys:", keys);
              // console.log("values:", values);

              newCount++;
              var resultSubmitted = await contactModel.addBulkdetails(
                newData,
                contact,
                contact.email_key,
                keys,
                values,
                userDetails,
                filteredContact,
                contact_file_id
              );
            }
          }
        }
        // console.log(resultSubmitted);

        let dataArr = dataArray.length;
        let totalValidationCount = ignoredCount + dupEmailCount + existingCount;
        // console.log(dataArr, totalValidationCount);
        if (dataArr === totalValidationCount) {
          res.status(200).json({
            success: true,
            error: false,
            message: "Contact Details already exists!",
            dupEmailCount: dupEmailCount,
            ignoredCount: ignoredCount + dupEmailCount,
            reAddedContact: existingCount,
            newData: newCount,
            total: dataArray.length,
          });
        } else {
          res.json({
            success: true,
            error: false,
            message: "Contact Details uploaded successfully!",
            dupEmailCount: dupEmailCount,
            ignoredCount: ignoredCount + dupEmailCount,
            reAddedContact: existingCount,
            newData: newCount,
            total: dataArray.length,
          });
        }
      }
    } catch (err) {
      console.error("Error inserting data:", err);
      res.status(500).json({ message: err.message });
    }
  },
  updateMultipleContactInList: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);
      const newData = req.body;

      const dataArray = req.body.contacts;

      const validationResults = await validateContact(
        dataArray,
        newData,
        userDetails
      );
      let dataArr = validationResults[dataArray];
      let dupEmailCount = validationResults.duplicatContactCount;
      let ignoredCount = validationResults.invalidEmail;
      // console.log("...........", validationResults.dataArray);
      let existingCount = 0;
      let newCount = 0;

      if (newData.status === "step_1") {
        for (let contact of validationResults.dataArray) {
          if (contact.isvalidcontact && !contact.isDuplicatecontact) {
            var result = await contactModel.validateConatctInListExistance(
              newData,
              userDetails,
              contact.email_key
            );
            // console.log(contact.isvalidcontact);
            // console.log(result[0][0],result[0][0].response === 'exist');
            if (result[0][0].response === "exist") {
              existingCount++;
            } else if (result[0][0].response === "new") {
              newCount++;
            }
          }
        }
        // console.log("Existing data count:", existingCount);
        // console.log("New data count:", newCount);
        return res.json({
          success: true,
          error: false,
          message: "Count Fetched successfully!",
          dupEmailCount: dupEmailCount,
          ignoredCount: ignoredCount + dupEmailCount,
          reAddedContact: existingCount,
          newData: newCount,
          total: dataArray.length,
        });
      } else if (newData.status === "complete") {
        const Res_file_id = await contactModel.saveContactReview(
         null,
          null,
          null,
          userDetails.companyId,
          dataArray.length,
          dupEmailCount,
          existingCount,
          ignoredCount + dupEmailCount,
          newCount,
          userDetails.user_id
        );
        // console.log("Res_file_id",Res_file_id[0][0].contact_file_id)
        const contact_file_id = Res_file_id[0][0].contact_file_id;
        console.log("inside complete");
        for (let contact of validationResults.dataArray) {
          if (contact.isvalidcontact && !contact.isDuplicatecontact) {
            var result = await contactModel.validateConatctInListExistance(
              newData,
              userDetails,
              contact.email_key
            );

            // console.log("repsonse");
            // console.log(result[0][0].response);

            if (result[0][0].response === "exist") {
              existingCount++;
            } else if (result[0][0].response === "new") {
              const filteredContact = Object.fromEntries(
                Object.entries(contact).filter(
                  ([key]) =>
                    ![
                      "isvalidcontact",
                      "isDuplicatecontact",
                      "email_key",
                    ].includes(key)
                )
              );
              var keys = Object.keys(filteredContact);
              var values = Object.values(filteredContact);
              // console.log("keys:", keys);
              // console.log("values:", values);

              newCount++;
             
              var resultSubmitted = await contactModel.updateBulkdetails(
                newData,
                contact,
                contact.email_key,
                keys,
                values,
                userDetails,
                filteredContact,
                contact_file_id
              );
            }
          }
        }
        // console.log(resultSubmitted);

        let dataArr = dataArray.length;
        let totalValidationCount = ignoredCount + dupEmailCount + existingCount;
        // console.log(dataArr, totalValidationCount);
        if (dataArr === totalValidationCount) {
          res.status(400).json({
            success: true,
            error: false,
            message: "Contact Details already exists!",
            dupEmailCount: dupEmailCount,
            ignoredCount: ignoredCount + dupEmailCount,
            reAddedContact: existingCount,
            newData: newCount,
            total: dataArray.length,
          });
        } else {
          res.json({
            success: true,
            error: false,
            message: "Contact Details updated successfully!",
            dupEmailCount: dupEmailCount,
            ignoredCount: ignoredCount + dupEmailCount,
            reAddedContact: existingCount,
            newData: newCount,
            total: dataArray.length,
          });
        }
      }
    } catch (err) {
      console.error("Error inserting data:", err);
      res.status(500).json({ message: err.message });
    }
  },
  deleteContact: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);
      const contactIds = req.body.contact_ids;

      if (!contactIds || !Array.isArray(contactIds)) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Invalid or missing contact_ids",
        });
      }

      if (contactIds.length == 0) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Provide required fields",
        });
      }

      const contList = contactIds.join(",");

      const [rowList] = await dbConn.execute(
        `SELECT contact_id from tbl_email_scheduler_rule_for_campaign where contact_id IN (${contList}) and company_id=?`,
        [userDetails.companyId]
      );

      if (rowList.length > 0) {
        return res.status(400).send({
          message: "The Contact is actively being used in a campaign",
        });
      }

      await dbConn.execute(
        // `DELETE from tbl_contact_list_mapping where contact_id IN (${contList}) and company_id=?`,
        `UPDATE tbl_contact_list_mapping SET action='d', is_active=0 where contact_id IN (${contList}) and company_id=?`,

        [userDetails.companyId]
      );

      for (const contactId of contactIds) {
        await contactModel.deleteContact(contactId);
      }

      res.json({
        success: true,
        error: false,
        message: "Contacts deleted successfully!",
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },
  saveContactToNewList: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);

      const contactIdList = req.body.contactIdList;
      const listName = req.body.listName;

      await contactModel.saveSelectedContactToNewList(
        contactIdList,
        listName,
        userDetails,
        res
      );

      res.status(200).json({
        success: true,
        error: false,
        message: "Contacts saved to list successfully!",
      });
    } catch (err) {
      console.error("Error inserting data:", err);
      res.status(500).json({ message: err.message });
    }
  },
  saveContactToList: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);
      const contactIdList = req.body.contactIdList;
      const listId = req.body.listId;

      await contactModel.saveSelectedContactToList(
        contactIdList,
        listId,
        userDetails
      );

      res.status(200).json({
        success: true,
        error: false,
        message: "Contacts saved to list successfully!",
      });
    } catch (err) {
      console.error("Error inserting data:", err);
      res.status(500).json({ message: err.message });
    }
  },

  saveContactReview: async (req, res) => {
    try {

      const {
        p_file_id,
        p_file_name,
        p_file_path,
        p_file_type,
        p_company_id,
        p_total_contact,
        p_duplicate_contact,
        p_re_added_contact,
        p_created_by
      } = req.body;


      await contactModel.saveContactReview(
        p_file_id,
        p_file_name,
        p_file_path,
        p_file_type,
        p_company_id,
        p_total_contact,
        p_duplicate_contact,
        p_re_added_contact,
        p_created_by
      );

      res.status(200).json({
        success: true,
        error: false,
        message: "Contact review saved successfully!",
      });
    } catch (err) {
      console.error("Error inserting data:", err);
      res.status(500).json({ message: err.message });
    }
  },
};



const validateContact = (dataArray, newData) => {
  const emailSet = new Set();
  let returnObj = {};
  returnObj["duplicatContactCount"] = 0;
  returnObj["invalidEmail"] = 0;
  for (const dataObj of dataArray) {
    dataObj["isvalidcontact"] = false;

    dataObj["isDuplicatecontact"] = false;

    for (const email_key of Object.keys(dataObj)) {
      const email_value = dataObj[email_key];

      if (isEmail(email_value) && emailSet.has(email_value)) {
        dataObj["isDuplicatecontact"] = true;
        dataObj["isvalidcontact"] = true;
        returnObj["duplicatContactCount"] =
          returnObj["duplicatContactCount"] + 1;
      }
      if (isEmail(email_value) && !emailSet.has(email_value)) {
        dataObj["isvalidcontact"] = true;
        dataObj["isDuplicatecontact"] = false;
        dataObj["email_key"] = email_value;
        // Mark email value as encountered to avoid duplicates
        emailSet.add(email_value);
      }
    }
    if (dataObj["isvalidcontact"] === false) {
      returnObj["invalidEmail"] = returnObj["invalidEmail"] + 1;
    }
  }
  returnObj["dataArray"] = dataArray;
  return returnObj;
};

function isEmail(str) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(str);
}

function isEmailhas(value) {
  if (
    typeof value === "string" &&
    value.includes("@") &&
    !value.includes(".")
  ) {
    console.log("1", value);
  }
  if (
    typeof value === "string" &&
    value.includes(".") &&
    !value.includes("@")
  ) {
    console.log("2", value);
  }
}

module.exports = contactController;
