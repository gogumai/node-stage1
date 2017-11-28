const https = require('https');
var request = require('request');
var async = require('async');
const path = require('path');
const fs = require('fs');
const API_URL_BASE = 'api.github.com';
const API_URL_GISTS = '/gists';
var args = process.argv.slice(2);

const createBody = (files) => ({
  public: true,
  files: files.reduce((acc, file) => ({ ...acc, ...file}), {})
});
const createFile = (fileName, content) => ({[fileName]: { content }});

const postData = (data, callback) => {
  let stringifieddData = JSON.stringify(data);
  var postOptions = {
    host: API_URL_BASE,
    path: API_URL_GISTS,
    method: 'POST',
    headers: {
      'User-Agent': 'gogumai',
      'Content-Length': Buffer.byteLength(stringifieddData)
    }
  };

  var req = https.request(postOptions, res => {
    let body = '';
    let fileBytes = res.headers['content-length'];
    let uploadedBytes = 0;
    res.on('data', function(chunk) {
      // console.log(chunk.toString());
      body += chunk;
      uploadedBytes += chunk.length;
      let progress = (uploadedBytes / fileBytes) * 100;

      console.log(`${parseInt(progress, 10)}%`);
    });
    res.on('end', () => {
      // console.log(JSON.parse(body).html_url);
      if (callback) callback(null, JSON.parse(body).html_url)
    });
  }).on("error", err => {
    // console.log("Error: " + err.message);
    if (callback) callback("Error: " + err.message)
  });

  req.write(stringifieddData);
  req.end();


  // var options = {
  //   url: 'https://' + API_URL_BASE + API_URL_GISTS,
  //   method: 'POST',
  //   headers: {
  //     'User-Agent': 'gogumai',
  //     'Content-type': 'application/json'
  //   },
  //   json: JSON.parse(data)
  // };
  // //
  // // console.log(JSON.stringify(options.body))
  // let r = request(options, function(err, res, body) {
  //   // console.log(JSON.stringify(res))
  //   if (err) {
  //     console.log(err);
  //     return;
  //   }
  //   if (res && (res.statusCode === 200 || res.statusCode === 201)) {
  //     console.log(body.html_url);
  //   }
  // });
  // setInterval(() => {
  //   console.log("Uploaded: " + r.req.connection.bytesWritten);
  // }, 250);

  // let size = fs.lstatSync(data).size;
  // let bytes = 0;
  //
  // // var options = {
  // //   url: 'https://' + API_URL_BASE + API_URL_GISTS,
  // //   method: 'POST',
  // //   headers: {
  // //     'User-Agent': 'gogumai',
  // //     'Content-type': 'application/json'
  // //   },
  // //   json: JSON.parse(data)
  // // };
  // //
  // // console.log(JSON.stringify(options.body))
  // request.post({
  //   url: 'https://' + API_URL_BASE + API_URL_GISTS,
  //   body: fs.createReadStream(data).on('data', (chunk) => {
  //     console.log(bytes += chunk.length, size);
  //   }),
  //   headers: {
  //     'User-Agent': 'gogumai',
  //   },
  // },
  // function(err, res, body) {
  //   console.log(JSON.stringify(res))
  //   if (err) {
  //     console.log(err);
  //     return;
  //   }
  //   if (res && (res.statusCode === 200 || res.statusCode === 201)) {
  //     console.log(body.html_url);
  //   }
  // });

  // console.log(data)
  // fs.createReadStream(data)
  // // .on('data', (chunk) => {
  // //   console.log(chunk.length);
  // //   // console.log(bytes += chunk.length, size);
  // // })
  // .pipe(request.post(
  //   {
  //     url: 'https://' + API_URL_BASE + API_URL_GISTS,
  //     headers: { 'User-Agent': 'gogumai' }
  //   },
  //   function(err, res, body) {
  //     console.log(JSON.stringify(res))
  //     if (err) {
  //       console.log(err);
  //       return;
  //     }
  //     if (res && (res.statusCode === 200 || res.statusCode === 201)) {
  //       console.log(body.html_url);
  //     }
  //   }
  // ))
}

const resultsFunction = (err, result) => {
  if(err) {
    console.log(err);
    return;
  }
  console.log(result);
}
const createPostBody = (files, callback) => callback(null, createBody(files));
const createPostData = (data, callback) => postData(data, callback);

fs.stat(args[0], (err, stats) => {
  if (err) {
    console.log('Error trying to read file or folder');
    throw err
  };
  // File
  if (stats.isFile()) {
    async.waterfall(
      [
        (callback) => {
          let _path = path.normalize(args[0]);
          fs.readFile(_path, (err, contents) => {
            callback(err, [createFile(path.basename(_path), contents.toString().trim())]);
          });
        },
        createPostBody,
        createPostData
      ],
      resultsFunction
    );
  }
  // Directory
  if (stats.isDirectory()) {
    async.waterfall(
      [
        (callback) => {
          let _path = path.normalize(args[0]);
          fs.readdir(_path, (err, files) => {
            const filesFullPath = files.map(file => path.format({
              dir: _path,
              base: file
            }));
            callback(err, files, filesFullPath);
          });
        },
        (files, filesFullPath, callback) => {
          async.map(
            filesFullPath,
            fs.readFile,
            (err, contents) => callback(
              err,
              contents.map((content, i) => createFile(files[i], content.toString().trim()))
            )
          )
        },
        createPostBody,
        createPostData
      ],
      resultsFunction
    );
  }
});
