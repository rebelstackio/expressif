/* lib/router/index.js */
'use strict';

const express = require('express');

const reqvalidatormw  = require('../middlewares/reqvalidator');
const jsonvalidatormw = require('../middlewares/jsvalidator');
const authvalidatormw = require('../middlewares/authvalidator');

const ALLOWED_AUTH_TYPES = ['public', 'simple', 'privileges', 'roles'];

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
const RouterFactory = function _RouterFactory(routes, expOpts = {}, dependecies = {} ){

	const { jsv, authv } = dependecies;

	return routes.map( routedefinition  => {
		let r, authparams;
		try {
			let mws = [];
			const {
				method, path, rxvalid, validreq, mwares, auth
			} = routedefinition;

			// Check auth property first to determine the auth level
			if ( auth ) {
				if ( ALLOWED_AUTH_TYPES.indexOf(auth.type) < 0 ){
					global.LOGGER.warn(`Expressif::Invalid Auth type: ${auth.typr}. Setting the router(${method} ${path}) as public`);
					authparams = {  auth, ...{ type: 'public' } };
				} else {
					authparams = auth;
				}
			} else {
				global.LOGGER.warn(`Expressif::No Auth property provided. Setting the router(${method} ${path}) as public`);
				authparams = { type: 'public' };
			}

			// 1) Apply auth middlewares if exists and if the endpoint is not public
			if ( authparams.type !== 'public' ) {
				mws.push(authvalidatormw(authparams, authv ));
			}

			// 2) Apply request middlewares
			if (rxvalid) {
				mws.push(reqvalidatormw(rxvalid));
			}

			// 3) Apply request body middlewares if it exists
			if ( validreq && jsv ) {
				mws.push(jsonvalidatormw(validreq, jsv));
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
					global.LOGGER.warn(`Expressif::Ignoring middleware:`, mwares);
				}
			}
			// 5) Create express router
			r = new express.Router(expOpts);
			r[method](path, mws);
			return r;
		} catch (error) {
			global.LOGGER.error(`Expressif::Router cannot be loaded:`, error);
			r = null;
			return undefined;
		}
	}).filter( r => r !== undefined );
};

module.exports = RouterFactory;
