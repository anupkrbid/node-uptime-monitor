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

// Export the module
module.exports = helpers;
