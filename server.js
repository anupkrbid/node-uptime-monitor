/**
 * Primary File for the API
 */

// Dependencies
const http = require('http');
const url = require('url');

// The Server should respond to all Requests with a String
const server = http.createServer((req, res) => {
  // Get the URL and Parse it
  const parsedUrl = url.parse(req.url, true); // true: calls the 'Query Strings' module and sends the URL to be Parsed and the query strings object to be returned

  // Get Query String as an Object
  const queryStringObject = parsedUrl.query;

  // Get Headers as an Object
  const headers = req.headers;

  // Get the path
  const path = parsedUrl.pathname; // untrimmed path that the user requested
  const trimmedPath = path.replace(/^\/+|\/+$/g, ''); // this regex removes any slash at the end of the url with blank

  // Get HTTP Method
  const method = req.method.toUpperCase();

  // Send the Resonse
  res.end(
    `Request Received on path: ${trimmedPath}, with Query String ${JSON.stringify(
      queryStringObject
    )}, with headers: ${JSON.stringify(headers)} and with method: ${method}\n`
  );
});

// Start the Server, and have it Listen to Port 3000
server.listen(3000, () => {
  console.log('Server is listening on port 3000 now');
});
