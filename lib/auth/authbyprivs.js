/* lib/auth/authbyprivs.js */
'use strict';

/* NOTE:    we can't put a model call in a library - perhaps it is better to assume that privs
			*may* be embedded in JWT, and if not, the controller can perform the check.        */
            
const Auth = require('./simple');

class AuthByPrivs extends Auth {

	constructor ( secret, options, requiredprivs, deniedprivs ) {

		this.requiredprivs = requiredprivs;
		this.deniedprivs = deniedprivs;

		super(secret,options);

		this.generateAuthMiddleWare = function generateAuthMiddleWare ( privs ) {
			return function amw ( req, res, next ) {
				let dtoken;
				let token;
	
				try {
					token = Auth.parseAuthHeaders(req.headers);
				} catch (e) {
					return RESPOND.notAuthorized(res, req, e);
				}
	
				try {

					dtoken = Auth.decodeJWT(token, secret);

					if ( dtoken.roles ) {

						if ( !Array.isArray( dtoken.roles) || dtoken.roles.length < 1 ) {
							const err = new ERROR.AuthError( 'JWT payload is corrupt', ERROR.codes.JWT_PAYLOAD_CORRUPT );
							return RESPOND.NotAuthorized( res, req, err );
						}

						privsmodel.getORprivs(dtoken.roles, function( e, result ) {
							if ( e ) {
								return RESPOND.serverError(res, req, e);
							} else {
								const _isInt = function _isInt ( val ) {
									return !isNaN(val) && (function(x) { return (x | 0) === x; })(parseFloat(val));
								};
								const _isMatchingUserPriv = function _isMatchingUserPriv ( priv, idx ) {
									switch ( priv ) {
										case undefined:
										case 0: return true;
										default:
											if ( isInt(result[idx]) ) {
												return Boolean( (result[idx] & priv) ^ priv ); 
											} else {
												// TODO: the role data stored in the database is corrupt
												throw new Error(`role privs is corrupt - expected integer but received: ${result[idx]}`);
											}
									}
								};
								if ( privs.array.every(_isMatchingUserPriv) ) {
									// TODO: include check on denied privs
									next();
								} else {
									return RESPOND.notAuthorized(res, req, "Insufficient privileges");
								}
							}
						});

					} else {
						return RESPOND.notAuthorized(res, req, "User has no role membership");						
					}
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
}

module.exports = AuthByPrivs;
