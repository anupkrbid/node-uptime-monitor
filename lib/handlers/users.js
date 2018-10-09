const db = require('../data');
const helpers = require('../helpers');

const users = {};

// Users - GET
// Required Data: phone
// Optional Data: none
// @TODO Only Authenticated Users can access their objects. Don't let them access anyone elses
users.get = (data, callback) => {
  // Check that phone no is valid
  const phone =
    typeof data.queryString.phone == 'string' &&
    data.queryString.phone.trim().length === 10
      ? data.queryString.phone.trim()
      : false;

  if (phone) {
    // Look up the user
    db.read('users', phone, (err, result) => {
      if (!err && result) {
        // Remove the hashed password from the user object before returning it
        delete result.hashedPassword;
        callback(200, result);
      } else {
        callback(404, { error: 'User Not Found' });
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
              console.log(err);
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
// @TODO Only Authenticated Users can access their objects. Don't let them access anyone elses
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

  // Error if phone id invalid
  if (phone) {
    // Error if nothing is sent for update
    if (firstName || lastName || password) {
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
      callback(400, { error: 'Missing Field to Update' });
    }
  } else {
    callback(400, { error: 'Missing Required Field' });
  }
};

// Users - DELETE
// Required Data: phone
// @TODO Only Authenticated Users can access their objects. Don't let them access anyone elses
// @TODO Delete any other data related to this user
users.delete = (data, callback) => {
  // Check that phone no is valid
  const phone =
    typeof data.queryString.phone == 'string' &&
    data.queryString.phone.trim().length === 10
      ? data.queryString.phone.trim()
      : false;

  if (phone) {
    // Look up the user
    db.read('users', phone, (err, result) => {
      if (!err && result) {
        // Remove the user
        db.delete('users', phone, delErr => {
          if (!delErr) {
            callback(200);
          } else {
            callback(500, { error: 'Could not delete the specified user' });
          }
        });
      } else {
        callback(404, { error: 'User Not Found' });
      }
    });
  } else {
    callback(400, { error: 'Missing Required Field' });
  }
};

module.exports = users;