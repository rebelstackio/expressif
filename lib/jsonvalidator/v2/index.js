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
			// Set the custom LOGGER to AJV
			global.LOGGER.log = global.LOGGER.debug;
			this._options.logger = {
				log: function log(){
					global.LOGGER.debug.apply(global.LOGGER, arguments);
				},
				warn: function warn() {
					global.LOGGER.warn.apply(global.LOGGER, arguments);
				},
				error: function error() {
					global.LOGGER.error.apply(global.LOGGER, arguments);
				}
			};
			// Build ajv object
			this._ajv = new AJV(this._options);
			// Check if draft06 flag is true to load draft06
			if ( this._options.draft06 ){
				this._ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));
			}
			// Set default error messages if the API requires custom errors instead of AJV default error messages
			customErrors(this._ajv, { keepErrors: this._options.keepErrors });
			this._ready = true;
		} catch (error) {
			this._ready = false;
			global.LOGGER.error(`Expressif::Unable to load schemas under ${schemaspath}`, error);
		}
		return this;
	},

	loadSchemas: function _loadSchemas( collectSchemas = collectFilePathsRecursive, req = require ){
		let _loadedschemas = [];
		if ( this._ready ) {
			const schemas = collectSchemas(this._schemaspath, []);
			schemas.forEach(( sch ) => {
				try {
					// Require schema and push it to the array
					_loadedschemas.push(req(sch));
				} catch (error) {
					global.LOGGER.warn(`Expressif::Unable to load schema ${sch}. This error can cause the Request Validator works as not expected`, error);
				}
			});
			try {
				this._ajv.addSchema(_loadedschemas);
			} catch (error) {
				global.LOGGER.error(`Expressif::Unable to load schemas. This error can cause the Request Validator works as not expected`, error);
			}
		}
		return this;
	},

	isReady: function _isReady(){
		return this._ready;
	},

	getSchema: function _getSchema(schemaName) {
		return this._ajv.getSchema(schemaName);
	}
};

module.exports = JsonValidatorV2;
