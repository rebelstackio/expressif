/* lib/exception/codes/index.js */

module.exports = {
	/* 3XX */
	notModified: 304,
	temporaryRedirect: 307,
	/* 4XX */
	badRequest: 400,
	unauthorized: 401,
	paymentRequired: 402,
	forbidden: 403,
	notFound: 404,
	methodNotAllowed: 405,
	notAcceptable: 406,
	proxyAuthenticationRequired: 407,
	requestTimeout: 408,
	conflict: 409,
	/* 5XX */
	serverError: 500,
	notImplemented:501,
	badGateway: 502,
	serviceUnavailable: 503,
	gatewayTimeout: 504,
};
