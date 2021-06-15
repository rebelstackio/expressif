/* lib/server/v2/index.js */
'use strict';

const fsm = require('fs');
const pathm = require('path');
const exp = require('express');

const DEFAULT = require('./defaults.json');
const jv = require('../jsonvalidator');

/**
 * Builds servers based on an express app and custom details
 * @param {object} options Custom options for expressif server and express server. Check defaults.json'
 * @param {object} dependecies
 */
const ServerFactory = ( options, { express = exp, console = global.console, req = require, fs = fsm, path = pathm, JSONValidator = jv } = { express:exp, console:global.console, req:require, fs:fsm, path: pathm, JSONValidator: jv }) => {

	if ( ! global.LOGGER ) {
		global.LOGGER = console;
	}

	global.LOGGER.debug(`Expressif::Configuring expressif server...`);

	const _options = {...DEFAULT, ...options };
	const _app = express(_options);

	// Call Harcoded Default Middlewares
	_app.use(express.json({}));
	_app.use(express.urlencoded({extended:true}));
	_app.disable('x-powered-by');
	_app.enable('trust proxy');

	let _server = null, jsv = null;

	const { routers:routerspath, socketfile, port, host, schemas:schemaspath, wdir } = _options;

	if ( wdir === undefined || wdir === null || !wdir ) {
		throw new TypeError(`Invalid server creation.Provide 'wdir' property in your options argument...`);
	}

	const _schemaspath = path.join(wdir, schemaspath);

	// 1) Load schemas and JSON validator object
	global.LOGGER.debug('Expressif::Loading JSON Validator...');
	global.LOGGER.debug(`Expressif::Schemas location: ${_schemaspath}`);

	if ( fs.existsSync(_schemaspath) ) {
		jsv = JSONValidator.init(_schemaspath, _options.schemas_options).loadSchemas();
	} else {
		global.LOGGER.warn(`Expressif::Invalid schemas path: ${_schemaspath}`);
		jsv = null;
	}

	const _dependecies = { jsv };

	if ( Array.isArray(routerspath) ){
		try {
			routerspath.forEach(( r ) => req(r)(_app, _options.router_options, _dependecies));
		} catch (error) {
			global.LOGGER.warn(`Expressif::Unable to load router:`, error);
		}
	} else if ( typeof routerspath === 'string') {
		req(path.join(wdir, routerspath))(_app, _options.router_options, _dependecies);
	} else{
		throw new TypeError(`Invalid value for routers`, routerspath);
	}

	/**
	 * Send the app to the client context to load middlewares or express settings
	 * @param {function} cb
	 */
	const configureapp = ( cb ) => {
		cb(_app, express);
	};

	const start = () => {
		if ( socketfile ) {
			global.LOGGER.debug(`Expressif::Starting server with unix socket file(${socketfile})...`);
			let mask = process.umask(0);
			if (fs.existsSync(socketfile)) {
				fs.unlinkSync(socketfile);
			}
			_server = _app.listen(socketfile, () => {
				if (mask) {
					process.umask(mask);
					mask = null;
				}
				global.LOGGER.info(`Expressif::App is running on ${socketfile}`);
			});
		} else {
			_app.set('host', host);
			_app.set('port', port);
			global.LOGGER.debug(`Expressif::Starting server on http://${_app.get('host')}:${_app.get('port')}...`);
			_server = _app.listen(_app.get('port'), _app.get('host'), () => {
				global.LOGGER.info(`Expressif::Server is running on http://${_app.get('host')}:${_app.get('port')}`);
			});
		}
	};

	const stop = () => {
		_server.close();
	};

	return {
		configureapp,
		start,
		stop
	};
};

module.exports = ServerFactory;
