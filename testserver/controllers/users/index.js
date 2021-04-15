/* testserver/controllers/products/index.js */
'use strict';
const RESPOND = global.E.Respond;

// const ProductModel = require('../../models/product');
// const { handleModelError } = require('../../lib/handler');
// const pmodel = new ProductModel(global.DB);

function getUsers ( req, res ) {
	const path = req.originalUrl;
	global.LOGGER.info(`GET request for ${req.originalUrl} endpoint requested `);
	let wrapper = RESPOND.wrapSuccessData( [ { u:1 } ], path );
	return RESPOND.success( res, req, wrapper );
}

module.exports = { getUsers };
