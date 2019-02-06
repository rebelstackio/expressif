/* test/lib/server/index.js */
'use strict';

const chai = require('chai');
const expect = chai.expect;
const Server = require('../../../lib/server');

describe('lib/server/index.js', function () {

	describe('$constructor', function () {
		it.only('should return an instanceof Server with valid parameters', function () {
			const options = {
				"config":{
					"case_sensitive_routing":true,
					"compression":{"threshold":256},
					"port":80,
					"trust_proxy":true,
					"statics":[
						{ "relpath":"assets", "route":"/assets" }
					],
					"strict_routing":true,
					"method_override":true,
					"routers":[ /* { "relpath":"routers" } */ ],
					"templates":[
						{ "relpath":"views", "route":"app", "renderer":"nunjucks" }
					]
				}
			};
			let server = new Server(options,{"myglobal":"someglobal"});
			process.env.NODE_PATH = "../.";
			expect(server).to.be.an.instanceof(Server);
		});
	});

});
