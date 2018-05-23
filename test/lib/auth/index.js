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

const Auth = require('../../../lib/auth');

describe('lib/auth/auth.js', function () {

	describe('$decodeJWT', function(){
		it('should return correctly decoded', function(){
			let token = {'exp':ttl.getTime(),'payload':{'a':1}};
			let testencode = JWT.encode(token,process.env.JWT_SECRET);
			let testdecode = Auth.decodeJWT(testencode, process.env.JWT_SECRET);
			expect(testdecode).to.deep.equal(token);
		});
	});

	describe('$encodeJWT', function(){
		it('should return correctly decoded', function(){
			let token = {'exp':ttl.getTime(),'payload':{'a':1}};
			let testencode = Auth.encodeJWT(token,process.env.JWT_SECRET);
			expect(testencode).to.deep.equal(JWT.encode(token, process.env.JWT_SECRET));
		});
	});


	describe('#constructor', function () {
		const auth = new Auth(process.env.JWT_SECRET, {});
		it('should return instanceof Auth', function(){
			expect(auth).to.be.instanceof(Auth);	
		});
	});

	describe('#generateAuthMiddleWare', function () {
		const auth = new Auth(process.env.JWT_SECRET, {});
		const user_jwt = JWT.encode({'exp': ttl.getTime(), 'user':{'id':'123'}}, process.env.JWT_SECRET );
		
		it('should return an function for use as authentication middleware',
			function () {
				const headers = { 'authorization': 'Bearer ' + user_jwt };
				const req = MEREQ(headers);
				const res = new (require('../../mock/express/response.js'))();

				const func_authChecker = auth.generateAuthMiddleWare();

				assert.equal(func_authChecker.length, 3, 'Middleware should expect three arguments');
			}
		);
	});

});
