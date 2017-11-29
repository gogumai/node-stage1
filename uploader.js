const async = require('async');
const path = require('path');
const fs = require('fs');
const Api = require('./src/api');

const args = process.argv.slice(2);

const createBody = (files) => ({
  public: true,
  files: files.reduce((acc, file) => ({ ...acc, ...file}), {})
});
const createFile = (fileName, content) => ({
  [fileName]: { content }
});

const createPostBody = (files, callback) => callback(null, createBody(files));
const createPostData = (data, callback) => Api.postData(data, callback);
const createFilesArray = (fileNames, filesFullPath, callback) => {
  // Read file contents to make File object array
  async.map(
    filesFullPath,
    fs.readFile,
    (err, contents) => callback(
      err,
      contents.map((content, i) => createFile(fileNames[i], content.toString().trim()))
    )
  )
};
const getFileNamesFromDir = (dir, callback) => {
  // Read directoy to get file names
  fs.readdir(dir, (err, fileNames) => {
    const filesFullPath = fileNames.map(base => path.format({ dir, base }));
    callback(err, fileNames, filesFullPath);
  });
};

const resultsFunction = (err, result) => {
  if(err) {
    console.log(err);
    return;
  }
  console.log(result);
};

const main = () => {
  let _path = path.normalize(args[0]);
  let initialSteps = [];
  fs.stat(args[0], (err, stats) => {
    if (err) {
      console.log('Error trying to read file or folder');
      throw err
    };
    // File
    if (stats.isFile()) {
      initialSteps = [
        async.constant([_path], [_path]),
      ];
    }
    // Directory
    if (stats.isDirectory()) {
      initialSteps = [
        async.constant(_path),
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

main();
