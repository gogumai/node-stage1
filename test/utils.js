const { expect } = require('chai');
const utils = require('../src/utils');
const mock = require('mock-fs');
const nock = require('nock');

const API_URL_BASE = 'https://api.github.com';
const API_URL_GIST = '/gists';

describe('utils', () => {
  beforeEach(() => {
    mock({
      'path/to/fake/dir': {
        'some-file1.txt': 'content for file1',
        'some-file2.txt': 'content for file2',
      },
      'some-file.txt': 'content for file',
    });
  });

  describe('resolvePath', () => {
    describe('given a file path, a description and a callback', () => {
      it('should call the callback with an array with the file name, the file path and the description', (done) => {
        const expected = {
          err: null,
          fileNames: ['some-file.txt'],
          filesFullPath: ['some-file.txt'],
          description: 'description',
        };
        utils.resolvePath(
          'some-file.txt',
          'description',
          (err, fileNames, filesFullPath, description) => {
            const result = {
              err,
              fileNames,
              filesFullPath,
              description,
            };
            expect(result).to.deep.equal(expected);
            done();
          },
        );
      });
    });
    describe('given a directory path, a description and a callback', () => {
      it('should call the callback with an array of file names, an array with the file paths and the description', (done) => {
        const expected = {
          err: null,
          fileNames: [
            'some-file1.txt',
            'some-file2.txt',
          ],
          filesFullPath: [
            'path/to/fake/dir/some-file1.txt',
            'path/to/fake/dir/some-file2.txt',
          ],
          description: 'description',
        };
        utils.resolvePath(
          'path/to/fake/dir',
          'description',
          (err, fileNames, filesFullPath, description) => {
            const result = {
              err,
              fileNames,
              filesFullPath,
              description,
            };
            expect(result).to.deep.equal(expected);
            done();
          },
        );
      });
    });
  });

  describe('createFilesArray', () => {
    describe('given an array of file names, file paths, a description and a callback', () => {
      it('should call the callback with an array of file objects, and the description', (done) => {
        const expected = {
          err: null,
          files: [{ 'some-file.txt': { content: 'content for file' } }],
          description: 'description',
        };
        utils.createFilesArray(
          ['some-file.txt'],
          ['some-file.txt'],
          'description',
          (err, files, description) => {
            const result = {
              err,
              files,
              description,
            };
            expect(result).to.deep.equal(expected);
            done();
          },
        );
      });
    });
  });

  describe('createPostBody', () => {
    describe('given an array of file objects, a description and a callback', () => {
      it('should create the body of the POST as an object', (done) => {
        const expected = {
          err: null,
          body: {
            description: 'description',
            public: true,
            files: { 'some-file.txt': { content: 'content for file' } },
          },
        };
        utils.createPostBody(
          [{ 'some-file.txt': { content: 'content for file' } }],
          'description',
          (err, body) => {
            const result = {
              err,
              body,
            };
            expect(result).to.deep.equal(expected);
            done();
          },
        );
      });
    });
  });

  describe('createPostData', () => {
    const responseOkFraction = {
      url: 'https://api.github.com/gists/501cf9b7b7c2ae89b77e980a5f2cba18',
      id: '501cf9b7b7c2ae89b77e980a5f2cba18',
      html_url: 'https://gist.github.com/501cf9b7b7c2ae89b77e980a5f2cba18',
      public: true,
      created_at: '2017-12-01T15:14:44Z',
      description: 'description',
      files: {
        'some-file.txt': {
          filename: 'some-file.txt',
          content: 'content for file',
        },
      },
    };
    beforeEach(() => {
      nock(API_URL_BASE).post(API_URL_GIST).reply(201, responseOkFraction);
    });
    describe('given an object representing the gist body and callback', () => {
      it('should return the gist url when the upload finishes', (done) => {
        const body = {
          description: 'description',
          public: true,
          files: { 'some-file.txt': { content: 'content for file' } },
        };
        utils.createPostData(
          body,
          (err, gistUrl) => {
            expect(err).to.equal(null);
            expect(responseOkFraction.html_url).to.equal(gistUrl);
            done();
          },
        );
      });
    });
  });
});
