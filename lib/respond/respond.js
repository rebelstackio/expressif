/* eslint-disable no-param-reassign */
/*
	ayes/respond/respond.js
	Service specifc http response handling
*/
/**
 * Utillity functions
 */

/**
 * Create a dictionary of all request parameters for possible passthrough.
 * Params keys that are equal to body keys will overwrite the key value
 * in the returned dicitonary.
 * @param {Object} body
 * @param {Object} params
 */

const buildPassthroughObj = function buildPassthroughObj(request) {
	const { body, params } = request;
	switch (true) {
		case (typeof body === 'object'): return Object.assign({}, body);
		case (typeof params === 'object'): return Object.assign({}, params);
		default: return {};
	}
};
/**
 * Build a JSON object to be sent across the wire with a response
 * The options object can contain one or more of
 * - passthrough: A dictionary of request paramaters for potential passthrough to response.
 * - path: Identify request path.
 * - code: An internal error code to provide more detail on generic errors.
 * - stripNull: Boolean flag to indicate if null values should be stripped from the repsonse data.
 * @param {Object} data
 * @param {Object} options
 */
const buildResponse = function buildResponse(data, options) {
	const _removeNulls = function _removeNulls(obj) {
		if (obj instanceof Array) {
			for (const j in obj) {
				return _removeNulls(obj[j]);
			}
		}
		for (const k in obj) {
			if (obj[k] === null) {
				delete obj[k];
			} else if (typeof obj[k] === 'object') {
				return _removeNulls(obj[k]);
			}
		}
		return undefined;
	};
	const {
		passthrough: pt, path: p, type: t, code: c, stripNull: sn
	} = options;
	const r = {}; // Response Object
	if (data) {
		if (sn) {
			_removeNulls(data);
		}
		r.data = data;
	}
	if (pt) {
		for (const key in pt) {
			if (key.indexOf('#') === 0) {
				r[key] = pt[key];
			}
		}
	}
	if (p) r.path = p;
	if (t) r.type = t;
	if (c) r.code = c;
	if (Object.keys(r).length > 0) {
		return r;
	}
	return undefined;
};

/**
 * A function to build a standardised response data format.
 * @param {Object} dataObj
 * @param {Object} path
 * @param {Object} stripNull
 */
const wrapSuccessData = function wrapSuccessData(data, path, options) {
	if (typeof path === 'object') {
		options = path;
		path = undefined;
	}
	const dw = {}; // DataWrapper
	dw.path = path;
	dw.data = data;
	dw.stripNull = options ? options.stripNull : false;
	return dw;
};

const forbidden = function forbidden(response, request, errObj) {
	let statusCode = 403;
	const options = {};
	const responseData = {};

	if (errObj) {
		statusCode = errObj.httpstatus || statusCode;
		const code = errObj.code;
		if (code) {
			response.set('X-Error-Code', code.toString());
			return response.status(statusCode).send();
		}
		/** End Response */
		options.type = errObj.constructor.name;
		responseData.message = errObj.message;
	} else {
		options.type = 'Request_Authorisation_Error';
	}

	options.passthrough = buildPassthroughObj(request);
	responseData.message = responseData.message || 'Forbidden';
	const resJSON = buildResponse(responseData, options);

	response.set('Content-Type', 'application/json');
	return response.status(statusCode).send(JSON.stringify(resJSON));
};

const invalidRequest = function invalidRequest(response, request, errObj) {
	let statusCode = 400;
	const responseData = {};
	const options = {};
	options.passthrough = buildPassthroughObj(request);
	options.stripNull = false;
	options.type = 'Request_Invalid_Error';
	// NOTE: overrides supplied by errObj
	if (errObj) {
		options.type = errObj.constructor.name;
		options.code = errObj.code || null;
		responseData.message = errObj.message;
		if (errObj.info) {
			responseData.info = errObj.info;
		}
		statusCode = errObj.httpstatus || statusCode;
	}

	responseData.message = responseData.message || 'Invalid Request Error';
	const resJSON = buildResponse(responseData, options);

	response.set('Content-Type', 'application/json');
	if (resJSON.code) {
		response.set('X-Error-Code', resJSON.code.toString());
	}
	return response.status(statusCode).send(JSON.stringify(resJSON));
};

const notAuthorized = function notAuthorized(response, request, errObj) {
	let statusCode = 401;
	const options = {};
	const responseData = {};

	if (errObj) {
		statusCode = errObj.httpstatus || statusCode;
		const code = errObj.code;
		if (code) {
			response.set('X-Error-Code', code.toString());
			return response.status(statusCode).send();
		}
		/** End Response */

		options.type = errObj.constructor.name;
		responseData.message = errObj.message;
	} else {
		options.type = 'Not_Authorized_Error';
	}

	options.passthrough = buildPassthroughObj(request);
	responseData.message = responseData.message || 'Authorisation error';
	const resJSON = buildResponse(responseData, options);

	response.set('WWW-Authenticate', 'Bearer token_path="JWT"');
	response.set('Content-Type', 'application/json');
	return response.status(statusCode).send(JSON.stringify(resJSON));
};

