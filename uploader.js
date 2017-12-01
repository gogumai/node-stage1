const async = require('async');
const prompt = require('prompt');
const Utils = require('./src/utils');

const PATH_ARGV_INDEX = 2;
const DESCRIPTION_ARGV_INDEX = 3;
const pathArg = process.argv[PATH_ARGV_INDEX];
const descriptionArg = process.argv[DESCRIPTION_ARGV_INDEX];

/**
 * Main module that gets executed
 * @module uploader
 */

// Start the prompt
prompt.start();

// Prompt schema
const schema = {
  properties: {
    retry: {
      description: 'retry? (y/n) ',
      default: 'y',
      pattern: /^(?:y|n)$/,
      message: "'You must enter 'y' or 'n'",
      required: true,
    },
  },
};

/**
* This function triggers the main execution path way. That being the async's waterfall method
* that chains the steps required to perform the upload.
* It also provides a mechanism to retry the upload if an error ocurs.
* When the process finishes it logs the gist's url.
* @param {string} path the path given by the user
* @param {string} description description of the gist
*/
const main = (path, description) => {
  async.waterfall(
    [
      async.constant(path, description),
      Utils.resolvePath,
      Utils.createFilesArray,
      Utils.createPostBody,
      Utils.createPostData,
    ],
    (err, result) => {
      if (err) {
        console.log('Something wrong happened: ', err.message);
        prompt.get(schema, (error, userInput) => {
          if (userInput && userInput.retry === 'y') {
            console.log('Retrying...');
            main(path, description);
          }
        });
        return;
      }
      console.log('Gist url: ', result);
    },
  );
};
main(pathArg, descriptionArg);
