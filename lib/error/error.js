/*
    ayes/error/error.js
    Application custom error definitons
*/

const error = module.exports = {};

error.codes = require('./codes');

/** ErrorParams
 * @param {string}  message
 * @param {float}   code
 * @param (integer) httpstatus
 */

error.ErrorBase = class ErrorBase /* {Abstract} */ {
	constructor(message, code, httpstatus) {
		if (new.target === ErrorBase) {
			throw new TypeError('Cannot construct ErrorBase {abstract} instances directly');
		}

		this.message = message;
		this.code = code;
		this.httpstatus = httpstatus;
	}
};

// 400 Client Error

/** ErrorParams
 * @param {string}  message
 * @param {float}   code
 */

error.BadRequestError = class BadRequestError extends error.ErrorBase {
	/** #ErrorParams */

	constructor(message, code) {
		super(message, code || error.codes.BAD_REQUEST, 400);
	}
};

error.NotFoundError = class NotFoundError extends error.ErrorBase {
	/** #ErrorParams */
	constructor(message, code) {
		super(message, code || error.codes.RESOURCE_NOT_FOUND, 404);
	}
};

error.BadHeaderError = class BadHeaderError extends error.ErrorBase {
	/** #ErrorParams */
	constructor(message, code) {
		super(message, code || error.codes.BAD_HEADER, 400);
	}
};

error.AuthError = class AuthError extends error.ErrorBase {
	/** #ErrorParams */
	constructor(message, code) {
		super(message, code || error.codes.LOGIN_ERROR, 401);
	}
};

error.ForbiddenError = class ForbiddenError extends error.ErrorBase {
	constructor(message, code) {
		super(message, code || error.codes.FORBIDDEN, 403);
	}
};

error.UnauthorizedError = class UnauthorizedError extends error.ErrorBase {
	constructor(message, code) {
		super(message, code || error.codes.UNAUTHORIZED_ERROR, 401);
	}
};

error.UnavailableRetryError = class UnavailableRetryError extends error.ErrorBase {
	constructor(message, code, retryafter) {
		super(message, code || error.codes.UPDATING_CACHE, 503);
		this.retryafter = retryafter || 1;
	}
};

error.ConflictError = class ConflictError extends error.ErrorBase {
	constructor(message, code) {
		super(message, code || error.codes.EMPTY_UPDATE, 409);
	}
};

error.DataBaseReturnError = class DataBaseReturnError extends error.ErrorBase {
	/** #ErrorParams */

	constructor(message, code) {
		super(message, code || error.codes.DB_ERROR, 500);
	}
};

error.JSONValidationError = class JSONValidationError extends error.ErrorBase {
	/** #ErrorParams */
	constructor(message, errorData, code) {
		super(message, code || error.codes.INVALID_JSON, 400);
		this.info = errorData;
	}
};

error.StackErrorBase = class StackErrorBase extends Error {
	/** { Abstract }
     * @param {Error}
     * @param {string} message - relative route path to endpoint
     */
	constructor(errobj, message, code, status) {
		if (new.target === StackErrorBase) {
			throw new TypeError('Cannot construct StackErrorBase {abstract} instances directly');
		}
		const m = message || errobj.message;
		super(m);
		this.errorObj = errobj;
		this.code = code;
		this.httpstatus = status;
		// Error.captureStackTrace (this, arguments.callee);
	}
};

/** StackErrorParams
 * @param {Error}  errobj
 * @param {string} message
 * @param {float}  code
 */

error.DataBaseError = class DataBaseError extends error.StackErrorBase {
	/** #StackErrorParams */

	constructor(errobj, message, code) {
		super(errobj, message, code || error.codes.DB_ERROR, 500);
	}
};

error.ServerError = class ServerError extends error.StackErrorBase {
	/** #StackErrorParams */
	constructor(errobj, message, code) {
		super(errobj, message, code || error.codes.SERVER_ERROR, 500);
	}
};

error.FBError = class FBError extends error.StackErrorBase {
	/** #StackErrorParams */
	constructor(errobj, message, code) {
		super(errobj, message, code || error.codes.FB_ERROR, 500);
	}
};

error.AWSError = class AWSError extends error.StackErrorBase {
	/** #StackErrorParams */
	constructor(errobj, message, code) {
		super(errobj, message, code || error.codes.AWS_ERROR, 500);
	}
};

error.MemCachedError = class MemCachedError extends error.StackErrorBase {
	/** #StackErrorParams */
	constructor(errobj, message, code) {
		super(errobj, message, code || error.codes.CACHE_SERVER_ERROR, 500);
	}
};
