# Expressif Server 

## Basic Configuration

```javascript
global.E = require('expressif');
// Set up the server
const server = new E.Server(
	{
		"port": process.env.PORT, 
		"routers": [
			{ "relpath": "routers" }
		]
	}
);
server.start();
```

## Default and availables configuration options

```json
{
	"case_sensitive_routing": true,
	"compression": false,
	"cors": false,
	"port": 80,
	"trust_proxy": true,
	"strict_routing": true,
	"method_override": true,
	"routers": [
		{
			"relpath": "routers"
		}
	],
	"statics": [],
	"templates": [],
	"socketfile": null,
	"bodyparser": {},
	"rateLimit": {}
}
```

- `case_sensitive_routing`: Enable case sensitivity. When enabled, "/Foo" and "/foo" are different routes. When disabled, "/Foo" and "/foo" are treated the same. By default is `true`. Only accepts `booleans`


- `compression`: 	Enable compression middleware that supports gzip and deflate. By default is `false`. Could be an object with compression's threshold like: 

	```json
	{
		"compression": {
			"threshold": 128
		}
	}
	```

	If compression is enable but the `threshold` is not specified the default value is `256`

- `cors`: Enable `CORS` in the server. By default is `false` but it can accepts objects with the cors configuration based on cors middleware: https://expressjs.com/en/resources/middleware/cors.html


- `port`: Target port for the https server. By default is `80`.

- `trust_proxy`: Set only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)

- `strict_routing`: Disabled by default(`false`), “/foo” and “/foo/” are treated the same by the router.

- `method_override`: Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it.

- `routers`: Define the locations of your custom routers. Should be a `object` with the `relpath` property and value should be the location of your routers folder. By default the router folder will be under `router` directory in the project root folder.

- `socketfile`: Define the socket file instead of HTTP server.

- `bodyparser`: Define the body parser options based on the express body parser middleware(https://www.npmjs.com/package/body-parser). Allows limit the body size

	```json
	"bodyparser": {
		"limit": "10mb", 
		"extended": true
	}
	```

- `rateLimit`: Define the rate limit for request to ALL the endpoints in the server. Is possible to set the rate limit per endpoint or router for more information check [routers]()

	```json
	"rateLimit": {
		"windowMs": 15 * 60 * 1000, // 15 minutes
		"max": 100 // limit each IP to
	}
	```
