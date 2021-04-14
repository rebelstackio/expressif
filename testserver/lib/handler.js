/* lib/handler.js*/
'use strict';
const RESPOND = global.E.Respond;

/**
 * Handle a generic error from Expressif, call the logger to display the error and additionals params set by the controller
 * @param {object} req Express request
 * @param {object} res  Express response
 * @param {object} error Expressif Error
 * @param {object} params Additional params to display in the logger
 */
const handleModelError = (req, res, error, params={}) => {
	switch(error.code) {
	case 307:
		global.LOGGER.warn(`${req.method} request for ${req.originalUrl} endpoint returned an error:`, error, params);
		break;
	default:
		global.LOGGER.error(`${req.method} request for ${req.originalUrl} endpoint returned an error:`, error, params);
	}
	return RESPOND.genericError(res, req, error);
};

module.exports = {
	handleModelError
};
