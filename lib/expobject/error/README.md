# ExpError

Basic Common Error Object for REST verbs and custom errors. Allow to build REST common error based on http status code and the name(e.g  `404-NotFound`), also can build custom error not related with REST allowing the user expand the class and add no-common `properties` as additional properties. 


The main goal of this class is to used only one generic Error in the entire project avoiding to deal with multiple classes with similars behaviors

## Usage

To build a common HTTP error you can use the defined variables `EXPRESSIF_HTTP_CODES` and `EXPRESSIF_HTTP_TYPES` with the standar values.

```javascript
const { ExpError, EXPRESSIF_HTTP_CODES, EXPRESSIF_HTTP_TYPES } = require('@rebelstack-io/expressif');

const error = new ExpError(
	EXPRESSIF_HTTP_TYPES.serverError,  // ServerError label
	EXPRESSIF_HTTP_CODES.serverError,  // 500
	`Some error message`, // Custom message
	{ additionalProperty: 'here', errorObject: errorFromAnotherSource} // Any additional properties that you want in your error
)
```

If you want to create custom Error that might not be related with HTTP you can pass custom strings and codes like:

```javascript
const { ExpError } = require('@rebelstack-io/expressif');

const error = new ExpError(
	`CacheError`,
	500,
	`Key not found in cache`,
)
```
