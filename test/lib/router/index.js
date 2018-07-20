/* test/lib/router/index.js */
'use strict';

const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const assert = chai.assert;

const MEREQ = require('../../mock/express/request.js');
const express = require('express');
const Router = require('../../../lib/router');
const RESPOND = require('../../../lib/respond');
const RX = require('../../../lib/reqvalidator');
const { Auth, AuthByPrivs } = require('../../../lib/auth');
const JSONValidator = require('../../../lib/jsonvalidator');

describe('lib/router', function () {

	describe('#constructor', function () {
		let auth = new AuthByPrivs(process.env.JWT_SECRET, {});
		let schemas = [
			{ "$schema":"http://json-schema.org/draft-06/schema#","$id":"testin", "type":["number","string","boolean","null","object","array"] },
			{ "$schema":"http://json-schema.org/draft-06/schema#","$id":"testout","type":["number","string","boolean","null","object","array"] }
		];
		let jv = new JSONValidator(schemas);
		const mwares = function ( req, res ) {
			RESPOND.success(res,req,respond.wrapSuccessData("a response!", req.path));
		};
		const routes = [ { method:'post', path:'/test', rprivs:[1], rxvalid:RX.NOT_APP_JSON|RX.NOT_ACCEPT_JSON, validreq:'testin', validres:'testout', mwares:mwares } ];
		const router = new Router({}, auth, jv);
		router.addRoutes(routes);
		it('should return instanceof Router (express.Router)', function(){
			expect(router).to.be.instanceof(Router);
		});
	});

});
