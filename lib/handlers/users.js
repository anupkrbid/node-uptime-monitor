const db = require('../data');
const helpers = require('../helpers');
const tokens = require('./tokens');

const users = {};

// Users - GET
// Required Data: phone
// Optional Data: none
users.get = (data, callback) => {
  // Check that phone no is valid
  const phone =
    typeof data.queryString.phone == 'string' &&
    data.queryString.phone.trim().length === 10
      ? data.queryString.phone.trim()
      : false;

  if (phone) {
    // Get the token from the headers
    const token =
      typeof data.headers.token === 'string' ? data.headers.token : false;

    // Verify the given token is valid for the phone no
    tokens.verify(token, phone, tokenIsValid => {
      if (tokenIsValid) {
        // Look up the user
        db.read('users', phone, (err, result) => {
          if (!err && result) {
            // Remove the hashed password from the user object before returning it
            delete result.password;
            callback(200, result);
          } else {
            callback(404, { error: 'User Not Found' });
          }
        });
      } else {
        callback(403, {
          error: 'Missing required token in header, or token is invalid'
        });
      }
    });
  } else {
    callback(400, { error: 'Missing Required Field' });
  }
};

// Users - POST
// Required Data: firstName, lastName, phone, password, tosAgreement
users.post = (data, callback) => {
  // Check if all required fields are filled out or not
  const firstName =
    typeof data.body.firstName == 'string' &&
    data.body.firstName.trim().length > 0
      ? data.body.firstName.trim()
      : false;

  const lastName =
    typeof data.body.lastName == 'string' &&
    data.body.lastName.trim().length > 0
      ? data.body.lastName.trim()
      : false;

  const phone =
    typeof data.body.phone == 'string' && data.body.phone.trim().length === 10
      ? data.body.phone.trim()
      : false;

  const password =
    typeof data.body.password == 'string' &&
    data.body.password.trim().length > 0
      ? data.body.password.trim()
      : false;

  const tosAgreement =
    typeof data.body.tosAgreement == 'boolean' &&
    data.body.tosAgreement === true;

  if (firstName && lastName && phone && password && tosAgreement) {
    // Make sure that user doesn't already exist
    db.read('users', phone, (err, result) => {
      if (err) {
        // Hash the password
        const hashedPassword = helpers.hash(password);

        if (hashedPassword) {
          // Create the User Object
          const userObject = {
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            password: hashedPassword,
            tosAgreement: tosAgreement
          };

          db.create('users', phone, userObject, err => {
            if (!err) {
              callback(200);
            } else {
              callback(500, { error: 'Couldnot Create the new user' });
            }
          });
        } else {
          callback(500, { error: 'Couldnot hash password' });
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

// Users - PUT
// Required Data: phone
// Optional Data: firstName, lastName, password (Atleast one must be specified)
users.put = (data, callback) => {
  // Check for required field
  const phone =
    typeof data.body.phone == 'string' && data.body.phone.trim().length === 10
      ? data.body.phone.trim()
      : false;

  // Check for optional fields
  const firstName =
    typeof data.body.firstName == 'string' &&
    data.body.firstName.trim().length > 0
      ? data.body.firstName.trim()
      : false;

  const lastName =
    typeof data.body.lastName == 'string' &&
    data.body.lastName.trim().length > 0
      ? data.body.lastName.trim()
      : false;

  const password =
    typeof data.body.password == 'string' &&
    data.body.password.trim().length > 0
      ? data.body.password.trim()
      : false;

  // Error if phone is invalid
  if (phone) {
    // Error if nothing is sent for update
    if (firstName || lastName || password) {
      // Get the token from the headers
      const token =
        typeof data.headers.token === 'string' ? data.headers.token : false;

      // Verify the given token is valid for the phone no
      tokens.verify(token, phone, tokenIsValid => {
        if (tokenIsValid) {
          // Look up the user
          db.read('users', phone, (err, result) => {
            if (!err && result) {
              const userData = { ...result };
              // Update the necessery fields
              if (firstName) {
                userData.firstName = firstName;
              }

              if (lastName) {
                userData.lastName = lastName;
              }

              if (password) {
                userData.password = helpers.hash(password);
              }

              // Store the new Updates
              db.update('users', phone, userData, updateErr => {
                if (!updateErr) {
                  callback(200);
                } else {
                  callback(500, { error: 'Couldnot update the User' });
                }
              });
            } else {
              callback(404, { error: 'User Not Found' });
            }
          });
        } else {
          callback(403, {
            error: 'Missing required token in header, or token is invalid'
          });
        }
      });
    } else {
      callback(400, { error: 'Missing Field to Update' });
    }
  } else {
    callback(400, { error: 'Missing Required Field' });
  }
};

// Users - DELETE
// Required Data: phone
users.delete = (data, callback) => {
  // Check that phone no is valid
  const phone =
    typeof data.queryString.phone == 'string' &&
    data.queryString.phone.trim().length === 10
      ? data.queryString.phone.trim()
      : false;

  if (phone) {
    // Get the token from the headers
    const token =
      typeof data.headers.token === 'string' ? data.headers.token : false;

    // Verify the given token is valid for the phone no
    tokens.verify(token, phone, tokenIsValid => {
      if (tokenIsValid) {
        // Look up the user
        db.read('users', phone, (err, result) => {
          if (!err && result) {
            // Remove the user
            db.delete('users', phone, delErr => {
              if (!delErr) {
                // Delete each of the checks associated wuth the user
                const userChecks =
                  typeof result.checks === 'object' &&
                  result.checks instanceof Array
                    ? result.checks
                    : [];
                const checkToDelete = userChecks.length;
                if (checkToDelete > 0) {
                  let checksDeleted = 0;
                  let deletionErrors = false;
                  // Loop through the checks
                  userChecks.forEach(checkId => {
                    // Delete the check
                    db.delete('checks', checkId, err => {
                      if (err) {
                        deletionErrors = true;
                      }
                      checksDeleted++;

                      if (checksDeleted === checkToDelete) {
                        if (!deletionErrors) {
                          callback(200);
                        } else {
                          callback(500, {
                            error:
                              "Error encountered while trying to delete the user so some of the user's checks may be still in the system"
                          });
                        }
                      }
                    });
                  });
                } else {
                  callback(200);
                }
              } else {
                callback(500, { error: 'Could not delete the specified user' });
              }
            });
          } else {
            callback(404, { error: 'User Not Found' });
          }
        });
      } else {
        callback(403, {
          error: 'Missing required token in header, or token is invalid'
        });
      }
    });
  } else {
    callback(400, { error: 'Missing Required Field' });
  }
};

module.exports = users;
