const fs = require('fs');
const async = require('async');
const pathLib = require('path');
const Api = require('./api');

/**
 * Module that defines several util functions, such as object factories, and file system utils.
 * This functions represent the steps required to upload the files to create the gist.
 * @module utils
 */

/**
* This function builds the object that ends being uploaded
* @param {array} files array that contains files objects
* @param {string} description description of the gist
* @return {Object} structure of a gist as an object
*/
const createBody = (files, description = '') => ({
  description,
  public: true,
  files: files.reduce((acc, file) => ({ ...acc, ...file }), {}),
});

/**
* This function builds and object that represents the file
* @param {string} fileName the name of the file
* @param {string} content the content of the file as string
* @return {Object} structure of a file as an object
*/
const createFile = (fileName, content) => ({
  [fileName]: { content },
});

/**
* This function acts as an intermediary in the chain of async's waterfall method.
* It builds the body of the post to pass it to the next function in the chain
* @see createBody
* @param {array} files the name of the file
* @param {string} description description of the gist
* @param {Callback} callback async's waterfall callback.
* @return {Callback} async's waterfall callback
*/
const createPostBody = (files, description, callback) =>
  callback(null, createBody(files, description));

/**
* This function calls the Api module to upload the data
* @param {Object} data the object that represents the gist
* @param {Callback} callback async's waterfall callback.
* @return {Callback} async's waterfall callback
*/
const createPostData = (data, callback) => Api.postData(data, callback);

/**
* This function creates and array with file objects (that contains the name and its contents)
* and calls the callback to pass it along
* @param {array} fileNames the files names
* @param {array} filesFullPath the files directory path
* @param {string} description description of the gist
* @param {Callback} callback async's waterfall callback.
* @return {Callback} async's waterfall callback
*/
const createFilesArray = (fileNames, filesFullPath, description, callback) => {
  async.map(
    filesFullPath,
    fs.readFile,
    (err, contents) => callback(
      err,
      contents.map((content, i) => createFile(fileNames[i], content.toString().trim())),
      description,
    ),
  );
};

/**
* This function reads a given directory to get file names
* @param {string} dir the files names
* @param {string} description description of the gist
* @param {Callback} callback async's waterfall callback.
* @return {Callback} async's waterfall callback
*/
const getFileNamesFromDir = (dir, description, callback) => {
  fs.readdir(dir, (err, fileNames) => {
    const filesFullPath = fileNames.map(base => pathLib.format({ dir, base }));
    return callback(err, fileNames, filesFullPath, description);
  });
};

/**
* This function takes a given path and resolves if it's a file or a directory
* @param {string} path the path to resolve
* @param {string} description description of the gist
* @param {Callback} callback async's waterfall callback.
* @return {Callback} async's waterfall callback
*/
const resolvePath = (path, description, callback) => {
  const normalizedPath = pathLib.normalize(path);
  fs.stat(normalizedPath, (err, stats) => {
    if (err) return callback(err);
    if (stats.isDirectory()) {
      return getFileNamesFromDir(
        normalizedPath,
        description,
        callback,
      );
    } else if (stats.isFile()) {
      return callback(err, [normalizedPath], [normalizedPath], description);
    }
    return callback(new Error("Couldn't resolve path"));
  });
};

module.exports = {
  resolvePath,
  createFilesArray,
  createPostBody,
  createPostData,
};
