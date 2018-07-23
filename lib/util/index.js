/* lib/util/index.js */
'use strict';

class ConsoleLogger {
	constructor () {
		/* eslint-disable */
		console.debug = console.log;
		console.fatal = console.error;
		return console;
		/* eslint-enable */
	}
}

function toBitwiseArray(intmask) {
	const bwarr = [];
	for (let x = 31; x >= 0; x -= 1) {
		if ((intmask >> x) & 1 !== 0) {
			bwarr.push(Math.pow(2, x));
		}
	}
	return bwarr.reverse();
};

module.exports.ConsoleLogger = ConsoleLogger;
module.exports.toBitwiseArray = toBitwiseArray;
