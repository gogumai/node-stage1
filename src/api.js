const request = require('request');
const Readable = require('stream').Readable;
const ProgressBar = require('ascii-progress');
const API_URL = 'https://api.github.com/gists';
/**
 * Api to upload gist data through HTTP POST.
 * @module api
 */

 const progressBar = new ProgressBar({
   schema: 'Uploading :bar :percent :elapseds',
   total: 100,
 });

module.exports = {
  /**
  * postData makes an HTTP POST to uploa the gist data.
  * @param  {Object} data object containing gist data
  */
  postData(data) {
    const stringifiedData = JSON.stringify(data);
    const size = Buffer.byteLength(stringifiedData);

    // ------- ProgressBar stuff -------
    let bytesWritten = 0;
    let progress = 0;
    const ProgressBarInterval = setInterval(() => {
      progressBar.tick(progress);
      if (progressBar.completed) {
        clearInterval(ProgressBarInterval);
      }
    }, 100);
    // ----- End ProgressBar stuff -----

    var postOptions = {
      url: API_URL,
      json: true,
      headers: {
        'content-type': 'application/json',
        'User-Agent': 'gogumai',
      }
    };

    const stream = new Readable;
    stream.push(stringifiedData); // the string to be on the stream
    stream.push(null); // indicates end-of-file - the end of the stream

    const httpRequest = stream.pipe(request.post(postOptions, (err, res, body) => {
      if (err) {
        console.log('Error', err);
        progressBar.completed = true;
        progressBar.clear();
        return;
      }
      if (res && (res.statusCode === 200 || res.statusCode === 201)) {
        console.log(body.html_url);
      }
    })).on('data', (chunk) => {
        bytesWritten += chunk;
        progress = (bytesWritten.length * 100) / size;
    });
  },
};
