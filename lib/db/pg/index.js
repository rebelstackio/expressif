/* lib/db/pg/index.js */

'use strict';
const { Pool } = require('pg');
const DCONFIG  = requre('./pgpool.default');
const { BasicLogger } = require('../../log');
// const PGProfiler = require('./pg-profiler');
// const UTIL = require('../../util');

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
			this.Logger = options.logger;
		} else {
			this.Logger = new BasicLogger();
		}

		// Merge default values with the user incoming values
		this.config = Object.assign( {}, DCONFIG, dbconfig);
		// Create the pool object
		this.pool = new Pool(this.config);

		// this.pool.on('error', function (error, client) {
		// 	this.Logger.error(error);
		// });
	}

	on(event, next) {
		return this.pool.on(event, next);
	}

	query(statement, params, next) {
		// let queryT = this.pool.query;
		// if (process.env.PGPROFILE && process.env.PGPROFILE != "false") {
		// 	// TODO: FIX PG PROFILE FOR CONTEXT ISSUE WITH PG POOL
		// 	let pgProfiler = new PGProfiler(this.pool.query, this.Logger);
		// 	queryT = pgProfiler.profile(this.pool);
		// 	return queryT(statement, params, next);
		// } else {
		this.pool.query(statement, params, next);
		// }
	}

	async aquery(statement, params) {
		// let pqueryT = this.pool.query;
		// if (process.env.PGPROFILE && process.env.PGPROFILE != "false") {
		// 	// TODO: FIX PG PROFILE FOR CONTEXT ISSUE WITH PG POOL
		// 	let pgProfiler = new PGProfiler(this.pool.query, this.Logger);
		// 	pqueryT = pgProfiler.profile(this.pool);
		// } else {
		return await this.pool.query(statement, params);
		// }
	};

	/**
	 * Async Close the pool connection
	 */
	async aclose() {
		await this.pool.end();
	}

	/**
	 * Close the pool connection
	 * @param {function} next callback
	 */
	close(next) {
		this.pool.end(next);
	}

}

module.exports = PGPool;
