const Auth = require('./lib/auth');

const error = require('./lib/error');

const jsonvalidator = require('./lib/jsonvalidator');

const reqvalidator = require('./lib/reqvalidator');

const respond = require('./lib/respond');

const router = require('./lib/router');

/**
 * Return an instance of the auth handler
 * @param {String} secret The JWT secret used in token creation.
 * @param {Object} options Pass a custom logger.
 * @returns {Object} Instance of Auth handler.
 */
const returnAuthInstance = function returnAuthInstance(secret, options) {
	return new Auth(secret, options);
};

module.exports = {
	auth: returnAuthInstance, error, jsonvalidator, reqvalidator, respond, router
};
