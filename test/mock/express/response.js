/* tests/mock/express/response.js
 * a mock/simulator for express response to ease testing routers (no need to supertest or sinon spy)
 *
 * Why?
 * Supertest and Sinon (spy) are pain-in-rear overkill to simple problem - testing an Express routers
 *
 * Usage:
 * var res = new require('mock/express/response')();
 * myUserLoginRouter._postLogout(req, res);
 * res.statusCode.should.equal(401);
 */


/* function MockExpressResponse()
 * your express route should set this object for you
 * feel free to extend this here or dynamically
 * http://expressjs.com/api.html#res
 * https://nodejs.org/api/http.html#http_http_request_options_callback
 */
module.exports = function MockExpressResponse () {
	var _self = this;
	this._statusCode = void 0;
	this._bodyData = void 0;
	this._header = {};
	this.status = function ( statusCode ) {
		_self._statusCode = statusCode;
		return _self;
	};
	this.send = function ( bodyData ) {
		_self._bodyData = bodyData;
		return _self;
	};
	this.set = function ( key, val ) {
		this._header[key] = val;
	};
};
