/* lib/auth/v2/index.js */
'use strict';

const JWTSimple = require('jwt-simple');
const ExpresifError = require('../exception');

/**
 * Decode JWT
 * @param {string}  jwt
 * @param {string}  secret JWT secret
 * @param {boolean} verifysignature Check JWT signature
 * @param {string}  algorithm Default to 'HS256'
 * @param {obejct}  dependecies
 */
const decodeJWT = function _decodeJWT(jwt, secret, verifysignature = true, algorithm = 'HS256', { JWT = JWTSimple} = { JWT: JWTSimple }){
	return JWT.decode(jwt, secret, verifysignature, algorithm);
};

/**
 * Encode JWT
 * @param {object} payload JWT payload
 * @param {string} secret JWT secret
 * @param {string} algorithm Default to 'HS256'
 * @param {obejct} dependecies
 */
const encodeJWT = function _encdeJWT(payload, secret, algorithm = 'HS256', { JWT = JWTSimple} = { JWT: JWTSimple }){
	return JWT.encode(payload, secret, algorithm);
};

/**
 * Parse req.headers. Throw Expresif.Error
 * @param {objects} headers
 */
const parseAuthHeaders = function _parseAuthHeaders( headers, { ERROR = ExpresifError } = { ERROR: ExpresifError } ){
	if (headers && headers.authorization) {
		const parts = headers.authorization.split(' ');
		if (parts.length === 2) {
			const scheme = parts[0];
			const credentials = parts[1];
			if (/^Bearer$/i.test(scheme)) {
				return credentials;
			}
			/* else */
			throw new ERROR.AuthError(
				'Format is Authorization: Bearer [token]',
				ERROR.codes.JWT_CREDS_BAD_SCHEME
			);
		} else {
			throw new ERROR.AuthError(
				'Format is Authorization: Bearer [token]',
				ERROR.codes.JWT_CREDS_BAD_FORMAT
			);
		}
	} else {
		throw new ERROR.AuthError(
			'JWT Authorization is required',
			ERROR.codes.JWT_CREDS_REQUIRED
		);
	}
};

/**
 * Decode error that comes from decodeJWT functions
 * @param {object} error
 * @param {object} dependecies
 */
const decodeErr = function _decodeErr(error,  { ERROR = ExpresifError } ){
	switch (error.message) {
	case 'Algorithm not supported':
		return new ERROR.AuthError('JWT algorithm not supported', ERROR.codes.JWT_UNSUPPORTED_ALGORITHM);
	case 'Token not yet active':
		return new ERROR.AuthError('Token not yet active', ERROR.codes.JWT_TOKEN_NOT_ACTIVE);
	case 'Token expired':
		return new ERROR.AuthError('Token expired', ERROR.codes.JWT_TOKEN_EXPIRED);
	case 'Signature verification failed':
		return new ERROR.AuthError('Signature verification failed', ERROR.codes.JWT_SIG_VERIFY_FAILED);
	default:
		if (error.message.indexOf('Unexpected token') !== -1) {
			return new ERROR.AuthError('Token corrupted', ERROR.codes.JWT_CORRUPT);
		}
		return new ERROR.ServerError(error, error.message, ERROR.codes.SERVER_ERROR);
	}
};

module.exports = {
	decodeJWT,
	encodeJWT,
	parseAuthHeaders,
	decodeErr
};
