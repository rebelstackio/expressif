/*
	ayes/router/router.js
	Library file for utility functions for building routers
*/

// Borrowed util functions
const hasProp = Object.prototype.hasOwnProperty;

const express = require('express');

const Auth = require('../auth');

const RX = require('../reqvalidator');

const Router = module.exports = {};

const RESPOND = require('../respond');

const getOptionsController = function getOptionsController(apiDoc) {
	return function optionController(req, res) {
		const wrapper = RESPOND.wrapSuccessData(apiDoc, req.path, true);
		RESPOND.success(res, req, wrapper);
	};
};

const buildOptionsData = function buildOptionsData(rt, jv) {
	const optionsData = { verb: rt.method };
	if (rt.rxvalid) {
		optionsData.validations = RX.printRXValid(rt.rxvalid);
	}
	if (rt.privs) {
		optionsData.required_privileges = rt.privs;
	}
	if (jv) {
		if (rt.validreq) {
			const bodySchema = jv.ajv.getSchema(rt.validreq);
			if (bodySchema && bodySchema.schema) {
				optionsData.body_schema = bodySchema.schema;
			}
		}
		if (rt.validres) {
			const resSchema = jv.ajv.getSchema(rt.validres);
			if (resSchema && resSchema.schema) {
				optionsData.response = resSchema.schema;
			}
		}
	}

	return optionsData;
};

const buildOptionRoute = function buildOptionRoute(optionsData) {
	const mws = [];
	const rv = RX.validate;

	mws.push(rv(RX.NOT_ACCEPT_JSON));
	mws.push(getOptionsController(optionsData));

	return mws;
};

const addMiddleWareFromArray = function addMiddleWareFromArray(mwA, mwB) {
	const returnArray = mwA.slice(0);
	const noOfMw = mwB.length;
	for (let i = 0; i < noOfMw; i += 1) {
		const mw = mwB[i];
		if (typeof mw === 'function') {
			returnArray.push(mw);
		} else {
			throw TypeError('All middleware instances must be a function');
		}
	}
	return returnArray;
};

Router.buildRouter = function buildRouter(options) {
	const router = express.Router();
	const optionsResponseBody = {};
	const { auth, jsonv: jvq, routes } = options;

	const rv = RX.validate;
	const noOfRoutes = routes.length;
	for (let idx = 0; idx < noOfRoutes; idx += 1) {
		const rt = routes[idx];

		const rxvalid = rt.rxvalid;
		const validreq = rt.validreq;
		const mwares = rt.mwares;
		let mws = [];

		// Authorization for the endpoint
		if (auth) {
			if (auth instanceof Auth) {
				mws.push(auth.generateAuthMiddleWare());
			} else if (typeof auth === 'function') {
				mws.push(auth);
			} else if (Array.isArray(auth)) {
				mws = addMiddleWareFromArray(mws, auth);
			}
		}

		// Request formation checker for the endpoint
		if (rxvalid) {
			mws.push(rv(rxvalid));
		}
		// Request parameter validation
		if (jvq && validreq) {
			mws.push(jvq.validateReq(validreq));
		}

		// Other middleware for the endpoint
		if (mwares) {
			if (typeof mwares === 'function') {
				mws.push(mwares);
			} else {
				mws = addMiddleWareFromArray(mws, mwares);
			}
		}

		// Build the route for the endpoint and add it to the express router instance
		router[rt.method](rt.path, mws);

		if (options.addOptionRoute) {
			if (!hasProp.call(optionsResponseBody, rt.path)) {
				optionsResponseBody[rt.path] = [];
			}
			optionsResponseBody[rt.path].push(buildOptionsData(rt, options.jsonv));
		}
	}

	if (options.addOptionRoute) {
		router.options('/', buildOptionRoute(optionsResponseBody));
	}

	return router;
};
