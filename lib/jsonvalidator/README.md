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
