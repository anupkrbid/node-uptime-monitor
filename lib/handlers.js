/**
 * Request Handlers
 */
const users = require('./handlers/users');

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

handlers.hello = (data, callback) => {
  // callback a http status code and a payload object
  callback(200, { message: 'Homework Assignment #1' });
};

handlers.notFound = (data, callback) => {
  callback(404);
};

module.exports = handlers;