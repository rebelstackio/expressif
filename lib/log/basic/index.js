/* lib/log/basic.js */
'use strict';
const { LEVELS_VALUE, getLevel } = require('../level');

/**
 * Really basic logger - Extend console object with debug, trace, verbose and silly
 * TODO: Make a log method that accepts the levels as parameter
 * TODO: Set the timestamp - Most of the popoular logger libraries set the timestamp already but the main idea is to create a basic logger that could work in production
 */
class BasicLogger {

	/**
	 * Set the logger level, by default is Info
	 * @param {*} level
	 */
	constructor (level='INFO') {
		this._level = getLevel(level);
	}

	/**
	 * Getter Level
	 */
	get level() {
		return this._level;
	}

	/**
	 * Change the level, if the argument is not valid will set the info level by default
	 * @param {*} level
	 */
	setLevel(level) {
		this._level = getLevel(level);
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

