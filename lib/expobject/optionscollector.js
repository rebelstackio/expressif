/* lib/expobject/optionscollector.js */
'use strict';

const EXP_OBJ_OPTIONS = require('./options.json').options;

 /**
	* Collect the target keys from the source object and return the rest of the properties as "props" property
	* Return the same object if the keys argument is invalid or empty array. By default use the options.json file as target key values
	* @param {object} source Target object to collect keys
	* @param {array}  targetkeys   Target values(key) to collect
	*/
const optionsCollector = (source, targetkeys=EXP_OBJ_OPTIONS) => {
	let result = {};
	const props = {};
	if ( targetkeys && targetkeys.length) {
		for (const key in source) {
			if (source.hasOwnProperty(key)) {
				const element = source[key];
				if ( targetkeys.indexOf(key) >= 0) {
					result[key] = element;
				} else {
					delete source[key]
					props[key] = element;
				}
			}
		}
	} else {
		result = source;
	}

	return Object.assign({}, result, Object.keys(props).length ? { props } : {});
}

module.exports = optionsCollector;
