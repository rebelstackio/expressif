/* lib/log/basic.js */
'use strict';

/**
 * Really basic logger - Extend console object with debug and fatal
 */
class BasicLogger {
	constructor () {
		console.debug = console.log;
		console.fatal = console.error;
		return console;
	}
}

module.exports = BasicLogger;
