/* testserver/routers/users/index.js */
'use strict';

const Router = global.E.Router;
const RX = global.E.ReqValidator;

const cc = require('../../controllers/users');

const UsersRouter = function UsersRouter ( defaultrouteroptions = {}, dependecies = {} ) {
	const routes = [
		{
			method: 'get',
			path: '/',
			auth: { type: 'simple' },
			mwares: [ cc.getUsers],
			rxvalid: RX.NOT_ACCEPT_JSON
		}
	];

	// Use the router options set at Server level. Could overwrite these value for a specific router
	return Router(routes, defaultrouteroptions, dependecies);
};


module.exports = UsersRouter;

