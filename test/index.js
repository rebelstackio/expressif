/*
    test/index.js
    We use this file to set up global configuration for all test.
*/

const path = require('path');
require('app-module-path').addPath(path.resolve('../', process.cwd()));
process.env.JWT_SECRET = 'lfiAK3u8UHCtTyAxLzKn4dcsMQd4JmnIsxs76wQS';