const notFound = function notFound(response, request, errObj) {
	let statusCode = 404;
	const options = {};
	const responseData = {};

	if (errObj) {
		statusCode = errObj.httpstatus || statusCode;
		const code = errObj.code;
		if (code) {
			response.set('X-Error-Code', code.toString());
			return response.status(statusCode).send();
		}
		/** End Response */

		options.type = errObj.constructor.name;
		responseData.message = errObj.message;
	} else {
		options.type = 'Not_Found_Error';
	}

	options.passthrough = buildPassthroughObj(request);
	responseData.message = responseData.message || 'Resource not found';
	const resJSON = buildResponse(responseData, options);

	response.set('Content-Type', 'application/json');
	return response.status(statusCode).send(JSON.stringify(resJSON));
};

const notImplemented = function notImplemented(response, request, errObj) {
	let statusCode = 501;
	const options = {};
	const responseData = {};

	if (errObj) {
		statusCode = errObj.httpstatus || statusCode;
		const code = errObj.code;
		if (code) {
			response.set('X-Error-Code', code.toString());
			return response.status(statusCode).send();
		}
		/** End Response */

		options.type = errObj.constructor.name;
		responseData.message = errObj.message;
	} else {
		options.type = 'Not_Implemented_Error';
	}

	responseData.message = responseData.message || 'Not Implemented';
	options.passthrough = buildPassthroughObj(request);
	const resJSON = buildResponse(responseData, options);

	response.set('Content-Type', 'application/json');
	return response.status(statusCode).send(JSON.stringify(resJSON));
};

const redirect = function redirect(response, headers, statusCode, noWrapDataStr) {
	statusCode = statusCode || 307;
	if (noWrapDataStr && (typeof noWrapDataStr !== 'string')) {
		// TODO : handle this error condition
	}
	if (headers) {
		if (typeof headers === 'object') {
			for (const key in headers) {
				response.set(key, headers[key]);
			}
		} else {
			// TODO : handle this error condition
		}
	}
	if (noWrapDataStr) {
		return response.status(statusCode).send(noWrapDataStr);
	}

	return response.status(statusCode).send();
};

const serverError = function serverError(response, request, errObj) {
	let statusCode = 500;
	const responseData = {};
	if (errObj) {
		statusCode = errObj.httpstatus || statusCode;
		const code = errObj.code;
		if (code) {
			response.set('X-Error-Code', code.toString());
			return response.status(statusCode).send();
		}
	}

	const options = {};
	options.type = 'Server_Error';
	options.passthrough = buildPassthroughObj(request);
	responseData.message = 'Unexpected Error';
	const resJSON = buildResponse(responseData, options);

	response.set('Content-Type', 'application/json');
	return response.status(statusCode).send(JSON.stringify(resJSON));
};

/**
 * Respond function for standerdising success responses.
 *
 * @param {Object} rs http response object
 * @param {Object} rq http request object
 * @param {Object} wd wrapped data for response
 * @param {Number} alt alternative http status code
 */
const success = function success(
	rs /* response */,
	rq /* request */,
	wd /* wrappedData */,
	alt /* altStatus */
) {
	const statusCode = alt || 200;
	const options = {};
	let resp;
	if (rq && rq.body) {
		const passthroughObj = buildPassthroughObj(rq);
		if (wd) {
			const data = wd.data || null;
			options.path = wd.path;
			options.type = wd.path ? null : 'success';
			options.stripNull = wd.stripNull;
			resp = buildResponse(data, options);
			rs.set('Content-Type', 'application/json');
			return rs.status(statusCode).send(JSON.stringify(resp));
			// End Response
		}
		resp = buildResponse(null, { passthrough: passthroughObj });
	}
	if (resp) {
		rs.set('Content-Type', 'application/json');
		return rs.status(statusCode).send(JSON.stringify(resp));
	}
	return rs.status(statusCode).send();
};

const unavailableRetry = function unavailableRetry(response, request, errObj) {
	let statusCode = 503;
	let ra = 1;
	const options = {};
	const responseData = {};

	if (errObj) {
		ra = errObj.retryafter || ra;
		statusCode = errObj.httpstatus || statusCode;
		const code = errObj.code;
		if (code) {
			response.set('Retry-After', ra);
			response.set('X-Error-Code', code.toString());
			return response.status(statusCode).send();
		}
		/** End Response */

		options.type = errObj.constructor.name;
		responseData.message = errObj.message;
	} else {
		options.type = 'Service_Unavailable_Please_Retry';
	}

	options.passthrough = buildPassthroughObj(request);
	responseData.message = responseData.message || 'Service temporarily unavailable. Please retry';
	const resJSON = buildResponse(responseData, options);

	response.set('Content-Type', 'application/json');
	response.set('Retry-After', ra);
	return response.status(statusCode).send(JSON.stringify(resJSON));
};

module.exports = {
	wrapSuccessData,
	invalidRequest,
	unavailableRetry,
	notAuthorized,
	forbidden,
	notFound,
	serverError,
	notImplemented,
	success,
	redirect
};
