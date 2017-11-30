const fs = require('fs');
const async = require('async');
const _path = require('path');
const Api = require('./api');

/**
 * Module that defines several util functions, such as object factories, and file system utils.
 * This functions represent the steps required to upload the files to create the gist.
 * @module utils
 */

 /**
 * This function builds the object that ends beign uploaded
 * @param {array} files array that contains files objects
 * @param {string} description description of the gist
 * @return {Object} structure of a gist as an object
 */
const createBody = (files, description = '') => ({
  description,
  public: true,
  files: files.reduce((acc, file) => ({ ...acc, ...file}), {})
});

/**
* This function builds and object that represents the file
* @param {string} fileName the name of the file
* @param {string} content the content of the file as string
* @return {Object} structure of a file as an object
*/
const createFile = (fileName, content) => ({
  [fileName]: { content }
});

/**
* This function acts as an intermediary in the chain of async's waterfall method
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

/**
* This function reads a given directoy to get file names
* @param {string} dir the files names
* @param {string} description description of the gist
* @param {Callback} callback async's waterfall callback.
* @return {Callback} async's waterfall callback
*/
const getFileNamesFromDir = (dir, description, callback) => {
  fs.readdir(dir, (err, fileNames) => {
    const filesFullPath = fileNames.map(base => _path.format({ dir, base }));
    callback(err, fileNames, filesFullPath, description);
  });
};

/**
* This function takes a given path and resolves if it is a file or a directory
* @param {string} path the path to resolve
* @param {string} description description of the gist
* @param {Callback} callback async's waterfall callback.
* @return {Callback} async's waterfall callback
*/
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
