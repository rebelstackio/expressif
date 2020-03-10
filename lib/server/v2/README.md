# Expressif Server V2

## Basic Usage

```javascript
// Expressif Server Lib
const { ServerV2 } = require('expressif');
// Additional middlewares i want in my server and i can configures as i want
const compression = require('compression');
const cors = require('cors');
const compression = require('body-parser');
// Set up the server
const server = ServerV2(
	{
		"socketfile": "/var/run/myapp/myapp.socket",
		"port": 8080, 
		"LOGGER": clogger,
		"routers": "custom_folder_for_routers"
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

```json
{
	"port": 80,
	"routers": "routers",
	"socketfile": null,
	"LOGGER": null
}
```

## Server Methods

### `start`

Start the server based on the `port` or `socketfile`.

### `close`

Stop the server
