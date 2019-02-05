/* lib/log/level.js */
'use strict';

const LEVELS_ARR = ['ERROR', 'WARN', 'INFO', 'VERBOSE', 'DEBUG', 'SILLY']

const LEVELS_VALUE = {
	'ERROR':   0,
	'WARN':    1,
	'INFO':    2,
	'VERBOSE': 3,
	'DEBUG':   4,
	'SILLY':   5
};

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
		// Any exception or invalid code set the logger to info level
		return LEVELS_VALUE['INFO'];
	}
}

module.exports = {
	LEVELS_ARR,
	LEVELS_VALUE,
	getLevel
}
