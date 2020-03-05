/* controllers/healthcheck/index.js */
'use strict';
const RESPOND = global.E.Respond;

function getHealthCheck ( req, res ) {
	LOGGER.info(`GET request for ${req.originalUrl} endpoint requested `);
	const data = {
		uptime: process.uptime(),
		message: 'OK',
		timestamp: Date.now()
	};
	let wrapper = RESPOND.wrapSuccessData( data, path );
	return RESPOND.success( res, req, wrapper );
}

module.exports = { getHealthCheck };
