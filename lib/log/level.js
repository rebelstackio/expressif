/* lib/log/level.js */
'use strict';

/**
 * Logger Level common variables and functions
 */

/**
	* Levels values as an array
	*/
const LEVELS_ARR = ['ERROR', 'WARN', 'INFO', 'VERBOSE', 'TRACE', 'DEBUG', 'SILLY'];

/**
 * Levels as a object
 */
const LEVELS_VALUE = {
	'ERROR':   0,
	'WARN':    1,
	'INFO':    2,
	'VERBOSE': 3,
	'TRACE':   3,
	'DEBUG':   4,
	'SILLY':   5
};

/**
 * Return the level based on the argument ( also transform it to upperCase)
 * @param {*} level
 */
const getLevel = (level)  => {
	try {
		const _level = level.toUpperCase();
		const validLevel = LEVELS_VALUE[_level];
		if ( validLevel >= 0) {
			return validLevel;
		} else {
			return LEVELS_VALUE['INFO'];
		}
	} catch (error) {
		// Any exception or invalid code set the logger to info level by default
		return LEVELS_VALUE['INFO'];
	}
};

module.exports = {
	LEVELS_ARR,
	LEVELS_VALUE,
	getLevel
};
