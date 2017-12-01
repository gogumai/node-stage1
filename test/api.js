const { expect } = require('chai');
const api = require('../src/api');
const nock = require('nock');

const API_URL_BASE = 'https://api.github.com';
const API_URL_GIST = '/gists';

describe('api', () => {
  describe('postData', () => {
    describe('given an object representing the gist body and a callback', () => {
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
      it('should return the gist url when the upload finishes', (done) => {
        const body = {
          description: 'description',
          public: true,
          files: { 'some-file.txt': { content: 'content for file' } },
        };
        api.postData(
          body,
          (err, gistUrl) => {
            expect(err).to.equal(null);
            expect(responseOkFraction.html_url).to.equal(gistUrl);
            done();
          },
        );
      });
    });

    describe('given an incomplete or wrong object representation of the gist body and a callback', () => {
      const responseError = new Error("Couldn't upload file to GitHub");

      beforeEach(() => {
        nock(API_URL_BASE).post(API_URL_GIST).reply(422, responseError);
      });

      it('should return an error', (done) => {
        const wrongBody = {
          description: 'description',
          public: true,
          files: { 'some-file.txt': { } },
        };
        api.postData(
          wrongBody,
          (err, gistUrl) => {
            expect(err.message).to.equal(responseError.message);
            expect(gistUrl).to.be.undefined;
            done();
          },
        );
      });
    });
  });
});
