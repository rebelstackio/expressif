# Expressif JSONValidator

## Getting Started

Set all your schemas under `schemas` folder in your working directory. Sub directories are allowed, Expressif will find all the nested schemas under your path.

### Change default path

Set in your Server creation the custom path for your schemas

```js
global.E = require('@rebelstack-io/expressif');
// Set up the server
const server = global.E.Server(
	{
		'port': process.env.PORT,
		'schemas': 'my_schemas',
		'wdir': __dirname
	},
);
```

In this case the schemas will loaded from `${WDIR}/my_schemas`.

### Add support for draft06 schemas

Expressif use [ajv](https://www.npmjs.com/package/ajv) package for JSON schemas. By default the current version supported on the schemas for `ajv` is draft-07. To set support for `draft-06` you must set the property in your server under the `schemas_options` property.

```js
global.E = require('@rebelstack-io/expressif');
// Set up the server
const server = global.E.Server(
	{
		'port': process.env.PORT,
		'wdir': __dirname,
		'schemas_options': {
			'draft06': true
		}
	},
);
```

### Valid Options for schemas_options

- `allErrors`. Allow to show all the errors related to a property for the schema and not only the first error. Default `true`

- `keepErrors`. keep original errors. Default is to remove matched errors (they will still be available in params.errors property of generated error). Default `true`

- `jsonPointers`.  set `dataPath` property of errors using JSON Pointers instead of JavaScript property access notation. Default `true`

- `draft06`. Add support for `draft-06` schemas. Default `false`

```js
{
	allErrors: true,
	keepErrors: false,
	jsonPointers: true,
	draft06: false
}
```

### Custom Error Messages

To set custom error message Expressif use [ajv-errors](https://github.com/epoberezkin/ajv-errors) package. You can set the error with a new property `errorMessage` in your json schema.

```js
var schema = {
	$id: "test1",
  type: 'object',
  required: ['foo'],
  properties: {
    foo: { type: 'integer' }
  },
  additionalProperties: false,
  errorMessage: {
    type: 'should be an object', // will not replace internal "type" error for the property "foo"
    required: 'should have property foo',
    additionalProperties: 'should not have properties other than foo'
  }
};
```

### Schema definition in the Expressif Router

To set the schema that you want you use to a specific Router you must set the `validreq` property with the schema `$id` that you want to use. If the schema does not have the id, you will get a `error` message.

```js
const Router = global.E.Router;
const HealthCheckRouter = function HealthCheckRouter ( defaultrouteroptions = {}, dependecies = {} ) {
	const routes = [
		{
			....
			method: 'get',
			path: '/',
			validreq: 'myschemaid'
			rxvalid: RX.NOT_ACCEPT_JSON | RX.NOT_APPLICATION_JSON,
			rprivs: [...],
			mwares: [..., mycontroller],
			....
		}
	];
	// Use the router options set at Server level. Could overwrite these value for a specific router
	return Router(routes, defaultrouteroptions, dependecies);
};
```

### Schema Template

Since version `3.x` or higher the JSONValidator middleware can validate the `req.query` and `req.params` properties. The schema **needs to follow** a combination of this template:

```json
{
	"$schema": "http://json-schema.org/draft-06/schema#",
	"properties": {
		"body": {
			// Validate the req.body
		},
		"params": {
			// Validate the req.params
		},
		"query": {
			// Validate the req.query
		}
	},
	"required": [ "body" ],
	"additionalProperties": false
}
```

__NOTE__ By combination means: `POST` requests does not have a `query` property so it can be removed from the schema.

__NOTE__ `req.query` and `req.params` are objects and their properties are always `strings` so be carefull with the conditions. Usually a `regex` will help with a complex condition


#### Sample Schema

```
GET /v1/test/:id/fake/:id2?test=[enum1|enum2]
```

```json
{
	"title": "schema test 1",
	"$schema": "http://json-schema.org/draft-06/schema#",
	"$id": "test2",
	"properties": {
		"params": {
			"type": "object",
			"properties": {
				"id":{
					"type": "string",
					"pattern": "^[1-9]\\d*$" // Use a regex for a custom validation
				},
				"id2":{
					"type": "string",
					"pattern": "^[1-9]\\d*$" // Use a regex for a custom validation
				}
			},
			"required": ["id", "id2"],
			"errorMessage": {
				"properties": {
					"id":  "Id1 should be a valid integer",
					"id2": "Id2 should be a valid integer"
				}
			}
		},
		"query": {
			"type": "object",
			"properties": {
				"test": {
					"type": "string",
					"enum": ["enum1", "enum2"]
				}
			},
			"errorMessage": {
				"properties": {
					"test":  "Should be equal to [enum1, enum2] only"
				}
			}
		}
	},
	"required": [ "params" ] // This is always required based on the GET request format
}
```

In the case of `id1` and `id2` is not possible to set up a `integer` validation so the solution is to use a regex. In future releases this problem may be solved. The `query` property is optional so it is not required but the params must be present always
