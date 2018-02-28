/*
    ayes//jsonvalidator/jsonvalidator.js
    Library script for handling json validation of application data
*/

const AJV = require('ajv');

const ERROR = require('../error');

const RESPOND = require('../respond');

class JSONValidator {
	constructor(schemas, options) {
		this.options = options;
		this.ajv = new AJV(options);

		if (schemas) {
			this.addSchema(schemas);
		}
	}

	addSchema(schemas, key) {
		if (schemas instanceof Array) {
			this.ajv.addSchema(schemas);
		} else if (typeof schemas === 'string') {
			this.ajv.addSchema(JSON.parse(schemas), key);
		} else if (typeof schemas === 'object') {
			for (const sc in schemas) {
				this.ajv.addSchema(schemas[sc], sc);
			}
		}
	}

	validate(schema, data) {
		function _ret(valid, validator) {
			if (!valid) return validator;
			return valid;
		}
		let v;
		if (typeof schema === 'string') {
			v = this.ajv.getSchema(schema);
		} else if (typeof schema === 'object') {
			v = this.ajv.compile(schema);
		}
		return _ret(v(data), v);
	}

	validateReq(schema) {
		return function validateReq(req, res, next) {
			const v = this.validate(schema, req.body);
			if (typeof v === 'boolean' && v) {
				return next();
			}
			const msg = `JSON validation errors were found against schema: ${v.schema.$id}`;
			const err = new ERROR.JSONValidationError(msg, v.errors);
			return RESPOND.invalidRequest(res, req, err);
		}.bind(this);
	}

	validateRes(schema) {
		return function validateRes(req, res, next) {
			const v = this.validate(schema, res.body);
			if (typeof v === 'boolean' && v) {
				return next();
			}
			const msg = `JSON validation errors were found against schema: ${v.schema.$id}`;
			const err = new ERROR.JSONValidationError(msg, v.errors);
			return RESPOND.invalidRequest(res, req, err);
		}.bind(this);
	}
}

module.exports = JSONValidator;
