# Expressif JSONValidator

## Getting Started

### Create a instance 

```js
const schema1 = require('schemas/schema1.json');
const schema1 = require('schemas/schema2.json');
const schemas = [schema1, schema2];
const jv = new JSONValidator(
	schemas, // An array of all the json schemas to load. They must have the $id reference
	options // JSONValidator options
);
```

__NOTE:__ The schemas should be sorted to void problems with the ```$ref``` stament and import another schemas components without errors


### Valid Options

```js
{
	allErrors: true, // Display all the errors instead of just stop the validation at the first error
	meta: require('ajv/lib/refs/json-schema-draft-06.json') // Default meta schema for all the custom schemas
	keepErrors: false // Do not put the original error messages in the response object and use the new error messages specified by ajv-errors
}
```

### Custom Error Messages

To set custom error message this class use [ajv-errors](https://github.com/epoberezkin/ajv-errors) package. You can set the error with a new property `errorMessage``in your json schema.

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

### Attaching the JSONValidator instance

To attach the jsonvalidator instance to a router and validate the incoming requests to the target router you have to pass the jsonvalidator instance as thrid argument in your Router creation.

```js
const expressifjv = new JSONValidator(
	[ schema1 ],
	{ allErrors: true }
);
const routes = [
	{
		method: 'post', path: '/test1', rprivs: [1, 3], mwares: [cc.test1get],
		rxvalid: RX.NOT_ACCEPT_JSON,
		validreq: schema1id, // JSON schema id to validate this route. This id should be present in the schemas loaded in the JsonValidator creation
	},
];
const router = new Router({}, expressifauth, expressifjv);
```

### JSONValidator Middlewares

__NOTE__ **Breaking Change**

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
