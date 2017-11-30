const request = require('request');
const { Readable } = require('stream');
const ProgressBar = require('ascii-progress');

const API_URL = 'https://api.github.com/gists';

/**
 * Api to upload gist data to Github.
 * @module api
 */

/**
* This function makes an HTTP POST to upload the gist data.
* @param  {Object} data object containing gist data
* @param {Callback} callback async's waterfall callback.
*/
const postData = (data, callback) => {
  const progressBar = new ProgressBar({
    schema: 'Completed :bar :percent :elapseds',
    total: 100,
  });

  const stringifiedData = JSON.stringify(data);
  const size = Buffer.byteLength(stringifiedData);

  let bytesWritten = 0;
  let progress = 0;
  const ProgressBarInterval = setInterval(() => {
    progressBar.tick(progress);
    if (progressBar.completed) {
      clearInterval(ProgressBarInterval);
    }
  }, 100);

  const postOptions = {
    url: API_URL,
    json: true,
    headers: {
      'content-type': 'application/json',
      'User-Agent': 'gogumai',
    },
  };

  const stream = new Readable();
  stream.push(stringifiedData); // the string to be on the stream
  stream.push(null); // indicates end-of-file - the end of the stream

  stream.pipe(request.post(postOptions, (err, res, body) => {
    if (err) {
      progressBar.completed = true;
      progressBar.clear();
      return callback(err);
    }
    // res.statusCode = 500;
    if (res && (res.statusCode === 200 || res.statusCode === 201)) {
      return callback(null, body.html_url);
    }
    return callback(new Error("Couldn't upload file to GitHub"));
  })).on('data', (chunk) => {
    bytesWritten += chunk;
    progress = (bytesWritten.length * 100) / size;
  });
};

module.exports = {
  postData,
};
