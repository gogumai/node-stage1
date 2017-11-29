const async = require('async');
const _path = require('path');
const fs = require('fs');
const Api = require('./src/api');

const PATH_ARGV_INDEX = 2;
const DESCRIPTION_ARGV_INDEX = 3;

const path = process.argv[PATH_ARGV_INDEX];
const description = process.argv[DESCRIPTION_ARGV_INDEX];

const createBody = (files, description = '') => ({
  description,
  public: true,
  files: files.reduce((acc, file) => ({ ...acc, ...file}), {})
});
const createFile = (fileName, content) => ({
  [fileName]: { content }
});

const createPostBody = (files, description, callback) => callback(null, createBody(files, description));
const createPostData = (data, callback) => Api.postData(data, callback);
const createFilesArray = (fileNames, filesFullPath, description, callback) => {
  // Read file contents to make File object array
  async.map(
    filesFullPath,
    fs.readFile,
    (err, contents) => callback(
      err,
      contents.map((content, i) => createFile(fileNames[i], content.toString().trim())),
      description,
    )
  )
};
const getFileNamesFromDir = (dir, description, callback) => {
  // Read directoy to get file names
  fs.readdir(dir, (err, fileNames) => {
    const filesFullPath = fileNames.map(base => _path.format({ dir, base }));
    callback(err, fileNames, filesFullPath, description);
  });
};

const resultsFunction = (err, result) => {
  if(err) {
    console.log(err);
    return;
  }
  console.log(result);
};

const main = (path, description) => {
  path = _path.normalize(path);
  let initialSteps = [];
  fs.stat(path, (err, stats) => {
    if (err) {
      console.log('Error trying to read file or folder');
      throw err
    };
    // File
    if (stats.isFile()) {
      initialSteps = [
        async.constant([path], [path], description),
      ];
    }
    // Directory
    if (stats.isDirectory()) {
      initialSteps = [
        async.constant(path, description),
        getFileNamesFromDir,
      ];
    }
    async.waterfall(
      [
        ...initialSteps,
        createFilesArray,
        createPostBody,
        createPostData
      ],
      resultsFunction
    );
  });
}

main(path, description);
