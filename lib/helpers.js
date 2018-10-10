/**
 * Helpers for various tasks
 */

const crypto = require('crypto');

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

// Export the module
module.exports = helpers;
