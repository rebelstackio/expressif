/* routers/healthcheck/index.js */
'use strict';

const Router = require('@rebelstack-io/expressif').Router;
const RX = require('@rebelstack-io/expressif').ReqValidator;

const cc = require('controllers/healthcheck');

const HealthCheckRouter = function HealthCheckRouter (auth) {
	const routes = [
		{
			method: 'get',
			path: '/',
			rprivs: [1,3],
			mwares: [cc.getHealthCheck],
			rxvalid:RX.NOT_ACCEPT_JSON,
		}
	];
	const router = new Router({}, auth);
	router.addRoutes(routes);
	return router.router;
}

module.exports = HealthCheckRouter;

