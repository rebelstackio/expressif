/* lib/middlewares/reqvalidator/index.js */
'use strict';

const RX = require('../../reqvalidator');
const ERROR = require('../../exception');
const RESPOND = require('../../respond');
const toBitwiseArray = require('../../util').toBitwiseArray;

/**
 * Request Validator Middleware. Recieve a integer with
 * the agregate value of all the request validators assigned
 * @param {integer} rex
 */
const reqvalidatormw = function _reqvalidatormw(rex) {
	const rxdef = RX.REQUEST_EXCEPTION_DEFINITONS;
	return function validateReq(request, response, next) {
		const arrRX = toBitwiseArray(rex);
		for (const rx of arrRX) {
			const key = RX.getKey(rx);
			let conditionresult = false;
			if (rxdef[key] && rxdef[key].condition) {
				conditionresult = eval(rxdef[key].condition);
			}
			if (conditionresult) {
				const err = new ERROR[rxdef[key].type](rxdef[key].message, rxdef[key].code);
				return RESPOND.invalidRequest(response, request, err);
			}
		}
		return next();
	};
};

module.exports = reqvalidatormw;
