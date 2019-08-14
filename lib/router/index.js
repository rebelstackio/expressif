/* lib/router/index.js */

const hasProp = Object.prototype.hasOwnProperty;
const express = require('express');
const { Auth, AuthByPrivs, AuthByRoles} = require('../auth');
const RX = require('../reqvalidator');
const jsvalidatormwr = require('../middlewares/jsvalidator');
const RESPOND = require('../respond');

class Router {

	/**
	 *
	 * @param {object} options Express router options{caseSensitive, mergeParams, strict}
	 * @param {*} auth
	 * @param {*} jsvalidator
	 */
	constructor(options = {}, auth=null, jsvalidator=null) {
		this.options = options;
		this.router = new express.Router(options);
		this.auth = auth;
		this.jsvalidator = jsvalidator;
		this.optionsResponse = {};
	}

	buildOptionsRoute(optionsData) {
		function getOptionsController(apiDoc) {
			return function optionController(req, res) {
				const wrapper = RESPOND.wrapSuccessData(apiDoc, req.path, true);
				RESPOND.success(res, req, wrapper);
			};
		}
		const mws = [];
		mws.push(RX.validate(RX.NOT_ACCEPT_JSON));
		mws.push(getOptionsController(optionsData));
		return mws;
	}

	fillRecursiveTemplate(schema, id, jv) {

		const isObject = function isObject(value) {
			return value && typeof value === 'object' && value.constructor === Object;
		}

		if (id == null) {
			id = schema.$id
		}
		const keys = Object.keys(schema);
		keys.forEach((key) => {
			let value = schema[key];
			if (value.$ref) {
				let schemaRef
				if (value.$ref.indexOf('#') == 0) {
					schemaRef = id + value.$ref.substr(1)
				} else {
					schemaRef = value.$ref;
				}
				const sq = jv.ajv.getSchema(schemaRef);
				schema[key] = this.fillRecursiveTemplate(sq.schema, null, jv);
			}
			if (isObject(value)) {
				this.fillRecursiveTemplate(value, id, jv)
			}
		});
		return schema
	}

	addRoute(routedef, rebuildOptsRoute) {
		const self = this;
		const { rprivs, rxvalid, validreq, validres, mwares, rroles, droles } = routedef;
		const auth = routedef.auth || this.auth;
		let mws = [];

		function addMiddleWareFromArray(mwarray) {
			mwarray.forEach(function (mware) {
				if (mware instanceof Function) {
					mws.push(mware);
				} else {
					throw new TypeError("unsupported type for mware - must be a function");
				}
			});
		}

		function buildOptionsData(rt, jv, auth) {
			const od = { verb: rt.method };
			od.enforce_schema = Boolean(jv);
			od.authorization = Boolean(auth);
			od.description = rt.desc;
			switch (true) {
				case Boolean(rt.rxvalid): od.request_validation = RX.printRXValid(rt.rxvalid);
				case Boolean(rt.validreq): if (Boolean(rt.validreq)) od.request_schema = self.fillRecursiveTemplate(jv.ajv.getSchema(rt.validreq).schema, null, jv);
				case Boolean(rt.validres): if (Boolean(rt.validres)) od.response_schema = self.fillRecursiveTemplate(jv.ajv.getSchema(rt.validres).schema, null, jv);
				case Boolean(auth && rt.rprivs): od.required_privileges = rt.rprivs;
				case Boolean(auth && rt.rroles): od.required_roles = rt.rroles;
				case Boolean(auth && rt.droles): od.denied_roles = rt.droles;
			}
			return od;
		}

		// Apply auth middlewares if it exists
		if (auth) {
			switch (true) {
				case (auth instanceof AuthByPrivs): mws.push(auth.middleware(rprivs)); break;
				case (auth instanceof AuthByRoles): mws.push(auth.middleware(rroles, droles)); break;
				case (auth instanceof Auth): mws.push(auth.middleware()); break;
				case (auth instanceof Function): mws.push(auth); break;
				case (Array.isArray(auth)): addMiddleWareFromArray(auth); break;
				default: throw new TypeError("unsupported type for auth");
			}
		}

		// Apply request header validator middlewares if it exists
		if (rxvalid) {
			mws.push(RX.validate(rxvalid));
		}

		// Apply request body validator middlewares if it exists
		if (validreq) {
			if (this.jsvalidator) {
				mws.push(jsvalidatormwr(this.jsvalidator, validreq));
			}
		}

		// Apply custom middlewares provide by the user
		if (mwares) {
			switch (true) {
				case (mwares instanceof Function): mws.push(mwares); break;
				case (mwares instanceof Array): addMiddleWareFromArray(mwares); break;
				default: throw new TypeError("unsupported type for mwares - must be a Function or array of Functions");
			}
		}
		// Set reouter definition verb - path - middlewares
		this.router[routedef.method](routedef.path, mws);

		if (routedef.addOptionsRoute !== false) {
			if (!hasProp.call(this.optionsResponse, routedef.path)) {
				this.optionsResponse[routedef.path] = [];
			}
			this.optionsResponse[routedef.path].push(buildOptionsData(routedef, this.jsvalidator, this.auth));
		}

		if (this.options.addOptionsRoute !== false && rebuildOptsRoute) {
			this.router.options('/', this.buildOptionsRoute(this.optionsResponse));
		}
	}

	addRoutes(routes) {
		routes.forEach(function (routedef, idx, arr) {
			if ((idx + 1) == arr.length) {
				this.addRoute(routedef, true);
			} else {
				this.addRoute(routedef);
			}
		}, this);
	}
}

module.exports = Router;
