/* lib/middlewares/validation/index.js */
'use strict';

const ERROR = require('../../exception');
const RESPOND = require('../../respond');

module.exports = function jsvalidatormwr(jsonvalidator, schema) {
	// Return the express middleware function
	return function validateReq(req, res, next) {
		// Get only validation data and ignore the rest like headers
		const reqvalidate = Object.assign(
			{},
			{ body: req.body, params: req.params, query: req.query, headers: req.headers }
		);
		const v = jsonvalidator.validateInput(schema, reqvalidate);
		if (typeof v === 'boolean' && v) {
			return next();
		}
		const msg = `Bad Request: ${v.schema.$id}`;
		const err = new ERROR.InvalidJSON(msg, v.errors);
		return RESPOND.invalidRequest(res, req, err);
	}.bind(this);
}
