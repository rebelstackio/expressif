/* testserver/controllers/products/index.js */
'use strict';
const RESPOND = global.E.Respond;

const ProductModel = require('../../models/product');
const { handleModelError } = require('../../lib/handler');
const pmodel = new ProductModel(global.DB);

function getProduct ( req, res ) {
	const path = req.originalUrl;
	const productid = req.params.productid;
	global.LOGGER.info(`GET request for ${req.originalUrl} endpoint requested `);
	pmodel.getProduct ( productid, ( error, data ) => {
		if ( error ) {
			return handleModelError(req, res, error);
		} else {
			let wrapper = RESPOND.wrapSuccessData( data, path );
			return RESPOND.success( res, req, wrapper );
		}
	});
}

function postProduct ( req, res ) {
	const path = req.originalUrl;
	global.LOGGER.info(`POST request for ${req.originalUrl} endpoint requested `);
	pmodel.postProduct ( req.body.productName, req.body.quantity, req.body.price, ( error, data ) => {
		if ( error ) {
			return handleModelError(req, res, error);
		} else {
			let wrapper = RESPOND.wrapSuccessData( data, path );
			return RESPOND.success( res, req, wrapper );
		}
	});
}

module.exports = { getProduct, postProduct };
