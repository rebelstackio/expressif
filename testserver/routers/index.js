/* routes/index.js */

/**
 * Main Router Sign
 * @param {object} app Express APp
 * @param {object} routeroptions  Router Options set at Server Level. Can be overloaded
 * @param {object} dependecies Expressif dependecies
 */
function registerRouters( app, routeroptions, dependecies = {} ) {
	// Router v1
	app.use( '/v1/healthcheck',   require('./healthcheck')(dependecies) );
	// Router v2
	app.use( '/v2/healthcheck',   require('./healthcheck/v2')(routeroptions, dependecies ) );
}

module.exports = registerRouters;

