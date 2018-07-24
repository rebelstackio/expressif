/* lib/jsonvalidator/index.js */

const AJV = require('ajv');
const ERROR = require('../exception');
const RESPOND = require('../respond');

class JSONValidator {
	constructor ( schemas, options ) {
		this.ajv = new AJV(options);
		this.ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));
		this.options = options;
		if (schemas) {
			this.ajv.addSchema(schemas);
		}
	}

	addSchema ( schemas, key ) {
		switch (true) {
			case ( schemas instanceof Array ) : this.ajv.addSchema(schemas); break;
			case ( typeof schemas === 'string' ) : this.ajv.addSchema( JSON.parse(schemas), key ); break;
			case ( typeof schemas === 'object' ) :  this.ajv.addSchema(schemas); break;
			default: throw new TypeError("unsupported type for parameter schemas");
		}
	}
	
	validate_json ( schema, data ) {
		function _ret ( valid, validator ) {
			if ( !valid ) return validator;
			return valid;
		}
		let v;
		if (typeof schema === 'string') {
			v = this.ajv.getSchema(schema);
		} else if (typeof schema === 'object') {
			v = this.ajv.compile(schema);
		}
		return _ret( v(data), v );
	}

	validateReq(schema) {
		return function validateReq(req, res, next) {
			const v = this.validate_json(schema, req.body);
			if (typeof v === 'boolean' && v) {
				return next();
			}
			const msg = `JSON validation errors were found against schema: ${v.schema.$id}`;
			const err = new ERROR.InvalidJSON(msg, v.errors);
			return RESPOND.invalidRequest(res, req, err);
		}.bind(this);
	}

}

module.exports = JSONValidator;
