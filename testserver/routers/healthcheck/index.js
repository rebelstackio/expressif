/* routers/healthcheck/index.js */
'use strict';

const Router = global.E.Router;
const RX = global.E.ReqValidator;

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

