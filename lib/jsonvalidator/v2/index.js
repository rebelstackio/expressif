/* lib/jsonvalidator/v2/index.js */

const ajv = require('ajv');
const customerrors = require('ajv-errors');

const DEFAULT = require('./defaults');

const JsonValidatorV2 = {
	_ajv: null,
	_options: null,
	_schemaspath: null,

	init: function _init(schemaspath, options = {}, dependecies = { customErrors:customerrors, AJV:ajv }){
		const { AJV, customErrors } = dependecies;
		this._options = {...DEFAULT, ...options};
		this._ajv = new AJV(this._options);
		this._schemaspath = schemaspath;
		// Set default error messages if the API requires custom errors instead of AJV default error messages
		customErrors(this._ajv, { keepErrors: this._options.keepErrors });

		return this;
	}
};

module.exports = JsonValidatorV2;
