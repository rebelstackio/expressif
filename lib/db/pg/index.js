/* lib/db/pg/index.js */
'use strict';

const pg = require('pg');
const { Pool } = pg;
const PGProfiler = require('./pg-profiler');
const ecodes = require('./errcodes');
const UTIL = require('../../util');

class PGPool {
	constructor(options, config) {
		if (options) {
			this.Logger = options.logger || new UTIL.ConsoleLogger();
		} else {
			this.Logger = new UTIL.ConsoleLogger();
		}
		this.config = config || { max: 10, idleTimeoutMillis: 10000 };
		this.pool = new Pool(this.config);
		this.pool.on('error', function (error, client) {
			this.Logger.error(error);
		})
	}
	static get errcodes() {
		return ecodes;
	}
	on(event, next) {
		return this.pool.on(event, next);
	}
	query(statement, params, next) {
		let queryT = this.pool.query;
		if (process.env.PGPROFILE && process.env.PGPROFILE != "false") {
			// TODO: FIX PG PROFILE FOR CONTEXT ISSUE WITH PG POOL
			let pgProfiler = new PGProfiler(this.pool.query, this.Logger);
			queryT = pgProfiler.profile(this.pool);
			return queryT(statement, params, next);
		} else {
			this.pool.query(statement, params, next); 4
		}
	}
	async aquery(statement, params) {
		let pqueryT = this.pool.query;
		if (process.env.PGPROFILE && process.env.PGPROFILE != "false") {
			// TODO: FIX PG PROFILE FOR CONTEXT ISSUE WITH PG POOL
			let pgProfiler = new PGProfiler(this.pool.query, this.Logger);
			pqueryT = pgProfiler.profile(this.pool);
		} else {
			return await this.pool.query(statement, params);
		}
	};

	close() {
		this.Logger.info('Closing pool connection');
		this.pool.end()
	}
}

module.exports = PGPool;
