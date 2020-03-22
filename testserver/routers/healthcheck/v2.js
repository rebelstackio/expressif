/* routers/healthcheck/index.js */
'use strict';

const Router = global.E.RouterV2;
const RX = global.E.ReqValidator;

const cc = require('controllers/healthcheck');

const HealthCheckRouter = function HealthCheckRouter ( defaultrouteroptions = {}, dependecies = {} ) {
	const routes = [
		{
			method: 'get',
			path: '/',
			rprivs: [1,3],
			mwares: [cc.getHealthCheck],
			rxvalid:RX.NOT_ACCEPT_JSON,
		}
	];
	// Use the router options set at Server level. Could overwrite these value for a specific router
	return Router(routes, defaultrouteroptions, dependecies);
};

module.exports = HealthCheckRouter;

