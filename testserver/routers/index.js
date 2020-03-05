/* routes/index.js */

function registerRouters( app ) {
	app.use( '/healthcheck',     require('./healthcheck')(global.A) );
	// app.use( '/healthcheckv2',   require('./healthcheck/v2')(global.A) );

};

module.exports = registerRouters;

