/**
 * Primary filr for the API
 */

// Dependencies
const http = require('http');
const url = require('url');

// The server should respond to all requests with a string
const server = http.createServer((req, res) => {
  res.end('Hello World\n');
});

// Start the server, and have it listen to port 3000
server.listen(3000, () => {
  console.log('Server is listening on port 3000 now');
});
