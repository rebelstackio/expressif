/* lib/server/index.js */
'use strict';

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { BasicLogger } = require('../log');
const SCONFIG = require('./server.default');

/**
 * Main class to create a REST API Server
 * TODO: Respond with assets or resources [ Not required for REST API - assets can handle by a external tool (e.g nginx)]
 * TODO: Respond with template language like nunjucks [ Not required for REST API]
 */
class Server {

	/**
	 * Build the express app
	 * @param {object} config
	 * @param {object} dependecies
	 */
	constructor(config = {}, dependecies = {}) {
		// Set a config object
		if (config && config.constructor === Object) {
			// TODO: test config against jsonschema for validity
			this._config = Object.assign({}, SCONFIG, config);
		} else {
			throw new TypeError(`config parameter is not Object or object literal`);
		}

		// Set dependecies object with upper level objects (e.g Logger)
		if ( dependecies && dependecies.constructor === Object) {
			let logger;
			if ( !dependecies.LOGGER ) {
				logger = new BasicLogger();
			} else {
				logger = dependecies.LOGGER;
			}
			this._dependecies = {
				LOGGER: logger
			};
		} else {
			throw new TypeError('dependecies parameter is not Object or object literal');
		}

		// Create the express app
		this.app = express();

		// Disable powered header
		this.app.disable('x-powered-by');

		// Enable cors
		if ( this._config.cors.constructor === Object) {
			this.app.use(cors());
		} else if ( Boolean(this._config.cors) ) {
			this.app.use(cors(this._config.cors));
		}

		// Enable case sensitivity. When enabled, "/Foo" and "/foo" are different routes.
		// When disabled, "/Foo" and "/foo" are treated the same.
		if (Boolean(this.config.case_sensitive_routing)) {
			this.app.set('case sensitive routing', this._config.case_sensitive_routing);
		}

		// for parsing application/json with the express default body parser or a custom one
		const bodyParser = require('body-parser');
		this.app.use(bodyParser.json());
		// for parsing application/x-www-form-urlencoded
		this.app.use(bodyParser.urlencoded({ extended: true }));

		// compression middleware that supports gzip and deflate
		// and external service(e.g nginx) should do it instead of the backend server
		if (this._config.compression) {
			const compression = require('compression');
			if (this._config.compression.threshold) {
				this.app.use(compression({ threshold: this._config.compression.threshold }));
			} else {
				this.app.use(compression({ threshold: 256 }));
			}
		}

		// only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
		// https://expressjs.com/es/guide/behind-proxies.html
		if (Boolean(this._config.trust_proxy)) {
			this.app.enable('trust proxy');
		}

		// Disabled by default, “/foo” and “/foo/” are treated the same by the router.
		this.app.set('strict routing', Boolean(this._config.strict_routing));

		// Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it.
		if (Boolean(this._config.method_override)) {
			const methodOR = require('method-override');
			this.app.use(methodOR('X-HTTP-Method-Override'));
		}

		// Load custom routers
		if (this._config.routers && this._config.routers.length > 0) {
			this._config.routers.forEach(function (router) {
				try {
					require(router.relpath)(this.app);
				} catch (error) {
					this.dependecies.LOGGER.error(
						`Unable to load route ${router.relpath}. Will be ignored...`
					);
				}
			}.bind(this));
		}
	}

	/**
	 * Dependecies Getter
	 */
	get dependecies() {
		return this._dependecies;
	}

	/**
	 * Config Getter
	 */
	get config() {
		return this._config;
	}

	/**
	 * Start the server based on the config loaded
	 */
	start() {
		// Check if the server will be available by a socket or a port
		const socket = this._config.socketfile;
		if (socket) {
			// Socket
			let mask = process.umask(0);
			if (fs.existsSync(socket)) {
				fs.unlinkSync(socket);
			}
			this.server = this.app.listen(socket, function () {
				if (mask) {
					process.umask(mask);
					mask = null;
				}
				this.dependecies.LOGGER.info(`App is running on ${socket}`);
			}.bind(this));
		} else {
			// Port
			this.app.set('port', (this._config.port || 8888));
			this.server = this.app.listen(this.app.get('port'),  () => {
				this.dependecies.LOGGER.info(`App is running on port ${this.app.get('port')}`);
			});
		}
	}

	/**
	 * Shut down the server( if it exists)
	 */
	close() {
		if ( this.server ) {
			this.server.close();
		}
	}

}

module.exports = Server;
