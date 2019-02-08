/* lib/jsonvalidator/jsonvalidator.default.js */
'use strict';

/**
 * Default options set by expressif for the AJV library based on https://github.com/epoberezkin/ajv#options
 */
module.exports = {
	allErrors: true, // Display all the errors instead of just stop the validation at the first error
	meta: require('ajv/lib/refs/json-schema-draft-06.json') // Default meta schema for all the custom schemas
}
