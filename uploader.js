const async = require('async');
const prompt = require('prompt');
const Utils = require('./src/utils');
const Api = require('./src/api');

const PATH_ARGV_INDEX = 2;
const DESCRIPTION_ARGV_INDEX = 3;

const path = process.argv[PATH_ARGV_INDEX];
const description = process.argv[DESCRIPTION_ARGV_INDEX];

// Start the prompt
prompt.start();

// Prompt schema
var schema = {
  properties: {
    retry: {
      description: 'retry? (y/n) ',
      default: 'y',
      pattern: /^(?:y|n)$/,
      message: "'You must enter 'y' or 'n'",
      required: true
    },
  }
};

const main = (path, description) => {
  async.waterfall(
    [
      async.constant(path, description),
      Utils.resolvePath,
      Utils.createFilesArray,
      Utils.createPostBody,
      Utils.createPostData
    ],
    (err, result) => {
      if(err) {
        console.log('Something wrong happened: ', err.message);
        // Ask the user for retry
        prompt.get(schema, function (err, result) {
          if (result && result.retry === 'y') {
            console.log('Retrying...');
            main(path, description);
          }
        });
        return;
      }
      console.log('Gist url: ', result);
    }
  );
}
main(path, description);
