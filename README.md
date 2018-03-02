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
 * Call the Router#buildRouter function returns an express router with routes 
 * for each configuration in the routes array.
*/
const authRouter = Router.buildRouter(arouterdata);
```

Okay, but so far this is just a wrapper for the `Express#Router`. It gives us a nice clean format for router definitions, easy to read and reason about. Now let's add more support for the [request flow](#at-your-express-service) outlined above.

## Auth
ayEs provides an implementation of authentication by [JWT](https://jwt.io/) through the `Auth` lib. If an endpoint or a set of endpoints grouped into a router instance requires authentication, create and instance of the `ayEs#Auth` handler and pass it to the route configuration.
```js
const ayEs = require('ayes');
const Auth = ayes.Auth;
const auth = new Auth(process.env.JWT_SECRET);
// Or use the factory function
const auth = ayEs.returnAuthInstance(process.env.JWT_SECRET);
const routerOptions = {
    routes: [
        {
            auth: auth, //Pass the auth instance here to authenticate just the /me endpoint.
            method: 'post',
            path: '/me',
            mwares: getMe //A controller function
        }, ...
    ]
}
```
If all routes for a particular router require authentication, simply pass the auth instance on the `options.auth` property of the router configuration instead.
```js
const routerOptions = {
    auth: auth, //Pass the auth instance here to authenticate all routes by JWT.
    routes: [
        {
            method: 'post',
            path: '/me',
            mwares: getMe //A controller function
        }, 
        {
            method: 'put',
            path: '/some/other/authenticated/route',
            mwares: anotherController
        }
    ]
}
```

Request to endpoints configured with the `ayEs#Auth` lib must send in an `Authorization: Bearer <jwt>` header with a valid JWT to access the service.

The lib adds an express middleware function to the route that will handle JWT validation for authentication. This middleware decodes the JWT present in the request's `Authorization` header, returning errors on failed validation. If the JWT is present and valid, the JWT payload is added to the express request object as the `dtoken` property, so you can access it inside any subsequent middleware.

```js
/**
 * With a JWT payload of 
 * {
 *    "exp": "2018-03-01T04:49:49.781Z",
 *     "user": {
 *         "id": "596dcd99dd19f9227f5a94b1",
 *         "username": "nectarsoft"
 *     }
 * }
*/
function (req, res) {
    const username = req.dtoken.user.username;
    console.log(username) // nectarsoft
}
```

### Auth API
#### new ayEs#Auth(String jwtsecret, Object options)  -> Object ayEs#auth
Create `ayEs#Auth` instance.

__options__

* _logger_: A custom logger for the instance to use.

#### Auth#decodeJWT(String jwt, String jwtsecret) -> Object
Decodes the given `jwt` string and returns the jwt payload as an object. Throws an error if `jwt` is not valid.

#### Auth#decodeErr(Object) -> Object ayEs#Error
Helper function that take the error object returned by `Auth#decodeJWT` and parses it to a custom [`ayEs#Error#AuthError`](#new-errorautherrorstring-message-string-code---object) type with relevant error code and message.

#### Auth#encodeJWT(Object payload, String jwtsecret) -> String
Returns a JWT string with `payload`, signed with the given secret key `jwtsecret`.

#### ayEs#returnAuthInstance(String jwtsecret, Object options) -> Object ayEs#auth
Helper factory function that returns an `ayEs#Auth` instances.

#### ayEs#auth#generateAuthMiddleWare() -> Function<Object, Object, Function>
Returns the auth middleware function. 

This is exposed so that you can add additional authentication middleware if required.

```js
const authMiddleware = [];
authMiddleware.push(auth.generateAuthMiddleWare());
authMiddleware.push(someOtherAuthFunction);
const routerOptions = {
    auth: auth, // auth property can be an array of functions.
    routes: [ ... ]
}
```

## Error
A set of custom error objects for use in controller middleware to standardise error responses.

All `Error` constructors accept a code parameter that can be used to pass in a code string as a non-verbose mechanism to give more specific detail about an error (see [error codes](#errorcodes)).

ayEs error objects are intended for use along side the [response](#response) library to form a standard error response to api request.

### Error API

#### new Error#BadRequestError(String message, String code) -> Object
Returns an `BadRequestError` instance with properties 
```js
    error.message = message;
    error.code = code;
    error.httpstatus = 400;
```

#### new Error#NotFoundError(String message, String code) -> Object
Returns an `NotFoundError` instance with properties 
```js
    error.message = message;
    error.code = code;
    error.httpstatus = 404;
```
#### new Error#BadHeaderError(String message, String code) -> Object
Returns an `BadHeaderError` instance with properties 
```js
    error.message = message;
    error.code = code;
    error.httpstatus = 400;
```
#### new Error#AuthError(String message, String code) -> Object
Returns an `AuthError` instance with properties 
```js
    error.message = message;
    error.code = code;
    error.httpstatus = 401;
```

This is intended for authentication errors, not authorisation errors (see [Error#ForbiddenError](#new-errorforbiddenerrorstring-message-string-code---object))

#### new Error#ForbiddenError(String message, String code) -> Object
Returns an `ForbiddenError` instance with properties 
```js
    error.message = message;
    error.code = code;
    error.httpstatus = 403;
```

#### new Error#UnauthorizedError(String message, String code) -> Object
Returns an `UnauthorizedError` instance with properties 
```js
    error.message = message;
    error.code = code;
    error.httpstatus = 401;
```
This is intended for authentication errors, not authorisation errors (see [Error#ForbiddenError](#new-errorforbiddenerrorstring-message-string-code---object))

#### new Error#UnavailableRetryError(String message, String code, String retryafter) -> Object
Returns an `UnavailableRetryError` instance with properties 
```js
    error.message = message;
    error.code = code;
    error.httpstatus = 503;
    error.retryafter = retryafter;
```
This error includes a `retryafter` property to indicate a wait period until retrying to access the service. Can be used for temporary unavailability, such as cache updates. 

#### new Error#ConflictError(String message, String code) -> Object
Returns an `ConflictError` instance with properties 
```js
    error.message = message;
    error.code = code;
    error.httpstatus = 409;
```
#### new Error#DataBaseReturnError(String message, String code) -> Object
Returns an `DataBaseReturnError` instance with properties 
```js
    error.message = message;
    error.code = code;
    error.httpstatus = 500;
```
#### new Error#JSONValidationError(String message, Object errorData, String code) -> Object
Returns an `JSONValidationError` instance with properties 
```js
    error.message = message;
    error.code = code;
    error.httpstatus = 400;
    error.info = errorData;
```
This error is used by the [`JSONValidator](#jsonvalidator) lib to return errors on validation. The validation error data is passed in the `info` property.

### Server Errors
There are a set of errors that wrap server errors and are passed the original error as a parameter to the constructor. This error object is then available on the `errObj` property.

#### new Error#DataBaseError(Object errobj, String message, String code) -> Object
Returns an `DataBaseError` instance with properties 
```js
    error.message = message;
    error.errObj = errobj;
    error.code = code;
    error.httpstatus = 500;
```
#### new Error#ServerError(Object errobj, String message, String code) -> Object
Returns an `ServerError` instance with properties 
```js
    error.message = message;
    error.errObj = errobj;
    error.code = code;
    error.httpstatus = 500;
```
#### new Error#FBError(Object errobj, String message, String code) -> Object
Returns an `FBError` instance with properties 
```js
    error.message = message;
    error.errObj = errobj;
    error.code = code;
    error.httpstatus = 500;
```
#### new Error#AWSError(Object errobj, String message, String code) -> Object
Returns an `AWSError` instance with properties 
```js
    error.message = message;
    error.errObj = errobj;
    error.code = code;
    error.httpstatus = 500;
```

### Error#codes
Most times an error is sent back to a client along with a message to give more detail of the cause of the error. A `400 Bad Request` status does not let the client know what was incorrect in the request, so a message is added to clarify, "Email parameter must be a valid email". 

There are two good cases when it might be better to replace that message with a code instead.
* We care about bandwidth and want to send less bytes across the wire,
* we want to inform the client app of an error but not a user who might read the response content.

For this purpose `atEs` includes the concept of error codes that can be passed to the custom error constructors that give a little more detail about the error cause. These codes are read by the `ayEs#response` functions and a custom header, `X-Error-Code`, is added with the code. This can be read by developers or client applications for greater granularity of errors without verbose strings over the wire.

#### codes
See available codes and their meanings [here](lib/error/codes.js).

__TODO__ Allow for code customisation.

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
The router library will now add a validation middleware for request paramaters usign the schema indicated, Any failure against the schema is wrapped in a [`Error#JSONValidationError`](#new-errorjsonvalidationerrorstring-message-object-errordata-string-code---object) and reported back to the client using [`Respond#invalidRequest`](#invalidRequest).

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