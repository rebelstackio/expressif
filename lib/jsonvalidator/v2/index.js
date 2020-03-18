/* lib/jsonvalidator/v2/index.js */

const ajv = require('ajv');
const customerrors = require('ajv-errors');

const DEFAULT = require('./defaults');

const { collectFilePathsRecursive } = require('../../util');

const JsonValidatorV2 = {
	_ajv: null,
	_options: null,
	_schemaspath: null,
	_ready: false,

	init: function _init(schemaspath, options = {}, dependecies = { customErrors:customerrors, AJV:ajv }){
		try {
			const { AJV, customErrors } = dependecies;
			this._schemaspath = schemaspath;
			this._options = {...DEFAULT, ...options};
			this._ajv = new AJV(this._options);
			// Set default error messages if the API requires custom errors instead of AJV default error messages
			customErrors(this._ajv, { keepErrors: this._options.keepErrors });
			this._ready = true;
		} catch (error) {
			this._ready = false;
			global.LOGGER.error(`Unable to load schemas under ${schemaspath}`, error);
		}
		return this;
	},

	loadSchemas: function _loadSchemas( collectSchemas = collectFilePathsRecursive, req = require ){
		let _loadedschemas = [];
		if ( this._ready ) {
			const schemas = collectSchemas(this._schemaspath, []);
			schemas.forEach(( sch ) => {
				try {
					_loadedschemas.push(req(sch));
				} catch (error) {
					global.LOGGER.warn(`Unable to load schema ${sch}. This error can cause the Request Validator works as not expected`, error);
				}
			});
			if ( _loadedschemas.length ) {
				// TODO: Catch errors here ??
				// TODO: Check schemas have the $id?
				this._ajv.addSchema(_loadedschemas);
			}
		}
		return this;
	},

	isReady: function _isReady(){
		return this._ready;
	}
};

module.exports = JsonValidatorV2;
