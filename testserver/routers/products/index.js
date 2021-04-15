/* testserver/routers/products/index.js */
'use strict';

const Router = global.E.Router;
const RX = global.E.ReqValidator;

const cc = require('../../controllers/products');

const ProductRouter = function ProductRouter ( defaultrouteroptions = {}, dependecies = {} ) {
	const routes = [
		{
			method: 'get',
			path: '/:productid',
			auth: { type: 'public' },
			mwares: [ cc.getProduct ],
			rxvalid: RX.NOT_ACCEPT_JSON,
		},
		{
			method: 'post',
			path: '/',
			auth: { type: 'public' },
			mwares: [ cc.postProduct ],
			rxvalid: RX.NOT_ACCEPT_JSON | RX.NOT_APPLICATION_JSON,
			validreq: 'postProducts'
		}
	];

	// Use the router options set at Server level. Could overwrite these value for a specific router
	return Router(routes, defaultrouteroptions, dependecies);
};


module.exports = ProductRouter;

