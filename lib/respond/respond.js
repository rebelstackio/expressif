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
const buildPassthroughObj = function buildPassthroughObj (body, params) {
    switch ( true ) {
        case ( typeof body === 'object' ) : return Object.assign({},body);
        case ( typeof params === 'object' ) : return Object.assign({},params);
        default : return {};
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
const buildResponse = function buildResponse (data, options) {
    const _removeNulls = function _removeNulls (obj) {
        if (obj instanceof Array) {
            for (let j in obj) {
                return _removeNulls(obj[j]);
            }
        }
        for (let k in obj) {
            if (obj[k] === null) {
                delete obj[k];
            } else if (typeof obj[k] === 'object') {
                _removeNulls(obj[k]);
            }
        }
    };
    let { passthrough: pt, path: p, type: t, code: c, stripNull: sn } = options;
    let r = {}; // Response Object
    if (data) {
        if (sn) {
            _removeNulls(data);
        }
        r.data = data;
    }
    if (pt) {
        for (let key in pt) {
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
    } else {
        return void 0;
    }
};

/**
 * A function to build a standardised response data format.
 * @param {Object} dataObj
 * @param {Object} path
 * @param {Object} stripNull
 */
const wrapSuccessData = function wrapSuccessData (data, path, options) {
    if (typeof path === 'object') {
        stripNull = path;
        path = undefined;
    }
    let dw = {}; // DataWrapper
    dw.path = path;
    dw.data = data;
    dw.stripNull = options.stripNull;
    return dw;
};

/**
 * Respond function for standerdising success responses.
 *
 * @param {Object} rs http response object
 * @param {Object} rq http request object
 * @param {Object} wd wrapped data for response
 * @param {Number} alt alternative http status code
 */
const success = function success (
    rs  /* response */,
    rq  /* request */,
    wd  /* wrappedData */,
    alt /* altStatus */
) {
    let statusCode = alt || 200;
    if (wd) {
        let data = wd.data ? wd.data : null;
        let options = {};
        options.path = wd.path;
        options.type = wd.path ? null : 'success';
        options.stripNull = wd.stripNull;
        let resp = buildResponse(data, options);
        rs.set('Content-Type', 'application/json');
        rs.status(statusCode).send(JSON.stringify(resp));
        return resp;
    } else {
        if (rq && rq.body) {
            let resp = buildResponse(null, { passthrough: rq.body });
            if (resp) {
                return rs.status(statusCode).send(JSON.stringify(resp));
            } else {
                return rs.status(statusCode).send();
            }
        } else {
            return rs.status(statusCode).send();
        }
    }
};

const invalidRequest = function invalidRequest (response, request, errObject) {
    let responseData = {};
    responseData.message = 'Invalid Request Error';
    let options = {};
    options.passthrough = request;
    options.stripNull = false;
    let statusCode = 400;
    options.type = 'Request_Invalid_Error';
    options.code = null;
    // NOTE: overrides supplied by errObject
    if (errObject) {
        // if ( errObject.log ) errObject.log();
        options.type = errObject.constructor.name;
        options.code = errObject.code || null;
        responseData.message = errObject.message ? errObject.message : responseData.message;
        if (errObject.info) {
            responseData.info = errObject.info;
        }
        statusCode = errObject.httpstatus ? errObject.httpstatus : statusCode;
    }

    let resJSON = buildResponse(responseData, options);
    response.set('Content-Type', 'application/json');
    if (resJSON.code) {
        response.set('X-Error-Code', resJSON.code.toString());
    }
    return response.status(statusCode).send(JSON.stringify(resJSON));
};

const unavailableRetry = function unavailableRetry (response, request, errObject) {
    let statusCode = 503;
    let responseData = {};
    responseData.message = 'Service temporarily unavailable. Please retry';
    let path = 'Service_Unavailable_Please_Retry';
    let code = null;
    let ra = 1;
    if (errObject) {
        path = errObject.constructor.name;
        code = errObject.code || null;
        ra = errObject.retryafter || ra;
        responseData.message = errObject.message ? errObject.message : responseData.message;
        statusCode = errObject.httpstatus ? errObject.httpstatus : statusCode;
    }

    response.set('Retry-After', ra);
    if (code) {
        response.set('X-Error-Code', code.toString());
        return response.status(statusCode).send();
    } else {
        let resJSON = buildResponse(request, path, code, responseData, false);
        return response.status(statusCode).send(JSON.stringify(resJSON));
    }
};

const notAuthorized = function notAuthorized (response, request, errObject) {
    let statusCode = 401;
    let responseData = {};
    responseData.message = 'Authorisation error';
    let path = 'Request_Authorisation_Error';
    let code = null;
    if (errObject) {
        path = errObject.constructor.name;
        code = errObject.code || null;
        responseData.message = errObject.message ? errObject.message : responseData.message;
        statusCode = errObject.httpstatus ? errObject.httpstatus : statusCode;
    }

    response.set('WWW-Authenticate', 'Bearer token_path="JWT"');
    if (code) {
        response.set('X-Error-Code', code.toString());
        return response.status(statusCode).send();
    } else {
        response.set('Content-Type', 'application/json');
        let resJSON = buildResponse(request, path, code, responseData, false);
        return response.status(statusCode).send(JSON.stringify(resJSON));
    }
};

const forbidden = function forbidden (response, request, errObject) {
    let statusCode = 403;
    let responseData = {};
    responseData.message = 'Forbidden';
    let type = 'Request_Authorisation_Error';
    let code = null;
    if (errObject) {
        type = errObject.constructor.name;
        code = errObject.code || null;
        responseData.message = errObject.message ? errObject.message : responseData.message;
        statusCode = errObject.httpstatus ? errObject.httpstatus : statusCode;
    }
    // response.set('WWW-Authenticate', 'application/x-www-form-urlencoded');
    if (code) {
        response.set('X-Error-Code', code.toString());
        return response.status(statusCode).send();
    } else {
        response.set('Content-Type', 'application/json');
        let resJSON = buildResponseObj(request, type, code, responseData, false);
        return response.status(statusCode).send(JSON.stringify(resJSON));
    }
};

const notFound = function notFound (response, request, errObject) {
    let statusCode = 404;
    let responseData = {};
    responseData.message = 'Resource not found';
    let type = 'error';
    let code = null;
    if (errObject) {
        type = errObject.constructor.name;
        code = errObject.code || null;
        responseData.message = errObject.message ? errObject.message : responseData.message;
        statusCode = errObject.httpstatus ? errObject.httpstatus : statusCode;
    }
    // response.set('WWW-Authenticate', 'application/x-www-form-urlencoded');
    if (code) {
        response.set('X-Error-Code', code.toString());
        return response.status(statusCode).send();
    } else {
        response.set('Content-Type', 'application/json');
        let resJSON = buildResponseObj(request, type, code, responseData, false);
        return response.status(statusCode).send(JSON.stringify(resJSON));
    }
};

const serverError = function serverError (response, request, errObj) {
    let statusCode = 500;
    let responseData = {};
    let code = null;
    if (errObj) {
        statusCode = errObj.httpstatus ? errObj.httpstatus : statusCode;
        code = errObj.code || null;
    }

    if (code) {
        response.set('X-Error-Code', code.toString());
        return response.status(statusCode).send();
    } else {
        responseData.message = 'Unexpected Error';
        let type = 'error';
        let passthrough = buildPassthroughObj(request.body, request.params);
        let resJSON = this.buildResponseObj(passthrough, type, code, responseData, false);
        response.set('Content-Type', 'application/json');
        return response.status(statusCode).send(JSON.stringify(resJSON));
    }
};

const notImplemented = function notImplemented (response, request, errObj) {
    let statusCode = 501;
    let responseData = {};
    let code = null;
    let type = 'error';
    let passthrough = buildPassthroughObj(request.body, request.params);
    if (errorObj) {
        statusCode = errObj.httpstatus ? errObj.httpstatus : statusCode;
        code = errObj.code || null;
    }
    responseData.message = 'Not Implemented;';

    if (code) {
        response.set('X-Error-Code', code.toString());
        return response.status(statusCode).send();
    } else {
        response.set('Content-Type', 'application/json');
        let resJSON = this.buildResponseObj(passthrough, type, code, responseData, false);
        return response.status(statusCode).send(JSON.stringify(resJSON));
    }
};

const redirect = function redirect (response, headers, statusCode, noWrapDataStr) {
    statusCode = statusCode || 307;
    if (noWrapDataStr && (typeof noWrapDataStr !== 'string')) {
        // TODO : handle this error condition
    }
    if (headers) {
        if (typeof headers === 'object') {
            for (let key in headers) {
                response.set(key, headers[key]);
            }
        } else {
            // TODO : handle this error condition
        }
    }
    if (noWrapDataStr) return response.status(statusCode).send(noWrapDataStr);
    else {
        return response.status(statusCode).send();
    }
};

module.exports = {
    'wrapSuccessData': wrapSuccessData,
    'invalidRequest': invalidRequest,
    'unavailableRetry': unavailableRetry,
    'notAuthorized': notAuthorized,
    'forbidden': forbidden,
    'notFound': notFound,
    'serverError': serverError,
    'notImplemented': notImplemented,
    'success': success,
    'redirect': redirect
};
