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
	{ additionalProperty: 'here', errorObject: errorFromAnotherSource} // Any additional properties that you want in your error object
)
```

If you want to create custom Error that might not be related with HTTP you can pass custom strings and codes like:

```javascript
const { ExpError } = require('@rebelstack-io/expressif');

const error = new ExpError(
	`CacheError`,
	500.11,
	`Key not found in cache`,
)
```

## Methods

- `json(includeOrgError<boolean>=false)`

	Return a JSON representation of the error to be simple and common to the client. The `includeOrgError` argument allows to set an `errorobject` property in the representation. Additional headers will come in the HTTP Response headers so it is not required to set a flag to expose them

```javascript
const error = new ExpError(
	`CacheError`,
	500.11,
	`Key not found in cache`,
	{
		adheaders: {
			'X-Error-Code': 500
		},
		errorObject : {
			origin: 'cache',
			message: 'Key not found'
		}
	}
);

error.json();
/*
{ 
	"message": "Key not found in cache",
	"httpstatus": 	500.11,
	"type": "CacheError"
	"props": {}
}
*/

error.json(true);
/*
{ 
	"message": "Key not found in cache",
	"httpstatus": 	500.11,
	"type": "CacheError"
	"props": {},
	errorobject: {
		origin: 'cache',
		message: 'Key not found'
	}
}
*/
```
