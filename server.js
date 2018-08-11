/**
 * Primary File for the API
 */
var a = require('./config');
// Dependencies
const http = require('http');
const url = require('url');
const { StringDecoder } = require('string_decoder');

const config = require('./config');

// The Server should respond to all Requests with a String
const server = http.createServer((req, res) => {
  // Get the URL and Parse it
  const parsedUrl = url.parse(req.url, true); // true: calls the 'Query Strings' module and sends the URL to be Parsed and the query strings object to be returned

  // Get Query String as an Object, if any
  const queryStringObject = parsedUrl.query;

  // Get Headers as an Object
  const headers = req.headers;

  // Get the path
  const path = parsedUrl.pathname; // untrimmed path that the user requested
  const trimmedPath = path.replace(/^\/+|\/+$/g, ''); // this regex removes any slash at the end of the url with blank

  // Get HTTP Method
  const method = req.method.toUpperCase();

  // Get the Payload, if any
  const decoder = new StringDecoder('utf-8');
  var buffer = '';

  req.on('data', data => {
    buffer += decoder.write(data);
  });

  req.on('end', () => {
    buffer += decoder.end();

    // Choose the handler the Request should got to. if one is not found use the notFound Handler
    // const choosenHandler =
    //   typeof router[trimmedPath] !== undefined
    //     ? router[trimmedPath]
    //     : handlers.notFound;

    const choosenHandler = !!router[trimmedPath]
      ? router[trimmedPath]
      : handlers.notFound;

    const data = {
      path: trimmedPath,
      queryString: queryStringObject,
      method: method,
      headers: headers,
      body: buffer
    };

    // Route the request to the handler specified in the router
    choosenHandler(data, (statusCode, payload) => {
      // Use the status code called by the handler, or default to 200
      statusCode = typeof statusCode === 'number' ? statusCode : 200;

      // Use the payload called by hte handler, or default to an empty object
      payload = typeof payload === 'object' ? payload : {};

      // Convert the payload to a string
      const payloadString = JSON.stringify(payload);

      // Return the Response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
    });
  });
});

// Start the Server, and have it Listen to Port 3000
server.listen(config.PORT, () => {
  console.log(
    `Server is Listening on port ${config.PORT}, in ${config.ENV} mode.`
  );
});

// Define the handlers
const handlers = {
  sample: (data, callback) => {
    // callback a http status code and a payload object
    callback(406, { name: 'sample handle' });
  },
  notFound: (data, callback) => {
    callback(404);
  }
};

// Define a request router
const router = {
  sample: handlers.sample
};
