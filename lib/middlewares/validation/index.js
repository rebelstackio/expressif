/* lib/middlewares/validation/index.js */
'use strict';

const ERROR = require('../../exception');
const RESPOND = require('../../respond');

module.exports = function validationmwr(jsonvalidator, schema) {
	// Return the express middleware function
	return function validateReq(req, res, next) {
		const v = jsonvalidator.validateInput(schema, req.body);
		if (typeof v === 'boolean' && v) {
			return next();
		}
		const msg = `Bad Request: ${v.schema.$id}`;
		const err = new ERROR.InvalidJSON(msg, v.errors);
		return RESPOND.invalidRequest(res, req, err);
	}.bind(this);
}
