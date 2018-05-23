# At your Express service
[![Build Status](https://travis-ci.com/rebelstackio/ayEs.svg?branch=develop)](https://travis-ci.com/rebelstackio/ayEs)
ayEs is a wrapper for the node [Express framework](https://expressjs.com/en/guide/routing.html) that adds some opinions as to how to structure simple web services on an api server. The request flow goes through `authorize` -> `validate request structure` -> `validate request parameters` -> `controller middleware` -> `response`. 

![Service Request Flow](https://raw.githubusercontent.com/rebelstackio/ayEs/develop/docs/img/ServiceRequestFlow.svg)

Each stage is supported by library functions with the aim to standardise how service requests are validated and responded to.

* __Authorization__ is handled using [`JWT`](https://jwt.io/) and supports adding additional middleware to handle, for example, roles and/or permissions.

* __Validation__ of request structure will check the headers and session state of the request and the requesting user and return errors appropriately on any failed validation. 

* __Validation__ of request parameters is handled using [JSON schemes](https://spacetelescope.github.io/understanding-json-schema/). If required these are provided as part of the endpoint specification and passed to the route builder as part of a route configuration.

* __Controller middleware__ is an array of functions that make use of the ayES libraries for errors and responses, in order to standardize all service responses.

* __Response__ is handled by a set of library functions that wrap all responses in a standard format and apply custom headers and response strategies. Again, the intention here is one of standardisation.

## Contents
* [Get started](#using-ayes)
* [Authentication](#auth)
    * [API](#auth-api)
* [Error](#error)
    * [API](#error-api)
    * [Server-Errors](#server-errors)
    * [Error codes](#errorcodes)
* [JSON Validator](#jsonvalidator)
* [Respond](#respond)
    * [API](#respond-api)
* [Request Validator](#reqvalidator)
* [Router](#router)
* [Self documenting endpoints](#self-documenting-endpoints)

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
 *    "user": {
 *      "id": "596dcd99dd19f9227f5a94b1",
 *      "username": "nectarsoft"
 *    }
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
This error is used by the [`JSONValidator`](#jsonvalidator) lib to return errors on validation. The validation error data is passed in the `info` property.

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

## JSONValidator
A wrapper for the [AJV](https://github.com/epoberezkin/ajv) JSON schema validation library used to validate request parameters.

The idea here is to create an instance of the `ayEs#JSONValidator` and register a set of JSON schema that can be used in route configuration. So, given a JSON schema for validating login parameters with an `$id` property of `postloginin`, such as 
```js 
const authReqSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
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
const JSONValidator = ayEs.JSONValidator;
const jv = new JSONValidator(authReqSchema);
```
or using the `JSONValidator#addSchema` instance function
```js
const JSONValidator = ayEs.JSONValidator;
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
The router library will now add a validation middleware for request parameters using the schema indicated. Any failure against the schema is wrapped in a [`Error#JSONValidationError`](#new-errorjsonvalidationerrorstring-message-object-errordata-string-code---object) and reported back to the client using [`Respond#invalidRequest`](#invalidRequest).

#### $ref in JSON schema
If you use the [`$ref` property](https://spacetelescope.github.io/understanding-json-schema/structuring.html) in your JSON schema to reference common definitions in a separate schema file we must pass that to our `ayEs#JSONValidator` instance in a slightly different way. This is due to how it is passed to the underlying [`ajv` library](https://github.com/epoberezkin/ajv#ref).

First add all the definition schemas into the array of schemas you wish to register with the validator and then wrap the array into an options object.
```js
// schemas/defs.json
{
  "$id": "defs", // Id used to reference this schema in other schemas
  "definitions": {
    "username": {
      "title": "Username",
      "type": "string",
      "pattern": "^[a-zA-Z0-9\\-_.]{3,25}$"
    }
  }
}

// schemas/user.json
[{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "description": "GET User Params",
  "type": "object",
  "required": ["username"],
  "properties": {
    "username": { "$ref": "defs#/definitions/username" }
  }
}]

// routes/user.js
const JSONValidator = ayEs.JSONValidator;
const ds = require('schemas/defs');
const su = require('schemas/user');

su.push(ds);
const jvoptions = { schemas: su };
const jv = new JSONValidator(null, jvoptions);
```

## Respond
A wrapper lib for the [`Express#res.send`](https://expressjs.com/en/4x/api.html#res.send) function. All responses are standardised. Data returned for a successful request can be wrapped with `respond#wrapSuccessData()` before being passed to `respond#success()` to be returned to the requestor.
```js
const ayEs = require('ayes');
const respond = ayEs.respond;

// controller for /login route
const loginController = function loginController(req, res) {
  const { username, password } = req.body;
  if (password) {
    const response = {
      id: Math.floor(Math.random() * 6) + 1,
      username
    };
    respond.success(res, req, respond.wrapSuccessData(response, req.path));
  }
};

// Responds to requester with JSON body
{
  "data": {
    "id": 2,
    "username": "nectarsoft"
  },
  "path": "/login"
}
```

### Respond API
#### respond#forbidden(Object response, Object Request, Object Error)
Will respond to the requestor with http status `403`. 

The last parameter is intended to be a custom `ayEs#Error` object and can include `message`, `httpstatus` and `code` properties. 

If `httpstatus` is present, this will be used in place of `403`.

The `code` property is anticipated to be one of ['ayes#Error#codes](#errorcodes) and if present `respond#forbidden` returns an empty body and includes the custom header `X-Error-Code` set to the value of `code`.

If `code` is not present a response body is sent using the `message` property from the `Error` parameter if present or 'Forbidden' if not.
```js
{
  "data": {
    "message": "Forbidden" // Or Error.message is present
  },
  "type": "ForbiddenError"
}

```

#### respond#invalidRequest(Object response, Object Request, Object Error)
This response is intended to pass back information about any invalid request so a requester can amend and resubmit their failed request. 

Any information to be passed to the requester can be attached to the `Error.info` property of the last parameter. 

So, for example, if used in conjunction with an [`Error#JSONValidationError`](#new-errorjsonvalidationerrorstring-message-object-errordata-string-code---object) returned by the [`ayEs#JSONValidator`](#jsonvalidator) library we get a response body of the form
```js
response.invalidRequest(response, request ,JSONValidationError);
// Returns a request body of e.g.
{
  "data": {
    "message": "JSON validation errors were found against schema: postloginin",
    "info": [
      {
        "keyword": "required",
        "dataPath": "",
        "schemaPath": "#/required",
        "params": {
          "missingProperty": "password"
        },
        "message": "should have required property 'password'"
      }
    ]
   },
  "type": "JSONValidationError",
  "code": 400.43
}
```

#### respond#notAuthorized(Object response, Object Request, Object Error)
Will respond to the requestor with http status [`401`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401) and set the `WWW-Authenticate` header to `Bearer token_path="JWT"`.

The last parameter is intended to be a custom `ayEs#Error` object and can include `message`, `httpstatus` and `code` properties. 

If `httpstatus` is present, this will be used in place of `401`.

The `code` property is anticipated to be one of ['ayes#Error#codes](#errorcodes) and if present `respond#notAuthorized` returns an empty body and includes the custom header `X-Error-Code` set to the value of `code`.

If `code` is not present a response body is sent using the `message` property from the `Error` parameter if present or 'Authorisation error' if not.
```js
{
  "data": {
    "message": "Authorisation error" // Or Error.message is present
  },
  "type": "Not_Authorized_Error" // Or Error Constructor name.
}
```

#### respond#notFound(Object response, Object Request, Object Error)
Will respond to the requestor with http status [`404`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404). 

The last parameter is intended to be a custom `ayEs#Error` object and can include `message`, `httpstatus` and `code` properties. 

If `httpstatus` is present, this will be used in place of `404`.

The `code` property is anticipated to be one of ['ayes#Error#codes](#errorcodes) and if present `respond#notFound` returns an empty body and includes the custom header `X-Error-Code` set to the value of `code`.

If `code` is not present a response body is sent using the `message` property from the `Error` parameter if present or 'Resource not found' if not.
```js
{
  "data": {
    "message": "Resource not found" // Or Error.message is present
  },
  "type": "Not_Found_Error" // Or Error Constructor name.
}

```

#### respond#notImplemented(Object response, Object Request, Object Error)
Will respond to the requestor with http status [`501`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/501). 

The last parameter is intended to be a custom `ayEs#Error` object and can include `message`, `httpstatus` and `code` properties. 

If `httpstatus` is present, this will be used in place of `501`.

The `code` property is anticipated to be one of ['ayes#Error#codes](#errorcodes) and if present `respond#notImplemented` returns an empty body and includes the custom header `X-Error-Code` set to the value of `code`.

If `code` is not present a response body is sent using the `message` property from the `Error` parameter if present or 'Not Implemented' if not.
```js
{
  "data": {
    "message": "Not Implemented" // Or Error.message is present
  },
  "type": "Not_Implemented_Error" // Or Error Constructor name.
}

```

#### respond#redirect(Object response, Object headers, Number statusCode, String noWrapDataStr)
Will respond to the requestor with http status [`307`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/307).

The headers parameter should contain key value pairs of header names and values that will be added to the response. Typically this will include the `Location` header with an URL intended for the redirect.

If `httpstatus` is present, this will be used in place of `307`.

#### respond#serverError(Object response, Object Request, Object Error)
Will respond to the requestor with http status [`500`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500). 

The last parameter is intended to be a custom `ayEs#Error` object and can include `message`, `httpstatus` and `code` properties. 

If `httpstatus` is present, this will be used in place of `500`.

The `code` property is anticipated to be one of ['ayes#Error#codes](#errorcodes) and if present `respond#serverError` returns an empty body and includes the custom header `X-Error-Code` set to the value of `code`.

If `code` is not present a response body is sent using the `message` "Unexpected Error" if not and setting the type to "Server_Error".
```js
{
  "data": {
    "message": "Unexpected Error"
  },
  "type": "Server_Error" // Or Error Constructor name.
}

```

#### respond#success(Object response, Object request, Object WrappedData, Number HttpStatus)
Will respond to the requestor with http status [`200`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200).

If `HttpStatus` parameter is present this will be used in place of `200`.

If `WrappedData` if present it is used to build the response object, passing the data as teh `data` property of the response an either a `path` property, if one exists on the `wrappedData` object, or `type` property if not.

```json
{
  "data": {
    "id": 2,
    "username": "nectarsoft"
  },
  "path": "/login"
}
// Or
{
  "data": {
    "id": 2,
    "username": "nectarsoft"
  },
  "type": "success"
}
```

If no `WrappedData` parameter is passed `respond#success` will return an empty body, but still use http status `200` and not [`204`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/204).

#### respond#unavailableRetry(Object response, Object Request, Object Error)
Will respond to the requestor with http status [`503`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/503).

The last parameter is intended to be a custom `ayEs#Error` object and can include `message`, `httpstatus`, `retryafter` and `code` properties. 

This response will set the `Retry-After` header to either the number 1 or a value passed in the `Error#retryafter` property. 

If `httpstatus` is present, this will be used in place of `503`.

The `code` property is anticipated to be one of ['ayes#Error#codes](#errorcodes) and if present `respond#unavailableRetry` returns an empty body and includes the custom header `X-Error-Code` set to the value of `code`.

If `code` is not present a response body is sent using the `message` property from the `Error` parameter if present or 'Service temporarily unavailable. Please retry' if not.
```js
{
  "data": {
    "message": "Service temporarily unavailable. Please retry" // Or Error.message is present
  },
  "type": "Service_Unavailable_Please_Retry" // Or Error Constructor name.
}

```

#### respond#wrapSuccessData(Object Data, String path, Object options)
A function to wrap the return data into an options object for the `respond#success` function.
```js
const wrappedData = Respond.wrapSuccessData(response, req.path, { stripNull: true });
Respond.success(res, req, wrappedData);
```
__options__
* stripNull : Boolean flag to pass to the `respond#success` function to indicate that any value in the data object with a null value should not be returned to the requester. 

## Reqvalidator
A peculiar beast used for validating request formats. TODO.

## Router
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
If the flag `addOptionsRoute` is set on the options object passed to the `Router#buildRouter` function, it will add an `OPTIONS` endpoint at the root URL for that router that will return a `JSON` containing information about all routes within the router. This will include a `data` property that is an object whose property keys are the available paths for the router. Each path will have an array of objects describing each available verb for that path with the following properties:
* _verb_: HTTP method
* _validations_: What validations are carried out on the request format. Currently this will list required headers.
* _body_schema_: A JSON schema for the parameters for this request.
* _response_: A JSON schema describing the response for this endpoint.

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
        "$schema": "http://json-schema.org/draft-07/schema#",
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
        "$schema": "http://json-schema.org/draft-07/schema#",
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
