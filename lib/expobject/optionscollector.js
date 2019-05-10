/* lib/expobject/optionscollector.js */
'use strict';

/**
 *
 * @param {*} source
 */
const optionsCollector  = (source, keys) => {
	const result = {};
	const props = {};
	if ( keys ) {
		for (const key in source) {
			if (source.hasOwnProperty(key)) {
				const element = source[key];
				if ( keys.indexOf(key) >= 0) {
					result[key] = element;
				} else {
					delete source[key]
					props[key] = element;
				}
			}
		}
	}
	return Object.assign({}, result, { props });
}

module.exports = optionsCollector;
