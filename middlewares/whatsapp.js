
const { log } = require('handlebars/runtime');
const twilio = require('twilio');

// Replace these values with your Twilio Account SID and Auth Token
const accountSid = 'AC8577f4ca4de10f716ee0368b87d198a3';
const authToken = '53b34bdeb42d2bcc749619e856b41d17';

const twilioClient = twilio(
  accountSid, authToken
)
function sendWhatsAppMessage(username, company, designation, urn_no, statusType, userNumber) {  //1=approve , 2=unapprove
  // Create a Twilio client
  // const client = new twilio();

  // Replace this with your WhatsApp Sandbox number (e.g., 'whatsapp:+1234567890')
  // const from = 'whatsapp:+14155238886';
  const from = 'whatsapp:+919109092270';

  // Replace this with the recipient's WhatsApp number (e.g., 'whatsapp:+0987654321')
  // const to = 'whatsapp:+919755371124';
  // const to = 'whatsapp:+919617605225';
  // const to = 'whatsapp:+917089966389';
  //   const to = 'whatsapp:+917509027349';
  let to = '';
  console.log("userNumber", userNumber);
  console.log(`whatsapp:+91${userNumber}`);
  if (userNumber !== undefined) {
    to = `whatsapp:+91${userNumber}`;
  } else {
    console.log("number is undefined");
  }
  console.log("whatsapp.js", username, statusType, urn_no, userNumber);

  let message = '';

  if (statusType === 1 || statusType === 'generate_badge') {

    message = `Dear ${username},
  
    Thank You for registering for Pharma Pre-connect Conference on 27th Nov 2023 at Delhi. 
    
    You can download your badge here.
    
    Please find the below details regarding the registration.
    
    URN No.	: ${urn_no}
    Name	: ${username}
    Company Name	: ${company}
    Designation	: ${designation}
    Conference Dates: 27th Nov 2023 
    Venue Location: Le Meridian Hotel, New Delhi 
    (https://maps.app.goo.gl/Xg3uCwZAFmpgWJJp6)`
  }
  else {

message = `Dear ${username},

We regret to inform you that your registration is rejected by the organizer. 
  
Please note:
  
• Registration is complimentary only for Pharma Drug manufacturing companies.
  
• Registration is chargeable for all companies providing solutions to Pharma Drug manufacturing companies.
  
• Registration entries are limited.
  
To know more on the charges, please contact Dimple Harchandani at Dimple.Harchandani@informa.com and mark Diya Thakkar at Diya.Thakkar@informa.com in CC
  
Regards,
Team CPHI Pharma Pre-connect Congress
`
  }
  // Send the WhatsApp message
  return twilioClient.messages
    .create({
      from: from,
      to: to,
      body: message,
    })
}


function sendMediaMessage(urn_no, userNumber) {
  const from = "MGee1c2ad728d818a819cc9733771d5d95";
  let to = '';
  if (userNumber != undefined) {
    to = `whatsapp:+91${userNumber}`;
  } else {
    console.log("number is undefined");
    return;
  }

  const params = {
    contentSid: "HX64609bb33542ba0440048167a642d311",
    from: from,
    to: to,
    contentVariables: JSON.stringify({
      1: `${urn_no}.pdf`,
    }),
  };
  return twilioClient.messages
    .create(params);
}



function sendWhatsAppMessage_onSceduleTime(userNumber,daysleft) {  //1=approve , 2=unapprove
  // Create a Twilio client
  // const client = new twilio();

  // Replace this with your WhatsApp Sandbox number (e.g., 'whatsapp:+1234567890')

  const from = 'whatsapp:+919109092270';

  // Replace this with the recipient's WhatsApp number (e.g., 'whatsapp:+0987654321')

  let to = '';
  console.log("userNumber", userNumber);
  console.log(`whatsapp:+91${userNumber}`);
  if (userNumber !== undefined) {
    to = `whatsapp:+91${userNumber}`;
  } else {
    console.log("number is undefined");
  }
  console.log("whatsapp.js", userNumber);


let message = `Hi 🙋‍♂️,

${daysleft}

Here is your *All Access Complimentary Delegate Pass.*
Please show this WhatsApp to get direct access to CPHI Pharma Pre-connect Congress

*SAVE The Date:* 27th November 2023
*Venue:* Le Meridian Hotel, New Delhi 
*Venue Directions:* https://maps.app.goo.gl/zpFvfqiYkPQr8dUv8

*Benefits of your All Access Delegate Pass*
   • 📖 Access to knowledge rich session
   • 🤝 Networking Lunch 🍴
   • Power breakfast 🥣
   • 📈 Grow at the CPHI network

*Register a friend:* https://bit.ly/3StGg9N

Best regards
Team *CPHI Pharma Pre-connect Congress* 2023`
  
  // Send the WhatsApp message
  return twilioClient.messages
    .create({
      from: from,
      to: to,
      body: message,
    })
}

// Export the sendWhatsAppMessage function so it can be used in other files
module.exports = {
  sendWhatsAppMessage: sendWhatsAppMessage,
  sendMediaMessage: sendMediaMessage,
  sendWhatsAppMessage_onSceduleTime:sendWhatsAppMessage_onSceduleTime,
};
