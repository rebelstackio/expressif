'use strict';

const chai = require("chai");
const assert = chai.assert;

const RESPOND = require('../../../lib/respond');
const ERROR = require('../../../lib/error');
const MERESP = require('../../mock/express/response.js');

describe('lib/respond/index.js', function () {

    describe('#respondNotAuthorized', function () {

        const req = {};
        const res = new MERESP();
        const e = new ERROR.AuthError('JWT Authorization is required', ERROR.codes.JWT_CREDS_REQUIRED);
        const sendResp = RESPOND.notAuthorized(res, req, e);

        it('should send response with x-error-code header equal to error code',
            function () {
                assert.equal(sendResp._header['X-Error-Code'], e.code, "Error codes should match");
            }
        );
        it('should send response with no body',
            function () {
                assert.isUndefined(sendResp.body, "No body for error returns");
            }
        );
    });

    // describe('method Process', function() {});
});
