/*
    ayes/auth/auth.js
    authorization (not authentication)
*/

const JWT = require('jwt-simple');

const ERROR = require('../error');

const RESPOND = require('../respond');

const Auth = function Auth (secret, options) {
    console.debug = console.log;
    console.fatal = console.error;
    this.Logger = console;

    if (options) {
        switch (true) {
        case Boolean(options.logger):
            this.Logger = options.logger;
            break;
        default: break;
        }
    }

    this._JWT_SECRET = secret || false;
    if (!this._JWT_SECRET) {
        let error = new Error(null, 'JWT_SECRET not supplied.');
        this.Logger.error(error);
        throw error;
    }

    this.generateAuthMiddleWare = function () {
        return function (req, res, next) {
            let dtoken, token;

            try {
                token = Auth.parseAuthHeaders(req.headers);
            } catch (e) {
                return RESPOND.notAuthorized(res, req, e);
            }

            try {
                dtoken = Auth.decodeJWT(token, this._JWT_SECRET);
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
};

Auth.decodeErr = function (error) {
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

Auth.decodeJWT = function (jwt, secret) {
    return JWT.decode(jwt, secret);
};

Auth.encodeJWT = function (payload, secret) {
    return JWT.encode(payload, secret);
};

Auth.parseAuthHeaders = function (headers) {
    if (headers && headers.authorization) {
        let parts = headers.authorization.split(' ');
        if (parts.length === 2) {
            let [scheme, credentials] = parts;
            if (/^Bearer$/i.test(scheme)) {
                return credentials;
            } else {
                throw new ERROR.AuthError(
                    'Format is Authorization: Bearer [token]',
                    ERROR.codes.JWT_CREDS_BAD_SCHEME
                );
            }
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

module.exports = Auth;
