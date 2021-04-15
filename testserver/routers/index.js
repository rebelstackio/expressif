/* routes/index.js */

/**
 * Main Router Sign
 * @param {object} app Express App
 * @param {object} routeroptions  Router Options set at Server Level. Can be overloaded
 * @param {object} dependecies Expressif dependecies
 */
function registerRouters( app, routeroptions, dependecies = {} ) {
	// Router healthcheck
	app.use( '/v1/healthcheck',   require('./healthcheck')(routeroptions, dependecies ) );
	// Router Product
	app.use( '/v1/products',   require('./products')(routeroptions, dependecies ) );
	// Router Users
	app.use( '/v1/users',   require('./users')(routeroptions, dependecies ) );
}

module.exports = registerRouters;

