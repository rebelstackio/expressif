/* lib/exception/index.js */

const exception = {};
const codes = require('./codes');
exception.codes = codes;

class StackError extends Error {
	constructor(errobj, message, code, status) {
		if (new.target === StackError) {
			throw new TypeError('Cannot construct StackError {abstract} instances directly');
		}
		const m = message || errobj.message;
		super(m);
		this.errorObj = errobj;
		this.code = code;
		this.httpstatus = status;
	}

	get expressifError() {
		return true;
	}
};

class AWSError extends StackError {
	constructor(errobj, message, code) {
		super(errobj, message, code || exception.codes.AWS_ERROR, 500);
	}
};

class DatabaseError extends StackError {
	constructor(errobj, message, code) {
		super(errobj, message, code || exception.codes.DB_ERROR, 500);
	}
};

class ServerError extends StackError {
	constructor(errobj, message, code) {
		super(errobj, message, code || exception.codes.SERVER_ERROR, 500);
	}
};

exception.StackError = StackError;
exception.AWSError = AWSError;
exception.DatabaseError = DatabaseError;
exception.ServerError = ServerError;

class Exception {
	constructor(message, code, httpstatus) {
		if (new.target === Exception) {
			throw new TypeError('Cannot construct Exception {abstract} instances directly');
		}
		this.message = message;
		this.code = code;
		this.httpstatus = httpstatus;
	}

	get expressifError() {
		return true;
	}
}

class BadAuth extends Exception {
	constructor(message, code) {
		super(message, code || codes.BAD_AUTH, 401);
	}
}

class BadHeader extends Exception {
	constructor(message, code) {
		super(message, code || codes.BAD_HEADER, 400);
	}
}

class BadRequest extends Exception {
	constructor(message, code) {
		super(message, code || codes.BAD_REQUEST, 400);
	}
}

class Conflict extends Exception {
	constructor(message, code) {
		super(message, code || codes.EMPTY_UPDATE, 409);
	}
}

class Forbidden extends Exception {
	constructor(message, code) {
		super(message, code || codes.FORBIDDEN, 403);
	}
}

class InvalidJSON extends Exception {
	constructor(message, errorData, code) {
		super(message, code || codes.INVALID_JSON, 400);
		this.info = errorData;
	}
}

class NotFound extends Exception {
	constructor(message, code) {
		super(message, code || codes.RESOURCE_NOT_FOUND, 404);
	}
}

class Unauthorized extends Exception {
	constructor(message, code) {
		super(message, code || codes.UNAUTHORIZED, 401);
	}
}

class Unavailable extends Exception {
	constructor(message, code, retryafter) {
		super(message, code || codes.UPDATING_CACHE, 503);
		this.retryafter = retryafter || 1;
	}
}

class ExternalServiceError extends Exception {
	constructor(errobj, servicetype) {
		super(
			errobj.message,
			codes.EXT_SERVER_ERROR,
			502,
		);
		this.api_response = errobj.api_response;
		this.api_httpcode = errobj.api_httpcode;
		this.servicetype = servicetype;
	}
}

exception.BadAuth = BadAuth;
exception.AuthError = BadAuth;
exception.BadHeader = BadHeader;
exception.BadRequest = BadRequest;
exception.Conflict = Conflict;
exception.Forbidden = Forbidden;
exception.InvalidJSON = InvalidJSON;
exception.NotFound = NotFound;
exception.Unauthorized = Unauthorized;
exception.Unavailable = Unavailable;
exception.ExternalServiceError = ExternalServiceError;

module.exports = exception;
