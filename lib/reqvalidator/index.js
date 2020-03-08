/* lib/reqvalidator/index.js */
'use strict';

const toBitwiseArray = require('../util').toBitwiseArray;
const ERROR = require('../exception');
const RESPOND = require('../respond');

/**
 * Helper function to build a map from rxdef keys to their value property.
 * @param {Object} obj
 */
const buildEnum = function buildEnum(obj) {
	const dict = {};
	for (const key in obj) {
		if (typeof obj[key].value === 'number') {
			dict[key] = obj[key].value;
		}
	}
	return dict;
};

/**
 * Request validators
 */
const REQUEST_EXCEPTION_DEFINITONS = {
	NOT_ACCEPT_JSON: {
		type: 'BadHeader',
		condition: "!request.headers.accept || request.headers.accept.indexOf('application/json')<0",
		message: 'Accept Header must be: application/json',
		print: { h: 'Accept', v: 'application/json' },
		value: Math.pow(2, 0)
	},
	NOT_FORM_ENCODED: {
		type: 'BadHeader',
		condition: "request.headers['content-type'].indexOf('application/x-www-form-urlencoded')<0",
		message: 'Content-Type Header must be: application/x-www-form-urlencoded',
		print: { h: 'Content-Type', v: 'application/x-www-form-urlencoded' },
		value: Math.pow(2, 1)
	},
	NOT_APP_JSON: {
		type: 'BadHeader',
		condition: "!request.headers['content-type'] || request.headers['content-type'].indexOf('application/json')<0",
		message: 'Content-Type Header must be: application/json',
		print: { h: 'Content-Type', v: 'application/json' },
		value: Math.pow(2, 2)
	},
	ALREADY_LOGGED_IN: {
		type: 'BadAuth',
		condition: 'request.dtoken',
		message: 'current session already logged in',
		print: 'Must be logged out',
		value: Math.pow(2, 3)
	},
	NOT_LOGGED_IN: {
		type: 'BadAuth',
		condition: '!request.dtoken',
		message: 'user not logged in',
		print: 'Must be logged in',
		value: Math.pow(2, 4)
	},
	NOT_FORMENCODED_OR_APPJSON: {
		type: 'BadHeader',
		condition: "!request.headers['content-type'] || (request.headers['content-type'].indexOf('application/x-www-form-urlencoded')<0 && request.headers['content-type'].indexOf('application/json')<0)",
		message: 'Request Content-Type must be: application/x-www-form-urlencoded or application/json',
		print: { h: 'Content-Type', v: '[application/json | application/x-www-form-urlencoded]' },
		value: Math.pow(2, 5)
	}
};
const REQUEST_EXCEPTION_ENUM = buildEnum(REQUEST_EXCEPTION_DEFINITONS);

/**
 * Function to return the key from the value map given the value.
 * @param {Object} val
 */
const getKey = function getKey(val) {
	const rxenum = REQUEST_EXCEPTION_ENUM;
	// search val in rxenum
	for (const key in rxenum) {
		if (rxenum[key] === val) {
			return key;
		}
	}

	return null;
};

const validate = function validate(rex) {
	const rxdef = REQUEST_EXCEPTION_DEFINITONS;
	return function validateReqMiddleware(request, response, next) {
		// TODO: perform bitwise to turn rx (int) to bitwise array
		const arrRX = toBitwiseArray(rex);
		for (const rx of arrRX) {
			const key = getKey(rx);
			let conditionresult = false;
			if (rxdef[key] && rxdef[key].condition) {
				conditionresult = eval(rxdef[key].condition);
			}
			if (conditionresult) {
				const err = new ERROR[rxdef[key].type](rxdef[key].message, rxdef[key].code);
				return RESPOND.invalidRequest(response, request, err);
			}
		}
		return next();
	};
};

/**
 * This code is for auto docs
 * @param {*} validateMask
 */
const printRXValid = function printRXValid(validateMask) {
	const returnJson = {};
	const headers = {};
	const auth = [];

	const rxdef = REQUEST_EXCEPTION_DEFINITONS;
	const arrRX = toBitwiseArray(validateMask);
	for (const rx of arrRX) {
		const key = getKey(rx);
		if (rxdef[key]) {
			const cond = rxdef[key];
			const p = cond.print;
			switch (cond.type) {
				case 'BadHeader':
					headers[p.h] = p.v;
					break;
				case 'BadAuth':
					auth.push(p);
					break;

				default:
					break;
			}
		}
	}

	if (Object.keys(headers).length) {
		returnJson.headers = headers;
	}
	if (auth.length) {
		returnJson.auth = auth;
	}

	return returnJson;
};

module.exports = Object.assign({}, REQUEST_EXCEPTION_ENUM);

module.exports.validate = validate;
module.exports.printRXValid = printRXValid;
module.exports.getKey = getKey;
module.exports.REQUEST_EXCEPTION_DEFINITONS = REQUEST_EXCEPTION_DEFINITONS;
