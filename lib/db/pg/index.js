/* lib/db/pg/index.js */
'use strict';

const pg = require('pg');
const {Pool} = pg;
const PGProfiler = require('./pg-profiler');
const ecodes = require('./errcodes');

class PGPool {
	constructor ( options, config ) {
		if ( options ) {
			this.Logger = options.logger || new UTIL.ConsoleLogger();
		} else {
			this.Logger = new UTIL.ConsoleLogger();
		}
		this.config = config || { max:10, idleTimeoutMillis: 10000 };
		this.pool = new Pool(this.config);
		this.pool.on('error', function( error, client ) {
			this.Logger.error(error);
		})
	}
	static get errcodes () {
		return ecodes;
	}
	on ( event, next ) {
		return this.pool.on( event, next );
	}
	query ( statement, params, next ) {
		let queryT = this.pool.query;
		if ( process.env.PGPROFILE &&  process.env.PGPROFILE != "false" ) {
			let pgProfiler = new PGProfiler(this.pool.query, this.Logger);
			queryT = pgProfiler.profile(this.pool);
		}
		return queryT( statement, params, next );		
	}
	async aquery ( statement, params ) {
		let pqueryT = this.pool.query;
		if ( process.env.PGPROFILE &&  process.env.PGPROFILE != "false" ) {
			let pgProfiler = new PGProfiler(this.pool.query, this.Logger);
			pqueryT = pgProfiler.profile(this.pool);
		}
		return await pqueryT( statement, params );
	};
}

module.exports = PGPool;
