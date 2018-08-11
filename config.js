/**
 * Create and export configuration variables // NODE_ENV=prod node server.js // way to start server from command-line
 */

// Configuration for all the Environments
const config = {
  // Development (default) Environment
  dev: {
    HTTP_PORT: 3000,
    HTTPS_PORT: 3001,
    ENV: 'development'
  },
  // Production Environment
  prod: {
    HTTP_PORT: 8080,
    HTTPS_PORT: 8081,
    ENV: 'production'
  }
};

// Determine which environment was passed as a command-line argument
const passedEnv =
  typeof process.env.NODE_ENV === 'string'
    ? process.env.NODE_ENV.toLowerCase()
    : 'dev';

// Check that the passed environment is one of the enviorments above, if not, default to dev
const envToExport =
  typeof config[passedEnv] === 'object' ? config[passedEnv] : config.dev;

// Export the config module
module.exports = envToExport;
