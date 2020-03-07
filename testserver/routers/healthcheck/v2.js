/* routers/healthcheck/index.js */
'use strict';

const Router = global.E.RouterV2;
const RX = global.E.ReqValidator;

const cc = require('controllers/healthcheck');

const HealthCheckRouter = function HealthCheckRouter () {
	const routes = [
		{
			method: 'get',
			path: '/',
			rprivs: [1,3],
			mwares: [cc.getHealthCheck],
			rxvalid:RX.NOT_ACCEPT_JSON,
		}
	];
	return Router(routes);
}

module.exports = HealthCheckRouter;

