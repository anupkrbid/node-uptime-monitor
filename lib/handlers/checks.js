const db = require('../data');
const helpers = require('../helpers');
const tokens = require('./tokens');
const config = require('../../config');

const checks = {};

// Checks - GET
// Required Data: id
// Optional Data: none
checks.get = (data, callback) => {
  // Check that id is valid
  const id =
    typeof data.queryString.id == 'string' &&
    data.queryString.id.trim().length === 20
      ? data.queryString.id.trim()
      : false;

  if (id) {
    // Look up the Checks for the user who created
    db.read('checks', id, (checkErr, checkData) => {
      if (!checkErr && checkData) {
        // Get the token from the headers
        const token =
          typeof data.headers.token === 'string' ? data.headers.token : false;

        // Verify the given token is valid and belongs to the user who created the check
        tokens.verify(token, checkData.userPhone, tokenIsValid => {
          if (tokenIsValid) {
            // Return the check data
            callback(200, checkData);
          } else {
            callback(403, {
              error: 'Missing required token in header, or token is invalid'
            });
          }
        });
      } else {
        callback(404, { error: 'Checck id not found' });
      }
    });
  } else {
    callback(400, { error: 'Missing Required Field' });
  }
};

// Checks - POST
// Required Data: protocol, url, method, successCode, timeoutSeconds
// Optional Data: none
checks.post = (data, callback) => {
  // Check if all required fields are filled out or not
  const protocol =
    typeof data.body.protocol == 'string' &&
    ['http', 'https'].indexOf(data.body.protocol) > -1
      ? data.body.protocol
      : false;

  const url =
    typeof data.body.url == 'string' && data.body.url.trim().length > 0
      ? data.body.url.trim()
      : false;

  const method =
    typeof data.body.method == 'string' &&
    ['post', 'get', 'put', 'delete'].indexOf(data.body.method) > -1
      ? data.body.method
      : false;

  const successCode =
    typeof data.body.successCode == 'object' &&
    data.body.successCode instanceof Array &&
    data.body.successCode.length > 0
      ? data.body.successCode
      : false;

  const timeoutSeconds =
    typeof data.body.timeoutSeconds == 'number' &&
    data.body.timeoutSeconds % 1 === 0 &&
    data.body.timeoutSeconds >= 1 &&
    data.body.timeoutSeconds <= 5
      ? data.body.timeoutSeconds
      : false;
  if (protocol && url && method && successCode && timeoutSeconds) {
    // Get the token from the headers
    const token =
      typeof data.headers.token === 'string' ? data.headers.token : false;

    // Lookup user by reading hte token
    db.read('tokens', token, (err, tokenData) => {
      if (!err && tokenData) {
        const userPhone = tokenData.phone;
        // Lookup the user data
        db.read('users', userPhone, (userErr, userData) => {
          if (!userErr && userData) {
            const userChecks =
              typeof userData.checks === 'object' &&
              userData.checks instanceof Array
                ? userData.checks
                : [];
            // Verify that the user has less than the number of max checks per user
            if (userChecks.length < config.MAX_CHECK_LIMIT) {
              // Create a random id for checks
              const checkId = helpers.createRandomString(20);
              // Create the check object, and include the user's phone
              const checkObject = {
                id: checkId,
                userPhone: userPhone,
                protocol: protocol,
                url: url,
                method: method,
                successCode: successCode,
                timeoutSeconds: timeoutSeconds
              };
              // Save the check object
              db.create('checks', checkId, checkObject, checkErr => {
                if (!checkErr) {
                  userData.checks = userChecks;
                  userData.checks.push(checkId);

                  // Save the new user data
                  db.update('users', userPhone, userData, userErr => {
                    if (!userErr) {
                      // Return the data about the new check
                      callback(200, checkObject);
                    } else {
                      callback(500, {
                        error: 'Couldnot update the user checks'
                      });
                    }
                  });
                } else {
                  callback(500, {
                    error: 'Could not create the new check'
                  });
                }
              });
            } else {
              callback(400, {
                error: `The user already has a MAX_CHECK_LIMIT of ${
                  config.MAX_CHECK_LIMIT
                }`
              });
            }
          } else {
            callback(404, { error: 'User data not found' });
          }
        });
      } else {
        // A user with this phone no already exists
        callback(401, {
          error: 'Not Authorized'
        });
      }
    });
  } else {
    callback(400, { error: 'Missing required fields or they are invalide' });
  }
};

