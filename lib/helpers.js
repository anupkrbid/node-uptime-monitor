/**
 * Helpers for various tasks
 */

const crypto = require('crypto');
const https = require('https');
const querystring = require('querystring');

const config = require('../config');

// Container for all Helpers
const helpers = {};

// Create a SHA256 Hash
helpers.hash = stringToHash => {
  if (typeof stringToHash === 'string' && stringToHash.trim().length > 0) {
    const hash = crypto
      .createHmac('sha256', config.HASHING_SECRET)
      .update(stringToHash)
      .digest('hex');
    return hash;
  } else {
    return false;
  }
};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = stringifiedObj => {
  try {
    const obj = JSON.parse(stringifiedObj);
    return obj;
  } catch (err) {
    return {};
  }
};

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = stringLength => {
  if (typeof stringLength === 'number' && stringLength > 0) {
    // Define all the possible characters that could go in a string
    const allPossibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    // Start the final string
    let str = '';
    for (let i = 1; i <= stringLength; i++) {
      // Get a random character from the possibleCharacter string
      var randomCharacter = allPossibleCharacters.charAt(
        Math.floor(Math.random() * allPossibleCharacters.length)
      );
      // Append this character to the final string
      str += randomCharacter;
    }
    // Return the string
    return str;
  } else {
    return false;
  }
};

// Send a SMS Message via Twilio
helpers.sendTwilioSMS = (phone, msg, callback) => {
  // Validate parameters
  const messsage =
    typeof msg == 'string' && msg.trim().length <= 1600 ? msg.trim() : false;

  const phoneNo =
    typeof phone == 'string' && phone.trim().length === 10
      ? phone.trim()
      : false;

  if (messsage && phoneNo) {
    // Configure the request payload
    const payload = {
      From: config.TWILIO.FROM_PHONE,
      To: `+1${phoneNo}`,
      Body: messsage
    };

    // Stringify the payload
    const stringifiedPayload = querystring.stringify(payload);

    // Configure the request details
    const requestDetails = {
      protocol: 'https:',
      hostname: 'api.twilio.com',
      method: 'POST',
      path: `/2010-04-01/Accounts${config.TWILIO.ACCOUNT_SID}/Messages.json`,
      auth: `${config.TWILIO.ACCOUNT_SID}:${config.TWILIO.AUTH_TOKEN}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringifiedPayload)
      }
    };

    // Initiate the request object
    const request = https.request(requestDetails, res => {
      // Grab the status of the sent requst
      const status = res.statusCode;
      // Callback successful if the request went through
      if (status === 200 || status == 201) {
        callback(false);
      } else {
        callback(`Call back returned with status ${status}`);
      }
    });

    // Bind to the error event  so that it doesnt get thrown
    request.on('error', e => {
      callback(e);
    });

    // Add the payload
    request.write(stringifiedPayload);

    // End the request
    request.end();
  } else {
    callback('Given parameter were missing or invalid');
  }
};

// Export the module
module.exports = helpers;
