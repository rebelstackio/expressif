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

/**
 * Remove properties with null as value or delete null entries if the argument is an Array all the nested values
 * @param {object} obj
 */
const removeNulls = function _removeNulls(obj){
	if ( obj instanceof Array ) {
		obj = obj.filter((item) => {
			if ( item == null || item == undefined ) {
				return false;
			}
			return true;
		});

		obj = obj.map((item) => {
			if ( typeof item === 'object') {
				return removeNulls(item);
			} else {
				return item;
			}
		});
	} else {
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				if ( obj[key] == null || obj[key] == undefined ) {
					delete obj[key];
				} else if ( typeof obj[key] === 'object' ) {
					obj[key] = removeNulls(obj[key]);
				}
			}
		}
	}
	return obj;
}

module.exports = {
	removeNulls,
	toBitwiseArray
};
