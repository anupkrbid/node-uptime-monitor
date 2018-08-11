/**
 * Primary filr for the API
 */

// Dependencies
const http = require('http');
const url = require('url');

// The server should respond to all requests with a string
const server = http.createServer((req, res) => {
  // Get the url and parse it
  const parsedUrl = url.parse(req.url, true); // true: calls the 'query strings' module and sends the url to be parsed and the query strings object to be returned

  // Get the path
  const path = parsedUrl.pathname; // untrimmed path that the user requested
  const trimmedPath = path.replace(/^\/+|\/+$/g, ''); // this regex removes any slash at the end of the url with blank

  // Send the resonse
  res.end(`Request Received on this path: ${trimmedPath}\n`);

  // Log the request path
});

// Start the server, and have it listen to port 3000
server.listen(3000, () => {
  console.log('Server is listening on port 3000 now');
});
