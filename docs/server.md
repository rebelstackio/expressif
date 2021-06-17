# Expressif Server V2

## Basic Usage

```javascript
const cors = require('cors');
const helmet = require('helmet');
// Expressif Server Lib
const { Server} = require('expressif');
// Additional middlewares i want in my server and i can configures as i want
const compression = require('compression');
const cors = require('cors');
const compression = require('body-parser');
// Set up the server
const server = ServerV2(
	{
		"socketfile": "/var/run/myapp/myapp.socket",
		"port": 8080,
		"routers": "custom_folder_for_routers",
		"schemas": "custom_folder_for_schemas",
		"middlewares:" [
			cors(),
			helmet()
		]
	}
);
// Enable midleware or custrom express properties here before start the serer
server.configureapp((app) => {
	app.disable('x-powered-by');
	app.set('trust proxy', 'loopback');
	app.set('etag', function (body, encoding) {
		return generateHash(body, encoding) // consider the function is defined
	});
	app.use(cors({
		// Allow to continue with options endpoints
		preflightContinue: true
	}));
	app.use(bodyParser.json());
	app.use(compression({ threshold: 256 }));
});
// Start the server
server.start();
// Close the server
server.close();
```

## Server Available's Properties

- `host` : Host. Default to `0.0.0.0`.
- `port` : HTTP Port. Default 80.
- `router` : Directory where the routers will be loaded. Default to `routers`.
- `router_options`: Express Router Options. By default empty. For more information check [Express Router Options](https://expressjs.com/es/api.html#express.router)
- `socketfile` : When it is a valid string for a socket file, the server will be started on the socket. Default `null`.
- `schemas` : Directory where the schemas will be loaded. Default to `schemas`.
- `schemas_options`: AJV Options. By default ```{ "allErrors": true, "keepErrors": false } ```. For more information check [ AJV Options](https://github.com/epoberezkin/ajv#options).
- `middlewares`: Array of middlewares function apply at global level. Default to `[]`.

### Sample:

```javascript
	{
		"port": 80,
		"routers": "routers",
		"router_options": {

		},
		"socketfile": null,
		"schemas": "schemas",
		"schemas_options": {
			"allErrors": true,
			"keepErrors": false
		},
		"middlewares:" [
			cors(),
			helmet()
		]
	}
```

## Server Methods

### `start`

Start the server based on the `host` and `port` or `socketfile`.

### `close`

Stop the server.

## Links

[<< Expressif](README.md) | Expressif Server | [Expressif Router >>](router.md)
