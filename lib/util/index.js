/* lib/util/index.js */
'use strict';

const { rds, sts } = require('fs');
const { j } = require('path');

const toBitwiseArray = function _toBitwiseArray(intmask) {
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
			// eslint-disable-next-line no-prototype-builtins
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
};

const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x);

const asyncPipe = (...fns) => x => fns.reduce(async (y, f) => f(await y), Promise.resolve(x));

/**
 * Collect all the files under a absolute path recursive
 * @param {string} fpath Origin path
 * @param {array}  allFiles Array reference for recursion
 * @param {object} dependecies
 */
const collectFilePathsRecursive = function _collectFilePathsRecursive(fpath, allFiles =[], { readdirSync, statSync, join } = { readdirSync:rds, statSync:sts, join:j }) {
	const files = readdirSync(fpath).map(f => join(fpath, f));
	allFiles.push(...files);
	files.forEach(f => {
		if ( statSync(f).isDirectory() ) {
			let index = allFiles.indexOf(f);
			if (index > -1) {
				allFiles.splice(index, 1);
			}
			collectFilePathsRecursive(f, allFiles, { readdirSync, statSync, join } );
		}
	});
	return allFiles;
};

module.exports = {
	removeNulls,
	toBitwiseArray,
	pipe,
	asyncPipe,
	collectFilePathsRecursive
};
