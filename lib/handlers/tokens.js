const db = require('../data');
const helpers = require('../helpers');

const tokens = {};

// Tokens - GET
// Required Data: id
// Optional Data: none
tokens.get = (data, callback) => {
  // Check that phone no is valid
  const id =
    typeof data.queryString.id == 'string' &&
    data.queryString.id.trim().length === 20
      ? data.queryString.id.trim()
      : false;

  if (id) {
    // Look up the token
    db.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404, { error: 'Token Not Found' });
      }
    });
  } else {
    callback(400, { error: 'Missing Required Field' });
  }
};

// Tokens - POST
// Required Data: phone, password
// Optional Data: none
tokens.post = (data, callback) => {
  // Check if all required fields are filled out or not
  const phone =
    typeof data.body.phone == 'string' && data.body.phone.trim().length === 10
      ? data.body.phone.trim()
      : false;

  const password =
    typeof data.body.password == 'string' &&
    data.body.password.trim().length > 0
      ? data.body.password.trim()
      : false;

  if (phone && password) {
    // Make sure that user doesn't already exist
    db.read('users', phone, (err, userData) => {
      if (!err && userData) {
        // Hash the sent password and compare it with the saved password in user object
        const hashedPassword = helpers.hash(password);
        if (hashedPassword === userData.password) {
          // If valid, create a new token with a random name, Set exiration time to 1 hour
          const tokenId = helpers.createRandomString(20);
          const expiresIn = Date.now() + 1000 * 60 * 60;

          const tokenObj = {
            phone: phone,
            id: tokenId,
            expiresIn: expiresIn
          };

          db.create('tokens', tokenId, tokenObj, err => {
            if (!err) {
              callback(200);
            } else {
              callback(500, { error: 'Could not create the new token' });
            }
          });
        } else {
          callback(400, { error: 'Password Incorrect' });
        }
      } else {
        // A user with this phone no already exists
        callback(400, { error: 'A user with this phone no already exists' });
      }
    });
  } else {
    callback(400, { error: 'Missing Required Fields' });
  }
};

// Tokens - PUT
// Required Data: id, extend
// Optional Data: none
tokens.put = (data, callback) => {
  // Check for required field
  const id =
    typeof data.body.id == 'string' && data.body.id.trim().length === 20
      ? data.body.id.trim()
      : false;

  const extend =
    typeof data.body.extend == 'boolean' && data.body.extend === true;

  // Error if phone is invalid
  if (id && extend) {
    // Look up the token
    db.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        // Check to make sure that the token hasn't already expired
        if (tokenData.expiresIn > Date.now()) {
          // Set the expiration data an hour from now
          const newTokenData = { ...tokenData };
          newTokenData.expiresIn = Date.now() + 3600 * 60 * 60;
          // Store the new updates
          db.update('tokens', id, newTokenData, tokenErr => {
            if (!tokenErr) {
              callback(200);
            } else {
              callback(500, {
                error: "Could not update the token's expiration time"
              });
            }
          });
        } else {
          callback(400, {
            error: 'Token has already expired and cannot be extended'
          });
        }
      } else {
        callback(404, { error: 'Token Not Found' });
      }
    });
    //  callback(404, { error: 'Token Not Found' });
    // callback(400, { error: 'Missing Field to Update' });
  } else {
    callback(400, { error: 'Missing Required Field' });
  }
};

// Tokens - DELETE
// Required Data: id
// Optional Data: none
tokens.delete = (data, callback) => {
  // Check that id is valid
  const id =
    typeof data.queryString.id == 'string' &&
    data.queryString.id.trim().length === 20
      ? data.queryString.id.trim()
      : false;

  if (id) {
    // Look up the token
    db.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        // Remove the user
        db.delete('tokens', id, delErr => {
          if (!delErr) {
            callback(200);
          } else {
            callback(500, { error: 'Could not delete the specified token' });
          }
        });
      } else {
        callback(404, { error: 'Token Not Found' });
      }
    });
  } else {
    callback(400, { error: 'Missing Required Field' });
  }
};

module.exports = tokens;

tokens.verify = (id, phone, callback) => {
  // Lookup the token
  db.read('tokens', id, (err, tokenData) => {
    if (!err && tokenData) {
      // Check token is for the given user and has not expired
      if (tokenData.phone === phone && tokenData.expiresIn > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};
