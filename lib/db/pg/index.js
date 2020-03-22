/* lib/db/pg/index.js */

'use strict';
const { Pool } = require('pg');
const DCONFIG  = require('./pgpool.default');
const { BasicLogger } = require('../../log');
const PGProfiler = require('./pg-profiler');

/**
 * Class to handle pg connections with pooling to improve performance
 * based on the node-postgres package(https://node-postgres.com/)
 */
class PGPool {

	/**
	 * Create the pool instance for pg database. By default the module pg use ENV variables to connect the database but
	 * is possible to pass a custom object with the connection properties
	 * @param {object} dbconfig Database custom configuration object { host, user, password, port ...etc }
	 * @param {object} dependecies Dependecies object { logger }
	 */
	constructor(dbconfig = {}, dependecies = {}) {
		// Set the loggers based in the dependencies or just create a new instance for BasicLogger
		if ( dependecies && dependecies.logger ) {
			this._logger = dependecies.logger;
		} else {
			this._logger = new BasicLogger();
		}

		// Merge default values with the user incoming values
		this._config = Object.assign( {}, DCONFIG, dbconfig);
		// Create the pool object
		this.pool = new Pool(this._config);

		/***** Handle common events *****/
		this.pool.on('error',  (error, client) => {
			this._logger.error(error, client);
			process.exit(1); // Whole app cannot continue working
		});

		this.pool.on('connect', ( client ) => {
			this._logger.trace(`New client connected`, client);
		});

		this.pool.on('remove', ( client ) => {
			this._logger.trace(`CLient removed`, client);
		});
	}

	/**
	 * Delegate the events one upper level
	 * @param {string} event Eventname
	 * @param {function} next Callback function
	 */
	on(event, next) {
		return this.pool.on(event, next);
	}


	/**
	 * Return function error or Client instance with release() function
	 * @param {function} next Callback function
	 */
	connect(next) {
		return this.pool.connect(next);
	}


	/**
	 * Async return function error or Client instance with release() function
	 */
	async aconnect() {
		return await this.pool.connect();
	}


	/**
	 * Send queries to the pool
	 * @param {string}   statement Query stament
	 * @param {array}    params Array of parameters to the query
	 * @param {function} next Callback function
	 */
	query(statement, params = [], next) {
		if ( process.env.PGPROFILE ) {
			const pgProfiler = new PGProfiler(this.pool.query, this._logger);
			const queryT = pgProfiler.profile(this.pool);
			return queryT(statement, params, next);
		} else {
			return this.pool.query(statement, params, next);
		}
	}

	/**
	 * Async version to send queries to the pool
	 * @param {*} statement Query stament
	 * @param {*} params Array of parameters to the query
	 */
	async aquery(statement, params) {
		if ( process.env.PGPROFILE ) {
			let pgProfiler = new PGProfiler(this.pool.query, this._logger);
			return await pgProfiler.aprofile(statement, params, this.pool);
		} else {
			return await this.pool.query(statement, params);
		}
	}

	/**
	 * Get some metrics about the pool
	 */
	getStatus() {
		return {
			idleCount:    this.pool.idleCount,   // The number of clients which are not checked out but are currently idle in the pool.
			totalCount:   this.pool.totalCount,  // The total number of clients existing within the pool.
			waitingCount: this.pool.waitingCount // The number of queued requests waiting on a client when all clients are checked out.
		};
	}

	/**
	 * Async Close the pool connection
	 */
	async aclose() {
		await this.pool.end();
	}

	/**
	 * Close the pool connection
	 * @param {function} next Callback function
	 */
	close(next) {
		this.pool.end(next);
	}

}

module.exports = PGPool;
