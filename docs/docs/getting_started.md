---
layout: docs
title: Getting Started
permalink: /docs/getting-started/
tabindex: 1
---

## Instalation
```bash
npm i @rebelstack-io/expressif
```

## Using expressif
```js
/* Bootstrap a server */
const {Server} = require('expressif');
let myserver = new Server(/* config, globals */);

/* Create a sample login controller to deal with login requests.
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
