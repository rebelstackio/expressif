/* models/access/index.js */
'use strict';

const { BadRequest }  = require('../../lib/exception');

const ProductModel = function _ProductModel ( db = global.DB ) {
	this.db = db;
};

/**
 * Get a product
 * @param {integer|string} pid product id
 * @param {function} next
 */
ProductModel.prototype.getProduct = function _getProduct(pid = null, next) {
	if ( !pid ) {
		return process.nextTick(
			next,
			new BadRequest(`Product id property is required`)
		);
	}
	let stmt = `select * from public.get_product( $1::BIGINT )`;
	let params = [ pid ];
	this.db.query( stmt, params, ( error, result ) => {
		return next(
			error,
			result ? result['rows'] : null
		);
	});
};

/**
 * Create a product
 * @param {integer|string} dealerid
 * @param {function} next
 */
ProductModel.prototype.postProduct = function _postProduct(name, qty, price, next) {
	let stmt = `select public.post_product( ($1, $2, $3)::product_upsert )`;
	let params = [ name, qty, price];
	this.db.query( stmt, params, ( error, result ) => {
		return next(
			error,
			result ? result['rows'][0][`post_product`] : null
		);
	});
};

module.exports = ProductModel;

