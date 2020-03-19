/* lib/logger/index.js */
'use strict';

const LOG4JS = require('log4js');

const DEFAULTS = require('./default.json');
const LoggerPrototypal = require('./base');

const LOGGER = ({ level = DEFAULTS.LOG_LEVEL, log4js = LOG4JS }) => {

	log4js.configure({
		appenders: {
			watchtowerstdout: {
				type: 'stdout',
			}
		},
		categories: { default: { appenders: ['watchtowerstdout'], level } }
	});

	// Create log4js instance
	var logger4js = log4js.getLogger();

	/**
	 * Change the level dinamically
	 * @param {string} level Allowed values are in [default.json]
	 */
	const setLevel = ( level ) => {
		if( DEFAULTS.ALLOWED_LEVELS.indexOf(level) < 0 ) {
			throw TypeError(`Invalid level ${level}.`);
		} else {
			logger4js.level = level;
		}
	};

	/**
	 * Get the current level set in log4js
	 */
	const getLevel = () => logger4js ? logger4js.level: null;

	/**
	 * Close the logger(log4js)
	 */
	const close = () => {
		return new Promise((resolve, reject) => {
			log4js.shutdown(( err ) => {
				if ( err ){
					reject(err);
				} else{
					resolve();
				}
			});
		});
	}

	// Return a wrapper based on LoggerPrototypal
	return Object.assign(
		Object.create(LoggerPrototypal),
		{
			engine: logger4js,
			close,
			setLevel,
			getLevel
		}
	);
};

module.exports = LOGGER;
