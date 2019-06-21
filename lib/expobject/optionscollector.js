/* lib/expobject/optionscollector.js */
'use strict';

const EXP_OBJ_OPTIONS = require('./options.json').options;

 /**
	* Collect the target keys from the source object and return the rest of the properties as "props" property
	* Return the same object if the keys argument is invalid or empty array. By default use the options.json file as target key values
	* @param {object} source Target object to collect keys
	* @param {array}  targetkeys   Target values(key) to collect
	*/
const optionsCollector = (orsource, targetkeys=EXP_OBJ_OPTIONS) => {
	// Make a copy to avoid lose the reference in other places
	const source = Object.assign({}, orsource);
	let result = {};
	const props = {};
	if ( targetkeys && targetkeys.length) {
		for (const key in source) {
			if (source.hasOwnProperty(key)) {
				const element = source[key];
				if ( targetkeys.indexOf(key) >= 0) {
					// Add the target key to the result
					result[key] = element;
				} else {
					// Otherwise delete it from the source and add it into the props bag
					delete source[key]
					props[key] = element;
				}
			}
		}
	} else {
		result = source;
	}

	return Object.assign({}, result, Object.keys(props).length ? { props } : { props: {} });
}

module.exports = optionsCollector;
