/* routes/index.js */

function registerRouters( app ) {
	app.use( '/v1/healthcheck',     require('./healthcheck')() );
	app.use( '/v2/healthcheck',   require('./healthcheck/v2')() );
}

module.exports = registerRouters;

