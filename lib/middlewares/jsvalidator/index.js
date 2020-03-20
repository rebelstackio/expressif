/* lib/middlewares/validation/index.js */
'use strict';

const ERROR = require('../../exception');
const RESPOND = require('../../respond');

/**
 * JSON Validator Middleware. Recieve a schema id, used to validate the
 * current request
 * @param {string} schema Schema id
 * @param {object} jsonvalidator Dependecy
 */
module.exports = function jsonvalidatormwr( schema, jsonvalidator ) {
	// Return the express middleware function
	return function validateReq(req, res, next) {
		// Get only validation data and ignore the rest like headers
		for( var item in req.query ) {
			try {
				req.query[item] = JSON.parse( req.query[item] );
			} catch (e) {
				global.LOGGER.debug(`Expressif::Exceptions parsing query element...Using current value without changes`);
			}
		}
		const reqvalidate = Object.assign(
			{},
			{ body: req.body, params: req.params, query: req.query, headers: req.headers, jwtpayload: req.dtoken }
		);
		const v = jsonvalidator.validateInput(schema, reqvalidate);
		if (typeof v === 'boolean' && v) {
			return next();
		}
		const msg = `Bad Request: ${v.schema.$id}`;
		const err = new ERROR.InvalidJSON(msg, v.errors);
		return RESPOND.invalidRequest(res, req, err);
	}.bind(this);
};
