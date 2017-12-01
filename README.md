# node-stage1
Script that receives a dirname or filename and uploads the file or the files in a given directory as gists into GitHub. It will print the gist's url as result.
## Environment needed
- Install node.js 8, use Node Version Manager: (https://github.com/creationix/nvm/)
- Dependencies management: Yarn (https://yarnpkg.com/en/)
## How to run it
Run: `node uploader.js path/to/file/or/folder [description]`
## How to generate JSDocs
Run: `jsdoc . -r --verbose -d docs -c ./jsdoc-conf.json`
