/**
 * Test definitions for the auth library
 */
const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const assert = chai.assert;

const MEREQ = require('../../mock/express/request.js');

const JWT = require('jwt-simple');
let ttl = new Date();
ttl.setHours(ttl.getHours() + 1);
const user_jwt = JWT.encode(
    {
        'exp': ttl.getTime(),
        'user': {
            'id': '54630ce6c223d83494e2d776',
            'roles': [
                '507f191e810c19729de860ea',
                '54759eb3c090d83494e2d804',
                '57654cf3c123d65931e4f678'
            ],
            'name': 'super',
            'email': 'mocha@rebel.io'
        }
    },
    process.env.JWT_SECRET
);
const jwt_check = JWT.decode(user_jwt, process.env.JWT_SECRET);

const Auth = require('../../../lib/auth');

describe('lib/auth/auth.js', function () {
    describe('#generateAuthMiddleWare', function () {
        const auth = new Auth(process.env.JWT_SECRET, {});
        it('should return an function for use as authentication middleware',
            function () {
                const headers = { 'authorization': 'Bearer ' + user_jwt };
                const req = MEREQ(headers);
                const res = new (require('../../mock/express/response.js'))();

                const func_authChecker = auth.generateAuthMiddleWare();

                assert.equal(func_authChecker.length, 3, 'Middleware should expect three arguments');
            });
    });
    // describe('method Process', function() {});
});

// func_authChecker( req, res, function(){

//     console.log( req.dtoken )

//     done();

// } );
