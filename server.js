/**
 * Primary File for the API
 */

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const { StringDecoder } = require('string_decoder');

const config = require('./config');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');

// Instantiate the HTTP Server
const httpServer = http.createServer((req, res) => {
  unifiedServer(req, res);
});

// Start the HTTP Server
httpServer.listen(config.HTTP_PORT, () => {
  console.log(
    `Server is Listening on port ${config.HTTP_PORT}, in ${config.ENV} mode.`
  );
});

// Instantiate the HTTPS Server
const httpsServerOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem')
};

const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
  unifiedServer(req, res);
});

// Start the HTTPS Server
httpsServer.listen(config.HTTPS_PORT, () => {
  console.log(
    `Server is Listening on port ${config.HTTPS_PORT}, in ${config.ENV} mode.`
  );
});

// All the server logic for both HTTP and HTTPS
const unifiedServer = (req, res) => {
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
  const method = req.method.toLowerCase();

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
      body: helpers.parseJsonToObject(buffer)
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
};

// Define a request router
const router = {
  ping: handlers.ping,
  users: handlers.users,
  hello: handlers.hello
};
