/* index.js */
require('dotenv').config();

// const cors = require('cors');
// const bodyParser = require('body-parser');
// const methodOR  = require('method-override');

const Logger = require('./lib/logger');
const DB = require('../lib/db/pg');

global.E = require('../index');
// Set up logger based in the current environment
global.LOGGER = Logger({ level: process.env.LOG_LEVEL });
// Set up database
global.DB = new DB();
// Set up the server
const server = global.E.Server(
	{
		'port': process.env.PORT,
		// This is really important,
		'wdir': __dirname ,
		'schemas_options': {
			'allErrors': true
		}
	},
);

// Unhandled exceptions
process.on('uncaughtException', function (err) {
	global.LOGGER.error('Unexpected Error:', err);
	process.exit(1);
});

if (process.env.NODE_ENV !== 'testing') {
	// Graceful-shutdown only in production or staging
	process.on('SIGINT', () => {
		global.LOGGER.info('SIGINT signal received.');
		try {
			global.LOGGER.debug('Stopping server...');
			// Close server
			server.stop();
			// Check db connection and close it
			if (global.db) {
				global.LOGGER.debug('Closing database connection...');
				global.db.close();
			}
			process.exit(0);
		} catch (error) {
			global.LOGGER.error(error);
			process.exit(1);
		}
	});
}

server.start();
