/**
 * Request Handlers
 */
const users = require('./handlers/users');
const tokens = require('./handlers/tokens');
const checks = require('./handlers/checks');

const handlers = {};

handlers.ping = (data, callback) => {
  // callback a http status code and a payload object
  callback(200);
};

handlers.users = (data, callback) => {
  const acceptableMethods = ['get', 'post', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    users[data.method](data, callback);
  } else {
    callback(405); // method not allowed
  }
};

handlers.tokens = (data, callback) => {
  const acceptableMethods = ['get', 'post', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    tokens[data.method](data, callback);
  } else {
    callback(405); // method not allowed
  }
};

handlers.checks = (data, callback) => {
  const acceptableMethods = ['get', 'post', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    checks[data.method](data, callback);
  } else {
    callback(405); // method not allowed
  }
};

handlers.hello = (data, callback) => {
  // callback a http status code and a payload object
  callback(200, { message: 'Homework Assignment #1' });
};

handlers.notFound = (data, callback) => {
  callback(404);
};

module.exports = handlers;
