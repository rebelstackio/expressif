/* lib/server/index.js */
'use strict';

const express = require('express');
const path = require('path');

class Server {

	static defaults () {
		return {
			"title":"expressible server configuration defaults",
			"version":"0.2.1",
			"config":{
				"case_sensitive_routing":true,
				"compression":{"threshold":256},
				"port":80,
				"trust_proxy":true,
				"statics":[
					{ "relpath":"assets", "route":"assets" }
				],
				"strict_routing":true,
				"method_override":true,
				"routers":[
					{ "relpath":"routers" }
				],
				"templates":[
					{ "relpath":"views", "route":"app", "renderer":"nunjucks" } 
				]
			}
		};
	}

	constructor ( config, globals ) {
		if ( config && config.constructor === Object ) {
			// TODO: test config against jsonschema for validity
			this._config = Object.assign(Server.defaults,config);
		} else {
			throw new TypeError(`config parameter is not Object or object literal`);
		}
		if ( globals && globals.constructor === Object ) {
			if ( !globals.LOGGER ) {
				console.debug = console.log;
				console.fatal = console.error;
				globals.LOGGER = console;
			}
			this._globals = globals;
		} else {
			throw new TypeError('globals parameter is not Object or object literal');
		}
		this.app = express();
		this.app.disable('x-powered-by');
		if ( Boolean(this.config.case_sensitive_routing) ) {
			this.app.set('case sensitive routing', true);
		}

		if ( this.config.bodyparserPath ) {
			// TODO: THIS MIGHT CHANGE IN THE FUTURE
			this.app.use(require(bodyparserPath));
		} else {
			this.app.use(express.bodyParser());
		}

		if ( this.config.compression ) {
			const compression = require('compression');
			if ( this.config.compression.threshold ) {
				this.app.use( compression( { threshold:this.config.compression.threshold } ) );
			} else {
				this.app.use( compression( { threshold:256 } ) );
			}
		}
		if ( Boolean(this.config.trust_proxy) ) {
			this.app.enable('trust proxy');
		}
		if ( this.config.statics && this.config.statics.length > 0 ) {
			this.config.statics.forEach ( function( statc ) {
				let staticDir = path.resolve( process.env.NODE_PATH || __dirname, statc.relpath );
				let staticRUrl = statc.route || "/static";
				this.app.use( staticRUrl, express.static( staticDir ) );
			}, this);
		}
		if ( Boolean(this.config.strict_routing) ) {
			this.app.set('strict routing', true);
		}
		if ( Boolean(this.config.method_override) ) {
			const methodOR = require('method-override');
			this.app.use( methodOR('X-HTTP-Method-Override') );
		}
		if ( this.config.routers && this.config.routers.length > 0  ) {
			this.config.routers.forEach( function( router ) {
				require(router.relpath)(globals);
			});
		}
		if ( this.config.templates && this.config.templates.length > 0 ) {
			// 		const nunjucks = require ('nunjucks');
			// TODO: implement
		}

	}

	get global () {
		return this._globals;
	}

	get config () {
		return this._config.config;
	}

	start () {
		this.app.set('port', ( this.config.port || 8888 ));
		this.app.listen( this.app.get('port'), function() {
			this.global.LOGGER.info(`App is running on port ${ this.app.get('port') }`);
		});
	}

}

module.exports = Server;
