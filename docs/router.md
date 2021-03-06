# Expressif Router

Improves Router building with support for auto documented endpoints.

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
- `privileges`: Validate just the request containe a JWT token in the Authorization headers and it contains the `privileges` property in the payload
- `roles`: Validate just the request containe a JWT token in the Authorization headers and it contains the `roles` property in the payload

### rxvalid

Check [Expressif Request Validators](rxvalid.md)

### validreq

Check [Expressif JSON Validators](jsonvalidator.md)

### mwares

Custom function middlewares applied from left to right.

__NOTE__ The last one should be your "controller" function or a function that respnse back to the client.

## Router Sample

Router File:

```javascript
// routers/sample/index.js
const Router = require('@rebelstack-io/expressif').Router;
const RX = require('@rebelstack-io/expressif').ReqValidator;
const cc = require('controllers/sample');

const routes = [
	{
		method: 'get',
		path: '/',
		auth: { type: 'public' },
		mwares: [cc.controlerfunc1],
		rxvalid:  RX.NOT_ACCEPT_JSON
	},
	{
		method: 'put',
		path: '/:id',
		auth: { type: 'privileges', rprivs: [1, 3, 5] },
		mwares: [ cc.controlerfunc2],
		rxvalid: RX.NOT_ACCEPT_JSON | RX.NOT_APPLICATION_JSON,
		validreq: 'schema2'
	},
	{
		method: 'put',
		path: '/:id',
		auth: { type: 'roles', rroles: ['user', 'admin'] },
		mwares: [cc.controlerfunc3],
		rxvalid: RX.NOT_ACCEPT_JSON | RX.NOT_APPLICATION_JSON,
		validreq: 'schema3'
	},
	{
		method: 'post',
		path: '/:id',
		auth: { type: 'simple' },
		mwares: [cc.controlerfunc4],
		rxvalid: RX.NOT_ACCEPT_JSON | RX.NOT_APPLICATION_JSON,
		validreq: 'schema4'
	}
];
const expressRouterOptions = {}; // Express router custom options

return  new Router(routes, expressRouterOptions );
```

## Links

[<< Expressif Server](server.md) | Expressif Router | [Expressif Controller >>](controller.md)
