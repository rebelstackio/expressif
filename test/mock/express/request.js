/* tests/mock/express/request.js
 * a mock/simulator for express request to ease testing routers (no need to supertest)
 *
 *
 * Why?
 * Supertest and Sinon (spy) are pain-in-rear overkill to simple problem - testing an Express routers
 * Usage:
 * var req = new require('mock/express/request')({"content-type":"application/json"});
 * req.body = JSON.parse('{"mykey":"myval"}');
 *
 * Headers:
 * Express converts http headers to lower case. Example:
 * req.headers['content-type'] = 'application/json';
 *
 * Session:
 * What do you want to store in the session? You put it there in the first place -
 * it's a javascript Object: eg:
 * req.session.user = {id:"123"};
 *
 * Body:
 * What do you want to store in the body? It's a javascript Object - express
 * parses json, multipart-form-url-encoded into a dictionary-like object eg:
 * req.body = { "username":"jolly", "userpass":"fellow" };
 */

module.exports = function MockExpressRequest ( headers, cookies, session, body ) {
	var req = {};
	req.headers = headers || {};
	req.cookies = cookies || {};
	req.session = session || void 0;
	req.is = function (strContentType) {
		if (req.headers.accept) {
			switch (true) {
				case ( req.headers["content-type"] instanceof Array):
					if ( req.headers["content-type"].indexOf(strContentType) == -1) return false;
					else return true;
					break;
				case ( typeof req.headers["content-type"] == 'string' ):
					if ( req.headers["content-type"] == strContentType) return true;
					else return false;
					break;
				default: return false;
			}
		} else return false;
	};
	req.accepts = function (strContentType) {
		if (req.headers.accept) {
			switch (true) {
				case ( req.headers.accept instanceof Array):
					if ( req.headers.accept.indexOf(strContentType) == -1) return false;
					else return true;
					break;
				case ( typeof req.headers.accept == 'string' ):
					if ( req.headers.accept == strContentType) return true;
					else return false;
					break;
				default: return false;
			}
		} else return false;
	};
	return req;
};
