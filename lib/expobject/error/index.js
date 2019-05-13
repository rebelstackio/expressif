/* lib/error/index.js */
const EXPRESSIF_HTTP_CODES = require('../httpcodes');
const EXPRESSIF_HTTP_TYPES = require('../types');
const optionsCollector = require('../optionscollector');

/**
 * Basic Common Error class based on NodeJs builtin Error Object
 * Helps to use only one class or constructor for several types of error avoiding
 * mantain several classes with similar behavior
 */
class ExpError extends Error {
	/**
	 * Constructor
	 * @param {string}  type Error type(e.g notModified, badRequest, serverError). Could accept any string but there are several values defined in type.js
	 * @param {integer} httpstatus Http Statuc Code(e.g 404, 307, 500). Could accept any value but there are several values defined in httpcodes.js
	 * @param {string}  message Custom error message. If it is not provided could use the options object to get the value from `errorObject` property
	 * @param {object}  options Object with additionals properties for the error description. Object could have any custom additional property Also allow fixed props like [`errorObject`, `adheaders`]
	 */
	constructor(type = null, httpstatus = null, message='', options={}){
		super(message);
		this._type = type || EXPRESSIF_HTTP_TYPES.serverError;
		this._httpstatus =  httpstatus || EXPRESSIF_HTTP_CODES.serverError;
		const { errorObject, adheaders, props } = optionsCollector(options);
		this._errorObject = errorObject || undefined; // Original Error from another source
		this._adheaders = adheaders || {}; // Any additional header to attach in error response
		this._props = props;
	}

	get httpstatus() {
		return this._httpstatus;
	}

	get errorObject() {
		return this._errorObject;
	}

	get type() {
		return this._type;
	}

	get props() {
		return this._props;
	}

	get adheaders() {
		return this._adheaders;
	}

	get hasAdditionalHeaders() {
		return Object.keys(this._adheaders).length > 0;
	}
}

// Allows to print the error as string
ExpError.prototype.toString = function exceptionToString(){
	return `[${this.type}|${this.httpstatus}] ${this.message}`;
}

module.exports = ExpError;

