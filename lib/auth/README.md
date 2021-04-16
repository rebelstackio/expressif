# Expressif Utility Auth Functions

Auth component for Expressif with utility functions related to Authentication and JWT.

## Public Functions

- `encodeJWT(payload, secret, algorithm): <string>`

Returns a JWT Token based on `payload`, `secret` and the `algorithm`(optional, by default `HS256`)

```js
var payload = {
  "user": {
    "id": 1
  },
  "privileges": [
    1,
    3
  ],
  nbf: Math.round(Date.now() / 1000),
  iat: Math.round(Date.now() / 1000),
  exp: Math.round(Date.now() / 1000 + 24 * 60 * 60 * 90 )
};

var secret = 'MYrANdomS3cre3t';
var token = encodeJWT(payload, secret);
```
