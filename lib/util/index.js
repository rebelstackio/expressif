/* lib/util/index.js */
'use strict';

function toBitwiseArray(intmask) {
	const bwarr = [];
	for (let x = 31; x >= 0; x -= 1) {
		if ((intmask >> x) & 1 !== 0) {
			bwarr.push(Math.pow(2, x));
		}
	}
	return bwarr.reverse();
};

module.exports.toBitwiseArray = toBitwiseArray;
