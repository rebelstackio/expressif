# Expressif Router v2

A new Router definition was added: `RouterV2`. Improves Router building with support for auto documented endpoints.

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
		rprivs: [1,3],
		mwares: [cc.controlerfunc1],
		rxvalid:RX.NOT_ACCEPT_JSON,
	},
	{
		method: 'put',
		path: '/:id',
		rprivs: [1,3],
		mwares: [cc.controlerfunc2],
		rxvalid:RX.NOT_ACCEPT_JSON,
	}
];
const expressRouterOptions = {};

return Router(routes, expressRouterOptions, auth, jsvalidator);
```