// Checks - PUT
// Required Data: id
// Optional Data:  protocol, url, method, successCode, timeoutSeconds (Atleast one must be specified)
checks.put = (data, callback) => {
  // Check for required field
  const id =
    typeof data.body.id == 'string' && data.body.id.trim().length === 20
      ? data.body.id.trim()
      : false;

  // Check for optional fields
  const protocol =
    typeof data.body.protocol == 'string' &&
    ['http', 'https'].indexOf(data.body.protocol) > -1
      ? data.body.protocol
      : false;

  const url =
    typeof data.body.url == 'string' && data.body.url.trim().length > 0
      ? data.body.url.trim()
      : false;

  const method =
    typeof data.body.method == 'string' &&
    ['post', 'get', 'put', 'delete'].indexOf(data.body.method) > -1
      ? data.body.method
      : false;

  const successCode =
    typeof data.body.successCode == 'object' &&
    data.body.successCode instanceof Array &&
    data.body.successCode.length > 0
      ? data.body.successCode
      : false;

  const timeoutSeconds =
    typeof data.body.timeoutSeconds == 'number' &&
    data.body.timeoutSeconds % 1 === 0 &&
    data.body.timeoutSeconds >= 1 &&
    data.body.timeoutSeconds <= 5
      ? data.body.timeoutSeconds
      : false;

  // Error if id is invalid
  if (id) {
    // Error if nothing is sent for update
    if (protocol || url || method || successCode || timeoutSeconds) {
      // Looking up the checks
      db.read('checks', id, (checkErr, checkData) => {
        if (!checkErr && checkData) {
          // Get the token from the headers
          const token =
            typeof data.headers.token === 'string' ? data.headers.token : false;

          // Verify the given token is valid for the phone no
          tokens.verify(token, checkData.userPhone, tokenIsValid => {
            if (tokenIsValid) {
              // Update the check where necessery
              if (protocol) {
                checkData.protocol = protocol;
              }

              if (url) {
                checkData.url = url;
              }

              if (method) {
                checkData.method = method;
              }

              if (successCode) {
                checkData.successCode = successCode;
              }

              if (timeoutSeconds) {
                checkData.timeoutSeconds = timeoutSeconds;
              }

              // Store the new Updates
              db.update('checks', id, checkData, updateErr => {
                if (!updateErr) {
                  callback(200);
                } else {
                  callback(500, { error: 'Couldnot update the Checks' });
                }
              });
            } else {
              callback(403, {
                error: 'Missing required token in header, or token is invalid'
              });
            }
          });
        } else {
          callback(404, { error: 'Check id not found' });
        }
      });
    } else {
      callback(400, { error: 'Missing Field to Update' });
    }
  } else {
    callback(400, { error: 'Missing Required Field' });
  }
};

// Checks - DELETE
// Required Data: id
checks.delete = (data, callback) => {
  // Check that id is valid
  const id =
    typeof data.body.id == 'string' && data.body.id.trim().length === 20
      ? data.body.id.trim()
      : false;

  if (id) {
    // Look up the checks
    db.read('checks', id, (checkErr, checkData) => {
      if (!checkErr && checkData) {
        // Get the token from the headers
        const token =
          typeof data.headers.token === 'string' ? data.headers.token : false;

        // Verify the given token is valid for the phone no
        tokens.verify(token, checkData.userPhone, tokenIsValid => {
          if (tokenIsValid) {
            // Delete the check data
            db.delete('checks', id, checkDelErr => {
              if (!checkDelErr) {
                // Look up the user
                db.read('users', checkData.userPhone, (userErr, userData) => {
                  if (!userErr && userData) {
                    const userPhone = userData.phone;
                    // Lookup the user data
                    db.read('users', userPhone, (userErr, userData) => {
                      if (!userErr && userData) {
                        const userChecks =
                          typeof userData.checks === 'object' &&
                          userData.checks instanceof Array
                            ? userData.checks
                            : [];

                        // Remove the deleted checks from their list of checks
                        const checkPosition = userChecks.indexOf(id);
                        if (checkPosition > -1) {
                          userChecks.splice(checkPosition, 1);
                          // Resave the user's data
                          // Save the new user data
                          db.update(
                            'users',
                            checkData.userPhone,
                            userData,
                            userErr => {
                              if (!userErr) {
                                callback(200);
                              } else {
                                callback(500, {
                                  error: 'Could not update the user checks'
                                });
                              }
                            }
                          );
                        } else {
                          callback(500, {
                            error:
                              'Could not find the check in the user object so couldnot remove it'
                          });
                        }
                      } else {
                        callback(404, { error: 'User data not found' });
                      }
                    });
                  } else {
                    callback(404, {
                      error:
                        'Could not find the user who created the check, so could not remove the check from the list of checks from the user object'
                    });
                  }
                });
              } else {
                callback(500, { error: 'Check could not be deleted' });
              }
            });
          } else {
            callback(403, {
              error: 'Missing required token in header, or token is invalid'
            });
          }
        });
      } else {
        callback(404, { error: 'Check Id not found' });
      }
    });
  } else {
    callback(400, { error: 'Missing Required Field' });
  }
};

module.exports = checks;
