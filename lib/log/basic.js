/* lib/log/basic.js */
'use strict';
const { LEVELS_VALUE, getLevel } = require('./level');

/**
 * Really basic logger - Extend console object with debug, trace, verbose and silly
 */
class BasicLogger {

	constructor (level='INFO', settimestamp = false) {
		this._settimestamp = !!settimestamp;
		this._level = getLevel(level);
	}

	get level() {
		return this._level;
	}

	info() {
		if ( this._level >= LEVELS_VALUE['INFO']) {
			console.info.apply(console, arguments);
			return undefined;
		} else {
			return false;
		}
	}

	warn() {
		if ( this._level >= LEVELS_VALUE['WARN']) {
			console.warn.apply(console, arguments);
			return undefined;
		} else {
			return false;
		}
	}

	error() {
		if ( this._level >= LEVELS_VALUE['ERROR']) {
			console.error.apply(console, arguments);
			return undefined;
		} else {
			return false;
		}
	}

	trace() {
		if ( this._level >= LEVELS_VALUE['VERBOSE']) {
			console.log.apply(console, arguments);
			return undefined;
		} else {
			return false;
		}
	}

	verbose() {
		this.trace(arguments);
	}

	debug() {
		if ( this._level >= LEVELS_VALUE['DEBUG']) {
			console.debug.apply(console, arguments);
			return undefined;
		} else {
			return false;
		}
	}

}

module.exports = BasicLogger;

