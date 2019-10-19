import * as functions from 'firebase-functions';

const accountSid = functions.config().twilio.sid;
const authToken = functions.config().twilio.token;
const fromNumber = "+14156970557";
const client = require('twilio')(accountSid, authToken);

export const sendFax = functions.storage.bucket().object().onFinalize((object) => {
  //const toNumber = object.metadata.target;
  const toNumber = "+14153585740";
  const mediaUrl = object.mediaLink;
  console.log(`Sending fax from ${fromNumber} to ${toNumber}, with media ${mediaUrl}`)
  return client.fax.faxes
    .create({
      from: fromNumber,
      to: toNumber,
      mediaUrl,
    })
    .then(fax => console.log("Sent fax: " + JSON.stringify(fax.sid, null, 2)))
    .catch(err => console.error("Error sending fax: ", err));
});
