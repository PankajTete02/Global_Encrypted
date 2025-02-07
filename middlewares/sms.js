
const twilio = require('twilio');
// Replace these values with your Twilio Account SID and Auth Token
const accountSid = 'AC267b2b411d6d2af4b88dc4fe72a70a34';
const authToken = '47d3c808b13cb0978d1a9805629d9602';
function sms() {

    // Create a Twilio client

    const client = new twilio(accountSid, authToken);

    // Replace this with your WhatsApp Sandbox number (e.g., 'whatsapp:+1234567890')

    const from = '+19402027370';

    // Replace this with the recipient's WhatsApp number (e.g., 'whatsapp:+0987654321')

    const to = '+917089966389';
    // The message you want to send

    const message = 'Hello, this is a WhatsApp message sent via - cylsys!';
    // Send the WhatsApp message

    client.messages.create({

        from: from,

        to: to,

        body: message,

    }).then((message) => console.log(`WhatsApp message sent with SID: ${message.sid}`)).catch((error) => console.error(`Error sending WhatsApp message: ${error.message}`));

}
// Export the sendWhatsAppMessage function so it can be used in other files
module.exports = {
    sms: sms
};
