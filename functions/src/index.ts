import * as functions from 'firebase-functions';

const accountSid = functions.config().twilio.sid;
const authToken = functions.config().twilio.token;
const fromNumber = functions.config().twilio.number;
const storageBucket = JSON.parse(process.env.FIREBASE_CONFIG).storageBucket;

const client = require('twilio')(accountSid, authToken);

export const sendFax = functions.database.ref("queue/{uid}").onCreate((snap, context) => {
  const uid = context.params.uid;
  const val = snap.val();
  const toNumber = val.target;
  const sign = val.sign;
  const mediaUrl = `https://storage.googleapis.com/${storageBucket}/${sign}.pdf`
  console.log(`Sending fax from ${fromNumber} to ${toNumber}, with media ${mediaUrl}`)
  return client.fax.faxes
    .create({
      from: fromNumber,
      to: toNumber,
      mediaUrl,
    })
    .then(fax => {
      console.log("Sent fax: " + JSON.stringify(fax, null, 2));
    }).catch(err => {
      console.error("Error sending fax: ", err);
      return err;
    }).then(err => {
      if (err) { val.err = err; }
      return Promise.all([
        snap.ref.remove(),
        snap.ref.root.child(`sent/${uid}`).set(val)
      ]);
    }).catch(console.error);
});
