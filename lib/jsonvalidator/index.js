/* lib/jsonvalidator/index.js */
'use strict';

const AJV = require('ajv');
const DCONFIG  = require('./jsonvalidator.default');
const customErrors = require('ajv-errors');

/**
 * JSON Schema Validator class based on https://ajv.js.org/ and https://github.com/epoberezkin/ajv-errors
 * Allow to return an array of object that can be read by the client to generate error messages
 */
class JSONValidator {

	/**
	 * Constructor
	 * @param {array|object} schemas Schema(s) to validate the requests and the responses
	 * @param {object} options Custom options for AJV(https://github.com/epoberezkin/ajv#options)
	 */
	constructor ( schemas, options = {} ) {
		this._options = Object.assign({}, DCONFIG, options);
		this._ajv = new AJV(this._options);
		// Set default error messages if the API requires custom errors instead of AJV default error messages
		customErrors(this._ajv);
		// Add the schemas and compile them for future use
		if ( schemas ) {
			this._ajv.addSchema(schemas);
		}
	}

	/**
	 * Getter options
	 */
	get options() {
		return this._options;
	}

	/**
	 * Getter ajv
	 */
	get ajv() {
		return this._ajv;
	}

	/**
	 * Add a new schema
	 * @param {array|object} schemas
	 * @param {string} key
	 */
	addSchema ( schemas, key ) {
		switch (true) {
			case ( schemas instanceof Array ):
				this._ajv.addSchema(schemas);
				break;
			case ( typeof schemas === 'string' ):
				this._ajv.addSchema( JSON.parse(schemas), key );
				break;
			case ( typeof schemas === 'object' ) :
				this._ajv.addSchema(schemas);
				break;
			default:
				throw new TypeError("Unsupported type for parameter schemas");
		}
	}

	/**
	 * Validate a json input with a target schema
	 * @param {string|object} schema Target schema or new schema to validate the input
	 * @param {object} data Json input
	 */
	validateInput ( schema, data ) {
		function _ret ( valid, validator ) {
			if ( !valid ) return validator;
			return valid;
		}
		let v;
		if (typeof schema === 'string') {
			v = this._ajv.getSchema(schema);
		} else if (typeof schema === 'object') {
			v = this._ajv.compile(schema);
		} else {
			throw new TypeError(`Invalid schema argument`);
		}

		return _ret( v(data), v );
	}
}

module.exports = JSONValidator;
