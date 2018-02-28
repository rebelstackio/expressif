# At your Express service
ayEs is a wrapper for the node [Express framework](https://expressjs.com/en/guide/routing.html) that adds some opinions as to how to structure simple web services on an api server. The request flow goes through `authorize` -> `validate request structure` -> `validate request parameters` -> `controller middleware` -> `response`. 

![Service Request Flow](./docs/img/ServiceRequestFlow.svg)

Each stage is supported by library functions with the aim to standardise how service requests are validated and responded to.

* __Authorization__ is handled using [`JWT`](https://jwt.io/) and supports adding additional middleware to handle, for example, roles and/or permissions.

* __Validation__ of request structure will check the headers and session state of the request and the requesting user and return errors appropriately on any failed validation. 

* __Validation__ of request parameters is handled using [JSON schemes](https://spacetelescope.github.io/understanding-json-schema/). If required these are provided as part of the endpoint specification and passed to the route builder as part of a route configuration.

* __Controller middleware__ is an array of functions that make use of the ayES libraries for errors and responses, in order to standardize all service responses.

* __Response__ is handled by a set of library functions that wrap all responses in a standard format and apply custom headers and response strategies. Again, the intention here is one of standardisation.

## Using ayEs
```js
const ayEs = require('ayes');
/**
 * Get a reference to the ayEs router helper lib
*/
const Router = ayEs.router;

/**
 * Create a simple express middleware function to deal with login requests.
 * PLEASE NOTE: This is not a recommended login strategy for production sites.
*/
const loginController = function loginController(req, res) {
	const { username, password } = req.body;
	if (password) {
		const response = {
			id: Math.floor(Math.random() * 6) + 1,
			username
		};
		res.status(200).send(response);
	}
};
/**
 * The buildRouter helper function takes a configuration object with an 
 * array of route definitions.
*/
const arouterdata = {
	routes: [
		{
			method: 'post',
			path: '/login',
			mwares: loginController
		}
	]
};
/**
 * Call the Router#buidRouter function returns an express router with routes 
 * for each configuration in the routes array.
*/
const authRouter = Router.buildRouter(arouterdata);
```

Okay, but so far this is just a wrapper for the `Express#Router`. It gives us a nice clean format for router definitions, easy to read and reason about. Now let's add more support for the [request flow](#at-your-express-service) outlined above.
### Auth
#### ayEs#auth(String jwtsecret, Object options) -> Object ayEs#Auth
Returns an `ayEs#Auth` instances that can be used in the creation of service endpoints to handle endpoint authorization by JWT.

### Error
A set of custom error objects for use in controller middleware to standadize error responses.
* Error#BadRequestError 
* Error#NotFoundError
* Error#BadHeaderError
* Error#AuthError
* Error#ForbiddenError
* Error#UnauthorizedError
* Error#UnavailableRetryError
* Error#ConflictError
* Error#DataBaseReturnError
* Error#JSONValidationError
* Error#DataBaseError
* Error#ServerError
* Error#FBError
* Error#AWSError


### JSONValidator
A wrapper for the [AJV](https://github.com/epoberezkin/ajv) JSON schema validation library used to validate request parameters.

The idea here is to create an instance of the `ayEs#JSONValidator` and register a set of JSON schema that can be used in route configuration. So, given a JSON schema for validating login parameters with an `$id` property of `postloginin`, such as 
```js 
const authReqSchema = {
	$schema: 'http://json-schema.org/draft-06/schema#',
	$id: 'postloginin',
	title: 'Login Object',
	type: 'object',
	properties: {
		email: {
			title: 'user email',
			type: 'string',
			format: 'email'
		},
		username: {
			title: 'username',
			type: 'string'
		},
		password: {
			title: 'user password',
			type: 'string',
			minLength: 5,
			maxLength: 400
		}
	},
	required: ['username', 'password']
};
```
we can instantiate the validator either by passing the schema to the constructor
```js
const JSONValidator = ayEs.jsonvalidator;
const jv = new JSONValidator(authReqSchema);
```
or using the `JSONValidator#addSchema` instance function
```js
const JSONValidator = ayEs.jsonvalidator;
const jv = new JSONValidator();
jv.addSchema(authReqSchema);
```

Now, this instance can be assigned to the [`Router#options#jsonv`](#options) property and the registered schema can be referenced in a route configuration as `validreq: 'postloginin'`
```js
{
	jsonv: jv,
	routes: [
		{
			method: 'post',
			path: '/login',
			mwares: loginController,
			validreq: 'postloginin' // Reference the schema here
		}
	]
}
```
The router library will now add a validation middleware for request paramaters usign the schema indicated, Any failure against the schema is wrapped in a [`Error#JSONValidationError`](#errors) and reported back to the client using [`Respond#invalidRequest`](#invalidRequest).

### Respond
A wrapper lib for the [`Express#res.send`](https://expressjs.com/en/4x/api.html#res.send) function. All responses are standardised.
#### wrapSuccessData
#### invalidRequest
#### unavailableRetry
#### notAuthorized
#### forbidden
#### notFound
#### serverError
#### notImplemented
#### success
#### redirect

### Reqvalidator
A peculiar beast used for validating request formats. TODO.

### Router
#### Router#buildRouter(Object options) -> Express#Router
Build an Express Router instance containing endpoints for each of the routes configured in the `options.routes`
##### options
* _addOptionsRoute_: Boolean flag to indicate whether to add an `options` endpoint that returns a documentation JSON as described [here](#self-documenting-endpoints). Defaults to `false`.
* _auth_: This options takes an instance of [ayEs#Auth](#Auth).If present at this level the authentication middleware will be added to all endpoints configured in the `routes` array.
* _jsonv_: This option takes an instance of the [ayEs#JSONValidator](#JSONValidator). If present, route configurations (in the routes option array) can indicate a json schema registered with the validator to use to validate request parameters.
* _routes_: An array of endpoint configuration objects. Each object in the array will be used to build and add one endpoint to the returned `Express#Router`. Route configuration options are:
	* _auth_: an instance of [ayEs#Auth](#Auth).If present at this level the authentication middleware will be added to only the endpoints configured in this route config. Clearly this will be overidden by any `Auth` instance in the `options.auth` option (which applies to all routes). If only some routes are required to be authenticated, or ypu wish to use a different authentication instance for any route, no `options.auth` option should be declared and the `auth` options set at the route configuration level for all authenticated routes.
	* _method_: The [HTTP method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) for this endpoint.
	* _mwares_: An array of express middleware functions (or single function) for this endpoint. These middleware functions will be added to the router AFTER any authentication and validation middlewares that are generated by the `Auth` and/or `JSONValidator` instances in the `auth` or `jsonv` options.
	* _path_: The path for this endpoint. This can be any string excepted as an express route path (see [here](https://expressjs.com/en/guide/routing.html#route-paths))
	* _rxvalid_: A list of request validation requirements. __TODO__ Refactor this interface.
	* _validreq_: A string identifier for a JSON schema registered with the `ayEs#JSONValidator` instance set as the `options.jsonv` option. The schema will be used to validate the request parameters to this endpoint. See [JSONValidator](#JSONValidator) for more details.
	* _validres_: A string identifier for a JSON schema registered with the `ayEs#JSONValidator` instance set as the `options.jsonv` option. This is currently only used when [generating the documentation JSON](#self-documenting-endpoints) for the `OPTIONS` route. See [JSONValidator](#JSONValidator) for more details.

### Self documenting endpoints
```json
{
	"data": {
		"/login": [{
			"verb": "post",
			"validations": {
				"headers": {
					"Accept": "application/json",
					"Content-Type": "application/json"
				}
			},
			"body_schema": {
				"$schema": "http://json-schema.org/draft-06/schema#",
				"$id": "postloginin",
				"title": "Login Object",
				"type": "object",
				"properties": {
					"email": {
						"title": "user email",
						"type": "string",
						"format": "email"
					},
					"username": {
						"title": "username",
						"type": "string"
					},
					"password": {
						"title": "user password",
						"type": "string",
						"minLength": 5,
						"maxLength": 400
					}
				},
				"required": ["username", "password"]
			},
			"response": {
				"$schema": "http://json-schema.org/draft-06/schema#",
				"$id": "postloginout",
				"title": "Login Object",
				"type": "object",
				"properties": {
					"id": {
						"title": "user id",
						"type": "string"
					},
					"username": {
						"title": "username",
						"type": "string"
					},
					"role": {
						"title": "user role",
						"type": "number"
					}
				},
				"required": ["id", "username", "role"]
			}
		}]
	},
	"path": "/"
}
```