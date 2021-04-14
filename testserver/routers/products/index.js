/* testserver/routers/products/index.js */
'use strict';

const Router = global.E.RouterV2;
const RX = global.E.ReqValidator;

const cc = require('../../controllers/products');

// FIXME: Make a wrapper to this functions an expose only the array section to make the life easier to the clients
const ProductRouter = function ProductRouter ( defaultrouteroptions = {}, dependecies = {} ) {
	const routes = [
		{
			method: 'get',
			path: '/:productid',
			auth: { type: 'public' },
			mwares: [ cc.getProduct ],
			rxvalid: RX.NOT_ACCEPT_JSON,
		}
	];
	// Use the router options set at Server level. Could overwrite these value for a specific router
	return Router(routes, defaultrouteroptions, dependecies);
};

module.exports = ProductRouter;

