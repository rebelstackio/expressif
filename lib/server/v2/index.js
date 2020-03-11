/* lib/server/v2/index.js */
'use strict';

const fsm = require('fs');
const exp = require('express');

const DEFAULT = require('./defaults.json');

const ServerFactory = ( options, { express = exp, console = global.console, req = require, fs = fsm } = { express:exp, console:global.console, req:require, fs:fsm } ) => {

	if ( ! global.LOGGER ) {
		global.LOGGER = console;
	}

	//FIXME: Check for debug method in the LOGGER ?
	global.LOGGER.debug(`Configuring expressif server...`);

	var _options = {...DEFAULT, ...options };
	var _app = express(_options);
	// eslint-disable-next-line no-unused-vars
	var _server = null;

	var { routers, socketfile, port } = _options;

	// FIXME: Avoid stop the whole app if there is a bad router ?
	if ( Array.isArray(routers) ){
		routers.forEach(( r ) => req(r)(_app));
	} else if ( typeof routers === 'string') {
		req(routers)(_app);
	} else{
		throw new TypeError(`Invalid value for routers`, routers);
	}

	/**
	 * Send the app to the client context to load middlewares or express settings
	 * @param {function} cb
	 */
	const configureapp = ( cb ) => {
		cb(_app);
	};

	const start = () => {
		if ( socketfile ) {
			global.LOGGER.debug(`Starting server with unix socket file(${socketfile})...`);
			let mask = process.umask(0);
			if (fs.existsSync(socketfile)) {
				fs.unlinkSync(socketfile);
			}
			_server = _app.listen(socketfile, () => {
				if (mask) {
					process.umask(mask);
					mask = null;
				}
				global.LOGGER.info(`App is running on ${socketfile}`);
			});
		} else {
			global.LOGGER.debug(`Starting server with HTTP port(${port})...`);
			_app.set('port', port);
			_server = _app.listen(_app.get('port'),  () => {
				global.LOGGER.info(`App is running on port ${_app.get('port')}`);
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
