/* lib/db/pg/pg-profiler/index.js */
'use strict';

class PGProfiler{

	constructor ( clientquery, logger ) {
		this.clientquery = clientquery;
		this.logger = logger;
	}

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
					_self.logger.info( { profiler:{ time:callTime, statement:stmt, params:params } } )
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

/*
exports.profile = function(clientquery, context) {
	context = context || this;
	let callCount = 0;
	let totalCalltime = 0;
	let slice = Array.prototype.slice;
	let timedFunc = function() {
		let args = slice.call(arguments);
		let stmt = args[0] || void 0, params = args[1] || void 0, cb = args[2] || void 0;
		let timedCb = function() {
			let _self = this;
			var end = Date.now();
			var callTime = end - begin;
			totalCalltime += callTime;
			callCount++;
			timedFunc.time = callTime;
			timedFunc.meanTime = totalCalltime / callCount;
			timedFunc.statement = stmt;
			timedFunc.params = params;
			cb.apply(context, arguments);
		};
		let newargs = args.slice();
		newargs[2] = timedCb;
		let begin = Date.now();
		return clientquery.apply(context, newargs);
	};
	return timedFunc;
};
*/
