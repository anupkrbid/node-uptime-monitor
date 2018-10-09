/**
 * Library for Storing and Editing Data
 */

// Dependencies
const fs = require('fs');
const path = require('path');

const helpers = require('./helpers');

// Container for the Module (to be exoiertd)
const lib = {
  baseDir: path.join(__dirname, '../.db/')
};

// Create data to a File
lib.create = (dir, file, data, callback) => {
  // Open file for writing
  fs.open(`${lib.baseDir + dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
    if (!err && !!fileDescriptor) {
      // Convert data to string
      const str = JSON.stringify(data);
      // Write the file and close it
      fs.writeFile(fileDescriptor, str, err => {
        if (!err) {
          fs.close(fileDescriptor, err => {
            if (!err) {
              callback(false);
            } else {
              callback('Error closing new file.');
            }
          });
        } else {
          callback('Error writing to new file.');
        }
      });
    } else {
      callback('Could not create file, it may already exist.');
    }
  });
};

// Read data from a File
lib.read = (dir, file, callback) => {
  fs.readFile(`${lib.baseDir + dir}/${file}.json`, 'utf-8', (err, data) => {
    if (!err && data) {
      const parsedData = helpers.parseJsonToObject(data);
      callback(false, parsedData);
    } else {
      callback(err, data);
    }
  });
};

// Update data from a File
lib.update = (dir, file, data, callback) => {
  // Open file for writing
  fs.open(`${lib.baseDir + dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
    if (!err && !!fileDescriptor) {
      // Convert data to string
      const str = JSON.stringify(data);
      // Truncate the file before writing
      fs.truncate(fileDescriptor, err => {
        if (!err) {
          // Write the file and close it
          fs.writeFile(fileDescriptor, str, err => {
            if (!err) {
              fs.close(fileDescriptor, err => {
                if (!err) {
                  callback(false);
                } else {
                  callback('Error closing new file.');
                }
              });
            } else {
              callback('Error writing to new file.');
            }
          });
        } else {
          callback('Error truncating the file.');
        }
      });
    } else {
      callback('Could not open file for updating, it may not exist.');
    }
  });
};

// Delete a file
lib.delete = (dir, file, callback) => {
  // Unlink the file
  fs.unlink(`${lib.baseDir + dir}/${file}.json`, (err, fileDescriptor) => {
    if (!err) {
      callback(false);
    } else {
      callback('Error deleting file.');
    }
  });
};

// Export the Module
module.exports = lib;
