/* lib/auth/authbyprivs.js */
'use strict';

const Auth = require('./simple');
const ERROR = require('../exception');
const RESPOND = require('../respond');

class AuthByRoles extends Auth {

	constructor ( secret, options ) {
		super ( secret, options );
		this.middleware = function middleware ( requiredroles, deniedroles ) {
			requiredroles = requiredroles || [];
			deniedroles = deniedroles || [];
			return function amw ( req, res, next ) {
				if ( !req.dtoken ) {
					try {
						let token = Auth.parseAuthHeaders(req.headers);
						try {
							req.dtoken = Auth.decodeJWT(token, secret);
						} catch (e) {
							const err = Auth.decodeErr(e);
							switch (true) {
							case (err instanceof ERROR.AuthError):
								return RESPOND.notAuthorized(res, req, err);
							default:
								return RESPOND.serverError(res, req, err);
							}
						}
					} catch (e) {
						return RESPOND.notAuthorized(res, req, e);
					}
				}
				if ( req.dtoken.roles ) {
					if ( !Array.isArray( req.dtoken.roles ) ) {
						const err = new ERROR.AuthError( 'JWT payload is corrupt', ERROR.codes.JWT_PAYLOAD_CORRUPT );
						return RESPOND.NotAuthorized( res, req, err );
					} else {
						const _isMatchingUserRole = function _isMatchingUserRole ( role ) {
							return req.dtoken.roles.includes(role);
						};
						if ( !requiredroles.every(_isMatchingUserRole) || deniedroles.every(_isMatchingUserRole) ) {
							let errobj = new ERROR.Unauthorized('Insufficient privileges',ERROR.codes.INSUFFICIENT_PRIVILEGES);
							return next(RESPOND.notAuthorized(res, req, errobj));
						} else {
							next();
						}
					}
				} else {
					let errobj = new ERROR.BadAuth('User token payload missing privileges property', ERROR.codes.JWT_PAYLOAD_CORRUPT);
					return next(RESPOND.notAuthorized(res, req, errobj));
				}
			}.bind(this);
		}.bind(this);
	}
}

module.exports = AuthByRoles;
