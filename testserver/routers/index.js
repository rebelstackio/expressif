/* routes/index.js */

function registerRouters( app , dependecies = {} ) {
	app.use( '/v1/healthcheck',     require('./healthcheck')(dependecies) );
	app.use( '/v2/healthcheck',   require('./healthcheck/v2')(dependecies) );
}

module.exports = registerRouters;

