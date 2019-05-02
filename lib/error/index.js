/* lib/error/index.js */
const HTTP_CODES = require('./httpcodes');
const HTTP_TYPES = require('./types');

class AppError extends Error {
	constructor(type, httpstatus, message='', options={}){
		super(message);
		this._type = type || HTTP_TYPES.serverError;
		this._httpstatus =  httpstatus || HTTP_CODES.serverError;
		const { errorObject, ...props } = options;
		this._errorObject = errorObject || {};
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
}

// Allows to print the error as string
AppError.prototype.toString = function exceptionToString(){
	return `[${this.type}|${this.httpstatus}] ${this.message}`;
}

module.exports = {
	AppError
}

