/* lib/auth/simple.js */

const JWT = require('jwt-simple');

const ERROR = require('../error');

const RESPOND = require('../respond');

class Auth {

	constructor ( secret, options ) {
		/* eslint-disable */
		console.debug = console.log;
		console.fatal = console.error;
		this.Logger = console;
		/* eslint-enable */
	
		if (options) {
			switch (true) {
				case Boolean(options.logger):
					this.Logger = options.logger;
					break;
				default: break;
			}
		}
	
		if (!secret) {
			const error = new Error(null, 'secret not supplied.');
			this.Logger.error(error);
			throw error;
		}
	
		this.generateAuthMiddleWare = function generateAuthMiddleWare() {
			return function amw(req, res, next) {
				let dtoken;
				let token;
	
				try {
					token = Auth.parseAuthHeaders(req.headers);
				} catch (e) {
					return RESPOND.notAuthorized(res, req, e);
				}
	
				try {
					dtoken = Auth.decodeJWT(token, secret);
				} catch (e) {
					const err = Auth.decodeErr(e);
					switch (true) {
						case (err instanceof ERROR.AuthError):
							return RESPOND.notAuthorized(res, req, err);
						default:
							return RESPOND.serverError(res, req, err);
					}
				}
	
				req.dtoken = dtoken;
				return next();
			}.bind(this);
		}.bind(this);
	}

	static decodeErr (error) {
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
	
	static decodeJWT (jwt, secret) {
		return JWT.decode(jwt, secret);
	};
	
	static encodeJWT (payload, secret) {
		return JWT.encode(payload, secret);
	};
	
	static parseAuthHeaders (headers) {
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
	
}

module.exports = Auth;
