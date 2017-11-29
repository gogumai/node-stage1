const fs = require('fs');
const async = require('async');
const _path = require('path');
const Api = require('./api');

const createBody = (files, description = '') => ({
  description,
  public: true,
  files: files.reduce((acc, file) => ({ ...acc, ...file}), {})
});
const createFile = (fileName, content) => ({
  [fileName]: { content }
});

const createPostBody = (files, description, callback) =>
  callback(null, createBody(files, description));
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

const resolvePath = (path, description, callback) => {
  path = _path.normalize(path);
  fs.stat(path, (err, stats) => {
    if (err) {
      console.log('Error trying to read file or folder');
      throw err
    };
    if (stats.isDirectory()) { // Directory
      getFileNamesFromDir(path, description, (err, fileNames, filesFullPath, description) => {
        return callback(err, fileNames, filesFullPath, description);
      });
    } else if (stats.isFile()) { // File
      return callback(err, [path], [path], description)
    } else {
      throw new Error("Couldn't resolve path");
    }
  });
};

module.exports = {
  resolvePath,
  createFilesArray,
  createPostBody,
  createPostData,
}
