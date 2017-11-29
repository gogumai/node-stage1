const async = require('async');
const Utils = require('./src/utils');

const PATH_ARGV_INDEX = 2;
const DESCRIPTION_ARGV_INDEX = 3;

const path = process.argv[PATH_ARGV_INDEX];
const description = process.argv[DESCRIPTION_ARGV_INDEX];

const resultsFunction = (err, result) => {
  if(err) {
    console.log(err);
    return;
  }
  console.log(result);
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
    resultsFunction
  );
}

main(path, description);
