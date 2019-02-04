# Expressif PgPool

## Getting Started

### Create a db connection

The first argument is the connection object but by default PgPool use the `process.env` enviorement variables to connect to the database (`PGHOST, PGDATABASE, PGUSER, PGHOST, PGPORT`)

```js
const PgPool = require('lib/db/pg');
const pg = new PgPool({}); // Use the env variables 
```

 Is possible to pass a custom connection object just like the following section:

```js
const PgPool = require('lib/db/pg');
const pg = new PgPool({
	host: 'localhost',
	user: 'postgres',
	database: 'testdb',
	password: 'devved',
	port: '5432'
});
```

### query method

Executes a query with a **callback**.

```js
pg.query(`select * from pgtest;`, [], (err, r) => {
	if ( err ) {
		console.error(err);
	} else {
		console.log('success', r);
	}
});
```

### aquery method

Executes a query with **async/await** mode.
```js
const f = async () => {
	const result = await pg.aquery(`select * from pgtest;`, []);
	console.log(result);
}

f();
```

### getStatus Method
Collect current information about the pool 
```js
const pg = new PgPool({
	host: 'localhost',
	user: 'postgres',
	database: 'testdb',
	password: 'devved',
	port: '5432'
}, null);

pg.query(`select * from pgtest;`, [], (err, r) => {
	console.log(err, r);
});

const r = pg.getStatus();

//r
{ idleCount: 4, totalCount: 5, waitingCount: 1 }
```

- *totalCount*: The total number of clients existing within the pool.

- *idleCount*:  The number of clients which are not checked out but are currently idle in the pool.

- *waitingCount*: The number of queued requests waiting on a client when all clients are checked out. It can be helpful to monitor this number to see if you need to adjust the size of the pool.

### close method

Close the pool with **callback**.

```js
pg.close( (err, r) => {
	if ( err ) {
		console.error(err);
	} else {
		console.log('success', r);
	}
});
```

### aclose method

Close the pool with **async/await** mode.
```js
const close = async () => {
	const result = await pg.aclose();
}
close();
```

### Profiler and Custom Logger

Is possible to profile the queries executed in the database with **PgPool**. Just enable the `PGPROFILE` enviorement variable.


By default PG Pool Class use a Basic Logger but is possible to set a new Logger in the second parameter.

```js
const pg = new PgPool({
	host: 'localhost',
	user: 'postgres',
	database: 'testdb',
	password: 'devved',
	port: '5432'
}, {
	logger: MyFancyLogger
});
```

__NOTE__ Profile results use the `trace` method. Make sure your logger support this method and has the correct level to show up the profile results.
