# Expressif Model

A basic template for a custom model

```javascript

const { BadRequest }  = require('@rebelstack-io/expressif').Exception;

const DummyModel = function _DummyModel ( db = global.DB ) {
	this.db = db;
};

DummyModel.prototype.getdealeraccess = function _getdealeraccess(arg = null, next) {
	if ( !arg ) {
		process.nextTick(next, new BadRequest(`arg property is required`));
	}

	let stmt = `select my_func( $1 )`;
	let params = [ arg ];
	this.db.query( stmt, params, ( error, result ) => {
		return next(
			error,
			result ? result['rows'][0][`my_func`] : null
		);
	});
};

module.exports = DummyModel;

```
