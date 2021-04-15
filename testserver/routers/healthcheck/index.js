/* routers/healthcheck/index.js */
'use strict';

const Router = global.E.Router;
const RX = global.E.ReqValidator;

const cc = require('controllers/healthcheck');

const HealthCheckRouter = function HealthCheckRouter ( defaultrouteroptions = {}, dependecies = {} ) {
	const routes = [
		{
			method: 'get',
			path: '/',
			auth: { type: 'public' },
			mwares: [cc.getHealthCheck],
			rxvalid:RX.NOT_ACCEPT_JSON,
		}
	];
	return Router(routes, defaultrouteroptions, dependecies);
};

module.exports = HealthCheckRouter;

