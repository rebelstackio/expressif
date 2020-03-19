/* lib/router/v2/index.js */
'use strict';

const express = require('express');

const reqvalidatormw = require('../../middlewares/reqvalidator');

/**
 * Wrapper function to the middleware returning
 * a new function with attached properties
 * @param {function} mw Middleware
 * @param {object} mwprops Custom properties
 */
const mwwrapper = function _mwwrapper( mw, mwprops = null ) {
	if ( mwprops ) {
		return function _mwwrapper(req, res, mwprops, next) {
			return mw(req, res, mwprops, next);
		};
	} else {
		return function _mwwrapper(req, res, next) {
			return mw(req, res, next);
		};
	}
};

/**
 * Add middlewares from an array if they are function and attach custom properties
 * if it is requried
 * @param {array} mwarr Array of middlewares functions
 * @param {object} mwprops Custom properties
 */
const addMWFromArray = function _addMWFromArray(mwarr, mwprops = null ){
	return mwarr.map( mw => {
		if (mw instanceof Function) {
			if ( mwprops ) {
				return mwwrapper(mw, mwprops);
			} else {
				return mw;
			}
		}
	});
};

/**
 * Router Factory
 * @param {array} routes Array of custom routes
 * @param {object} dependecies Object with dependecies loaded from the server main object that allows to process the request to the routers
 * @param {object} expOpts Express Router Options
 */
const RouterFactory = function _RouterFactory(routes, expOpts = {}, dependecies ){

	return routes.map( routedefinition  => {
		let r;
		try {
			let mws = [];
			const {
				method, path, rprivs, rxvalid, validreq, mwares, rroles, droles, auth,
			} = routedefinition;

			// 1) Apply auth middlewares if exists
			if ( auth ){
				switch(true){
				case (auth instanceof Function):
					mws.push(
						mwwrapper(auth, {rprivs, rroles, droles})
					);
					break;
				case (Array.isArray(auth)):
					mws = mws.concat(addMWFromArray(auth, {rprivs, rroles, droles} ));
					break;
				default:
					global.LOGGER.warn(`Ignoring middleware:`, auth);
				}
			}

			// 2) Apply request middlewares
			if (rxvalid) {
				mws.push(reqvalidatormw(rxvalid));
			}

			// 3) Apply request body middlewares if it exists
			if (validreq) {
				mws.push(validreq);
			}

			// 4) Apply custom middlewares provide by the user
			if (mwares) {
				switch (true) {
				case (mwares instanceof Function):
					mws.push(mwares);
					break;
				case (mwares instanceof Array):
					mws = mws.concat(addMWFromArray(mwares));
					break;
				default:
					global.LOGGER.warn(`Ignoring middleware:`, mwares);
				}
			}

			r = new express.Router(expOpts);
			r[method](path, mws);
			return r;
		} catch (error) {
			global.LOGGER.error(`Router cannot be loaded:`, error);
			r = null;
			return undefined;
		}
	}).filter( r => r !== undefined );
};

module.exports = RouterFactory;
