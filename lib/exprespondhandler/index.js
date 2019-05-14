/**
 * Generic Respond for ExpError.
 * Any model that respond with an ExpError error in the callback can use this respond method
 * to use only generic and common method
 * @param {expressResponse} response
 * @param {expressRequest} request
 * @param {ExpError} expError
 */
const RespondExpError = function _RespondExpError(response, request, expError) {
	let statusCode = 500;
	let responseData = {};
	let resJSON = {};
	const options = {};

	if (expError) {
		statusCode = expError.httpstatus || statusCode;
		options.type = expError.type;
		responseData = expError;
		resJSON = buildResponse(responseData, options);
		if ( expError.hasAdditionalHeaders ) {
			const keys = Object.keys(expError.adheaders);
			keys.forEach(hkey => {
				response.set(hkey, expError.adheaders[hkey]);
			});
		}
	} else {
		options.type = 'UnexpectedError';
		responseData.message = 'Unexpected Error';
		options.passthrough = buildPassthroughObj(request);
		resJSON = buildResponse(responseData, options);
	}

	response.set('Content-Type', 'application/json');
	return response.status(statusCode).send(JSON.stringify(resJSON));
}

module.exports = {
	RespondExpError
}
