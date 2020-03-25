# Expressif Router v2

A new Router definition was added: `RouterV2`. Improves Router building with support for auto documented endpoints.

## Availables Options

### method
The HTTP Verb, e.g `POST`, `PUT`...etc

### path
Router path. Could be `/` for the root path of the router and use the `:` character to set params in the URL that will become available in the controller
```json
{
	"path": "/users/:id" 
}
```

### auth
Set the type of auth validation. The possible values are: `public`, `simple`, `privileges` and `roles`

- `public`: Keep the endpoint public to the world
- `simple`: Validate just the request containe a JWT token in the Authorization headers
- `privileges`: Validate just the request containe a JWT token in the Authorization headers and it contains the `rprivs` and `dprvis` properties in the payload
- `roles`: Validate just the request containe a JWT token in the Authorization headers and it contains the `rroles` and `droles` properties in the payload

### validreq
### mwares

```javascript
// routers/sample/index.js
const JSONValidator = require('@rebelstack-io/expressif').JSONValidator;
const Router = require('@rebelstack-io/expressif').RouterV2;
const RX = require('@rebelstack-io/expressif').ReqValidator;
const cc = require('controllers/sample');

let ajv = new JSONValidator([schemas], { allErrors: true, jsonPointers: true });
const routes = [
	{
		method: 'get',
		path: '/',
		auth: { type: 'public' },
		mwares: [cc.controlerfunc1],
		rxvalid:RX.NOT_ACCEPT_JSON,
	},
	{
		method: 'put',
		path: '/:id',
		auth: { type: 'privileges', rprivs: [1, 3, 5] },
		mwares: [cc.controlerfunc2],
		rxvalid:RX.NOT_ACCEPT_JSON,
		validreq: 'schema2'
	},
	{
		method: 'put',
		path: '/:id',
		auth: { type: 'roles', rroles: ['user', 'admin'] },
		mwares: [cc.controlerfunc3],
		rxvalid:RX.NOT_ACCEPT_JSON,
		validreq: 'schema3'
	},
	{
		method: 'post',
		path: '/:id',
		auth: { type: 'simple' },
		mwares: [cc.controlerfunc4],
		rxvalid:RX.NOT_ACCEPT_JSON,
		validreq: 'schema4'
	}
];
const expressRouterOptions = {};

return Router(routes, expressRouterOptions, auth, jsvalidator);
```
