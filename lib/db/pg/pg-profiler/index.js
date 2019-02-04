/* lib/db/pg/pg-profiler/index.js */
'use strict';
/**
 * Class to profile queries in the backend. Could be really helpfully to debug and collect
 * info or show some info in an special application level or logger level( trace )
 */
class PGProfiler{

	constructor ( clientquery, logger ) {
		this.clientquery = clientquery;
		this.logger = logger;
	}

	/**
	 * Profile queries - await mode
	 * @param {*} statement
	 * @param {*} params
	 * @param {*} context
	 */
	async aprofile (statement, params, context) {
		const begin = Date.now();
		let result = await this.clientquery.apply(context, [statement, params]);
		const end = Date.now();
		const callTime = end - begin;
		if (this.logger) {
			this.logger.trace( { profiler:{ time:callTime, statement:statement, params:params } } )
		}
		return result;
	}

	/**
	 * Profile queries - callback mode
	 * @param {*} context
	 */
	profile ( context ) {
		let _self = this;
		let callCount = 0;
		let totalCalltime = 0;
		let slice = Array.prototype.slice;
		let timedFunc = function() {
			let args = slice.call(arguments);
			let stmt = args[0] || void 0, params = args[1] || void 0, cb = args[2] || void 0;
			let timedCb = function() {
				var end = Date.now();
				var callTime = end - begin;
				totalCalltime += callTime;
				callCount++;
				timedFunc.time = callTime;
				timedFunc.meanTime = totalCalltime / callCount;
				timedFunc.statement = stmt;
				timedFunc.params = params;
				if (_self.logger) {
					_self.logger.trace( { profiler:{ time:callTime, statement:stmt, params:params } } );
				}
				cb.apply(context, arguments);
			};
			let newargs = args.slice();
			newargs[2] = timedCb;
			let begin = Date.now();
			return _self.clientquery.apply(context, newargs);
		};
		return timedFunc;
	}
}

module.exports = PGProfiler;
