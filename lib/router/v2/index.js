/* lib/router/v2/index.js */
'use strict';

const express = require('express');

const RX = require('../../reqvalidator');


const mwwrapper = function _mwwrapper( mw, mwprops = null ) {
	if ( mwprops ) {
		return function _mwwrapper(req, res, mwprops, next) {
			return mw(req, res, mwprops, next);
		}
	} else {
		return function _mwwrapper(req, res, next) {
			return mw(req, res, next);
		}
	}
};

const addMWFromArray = function _addMWFromArray(mwarr, mwprops = null ){
	mwarr.map( mw => {
		if (mw instanceof Function) {
			return mwwrapper(mw, mwprops);
		}
	});
};

const RouterFactory = function _RouterFactory(routes, expOpts = {} ){

	return routes.map( routedefinition  => {
		let r;
		try {
			let mws = [];
			const {
				method, path, rprivs, rxvalid, validreq, validres, mwares, rroles, droles, auth,
			} = routedefinition;

			// 1) Apply auth middlewares if it exists
			if ( auth ){
				switch(true){
					case (auth instanceof Function):
						mws.push(
							mwwrapper(auth, rprivs, rroles, droles)
						);
						break;
					case (Array.isArray(auth)):
						mws.concat(addMWFromArray(auth, {rprivs, rroles, droles} ));
						break;
					default:
						global.LOGGER.warning(`Ignoring middleware:`, auth);
				}
			}

			// 2) Apply request middlewares
			if (rxvalid) {
				mws.push(RX.validate(rxvalid));
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
						addMWFromArray(mwares);
						break;
					default:
						global.LOGGER.warning(`Ignoring middleware:`, auth);
				}
			}

			r = new express.Router(expOpts);
			r[method](path, mws);
		} catch (error) {
			global.LOGGER.error(`Router cannot be loaded:`, error);
			r = null;
		} finally {
			return r;
		}
	});
};

module.exports = RouterFactory;
