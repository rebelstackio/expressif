/* lib/auth/index.js */
'use strict';

const simple = require("./simple");
const authbyprivs = require("./authbyprivs");

module.exports = { Auth:simple, AuthByPrivs:authbyprivs };
