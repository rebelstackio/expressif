/* lib/error/index.js */
const HTTP_CODES = require('./httpcodes');

/**
 * ExpressifError
 * Base error class for expressif project. All the errors must inherent from [ExpressifError]
 */
class ExpressifError extends Error {

	constructor(message='', options={}) {
		// Avoid create instances - Abstract class
		if (new.target === ExpressifError) {
			throw new TypeError('Cannot construct ExpressifError {abstract} instances directly');
		}
		super(message);
		this._message = message;
		const { errorObject, httpstatus, ...props } = options;
		this._errorObject = errorObject || {};
		this._httpstatus =  httpstatus || HTTP_CODES.SERVER_ERROR;
		this._props = props || {};
	}

	get message() {
		return this._message;
	}

	get httpstatus() {
		return this._httpstatus;
	}

	get errorObject() {
		return this._errorObject;
	}

	get name() {
		return this.constructor.name;
	}

	get props() {
		return this._props;
	}

};

// Allows to print the error as string
ExpressifError.prototype.toString = function exceptionToString(){
	return `[${this.httpstatus}]${this.message}`
}

class ServerError extends ExpressifError{
	constructor(message, options){
		super(message, options);
	}
}


module.exports = {
	ExpressifError,
	ServerError
}

