/* lib/auth/authbyprivs.js */
'use strict';
            
const Auth = require('./simple');
const ERROR = require('../exception');
const RESPOND = require('../respond');

class AuthByPrivs extends Auth {

	constructor ( secret, options ) {
		super ( secret, options );
		this.middleware = function middleware ( requiredprivs, deniedprivs ) {
			requiredprivs = requiredprivs || [0];
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
				if ( req.dtoken.privileges ) {
					if ( !Array.isArray( req.dtoken.privileges ) ) {
						const err = new ERROR.AuthError( 'JWT payload is corrupt', ERROR.codes.JWT_PAYLOAD_CORRUPT );
						return RESPOND.NotAuthorized( res, req, err );
					} else {
						const _isInt = function _isInt ( val ) {
							return !isNaN(val) && (function(x) { return (x | 0) === x; })(parseFloat(val));
						};
						const _isMatchingUserPriv = function _isMatchingUserPriv ( priv, idx ) {
							switch ( priv ) {
								case undefined:
								case 0: return true;
								default:
									if ( _isInt(req.dtoken.privileges[idx]) ) {
										return Boolean( (req.dtoken.privileges[idx] & priv) == priv ); 
									} else {
										throw new Error(`privileges are corrupt - expected integer but received: ${req.dtoken.privileges[idx]}`);
									}
							}
						};
						if ( requiredprivs.every(_isMatchingUserPriv) ) {
							next();
						} else {
							let errobj = new ERROR.Unauthorized("Insufficient privileges",ERROR.codes.INSUFFICIENT_PRIVILEGES);
							return next(RESPOND.notAuthorized(res, req, errobj));
						}
					}
				} else {
					let errobj = new ERROR.BadAuth("User token payload missing privileges property", ERROR.codes.JWT_PAYLOAD_CORRUPT);
					return next(RESPOND.notAuthorized(res, req, "User token payload missing privileges property"));						
				}
			}.bind(this);
		}.bind(this);
	}
}

module.exports = AuthByPrivs;
