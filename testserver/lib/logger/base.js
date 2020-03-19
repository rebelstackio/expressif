/* src/lib/logger/base.js */
'use strict';

/**
 * Prototypal object for a wrapper logger component based on log4js
 */
const LoggerPrototypal = {
	engine: {},
	debug : function _debug() {
		if ( this.engine.debug ) {
			this.engine.debug.apply(this.engine, arguments);
		}
	},

	info: function _info() {
		if ( 	this.engine.info ){
			this.engine.info.apply(this.engine, arguments);
		}
	},

	warn: function _warn() {
		if ( 	this.engine.warn ){
			this.engine.warn.apply(this.engine, arguments);
		}
	},

	error: function _error() {
		if ( 	this.engine.error ){
			this.engine.error.apply(this.engine, arguments);
		}
	},

	fatal: function _fatal() {
		if ( 	this.engine.fatal ){
			this.engine.fatal.apply(this.engine, arguments);
		}
	}
};

module.exports = LoggerPrototypal;
