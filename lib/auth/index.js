/* lib/auth/index.js */
'use strict';

const simple = require('./simple');
const authbyprivs = require('./authbyprivs');
const authbyroles = require('./authbyroles');
module.exports = { Auth:simple, AuthByPrivs:authbyprivs, AuthByRoles:authbyroles };
