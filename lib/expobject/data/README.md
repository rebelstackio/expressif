# ExpData

Basic Common Data Object for REST verbs and custom success types. Allow to build REST common successed response based on http status code and the name(e.g  `200-Ok`), also can build custom successed REST responses allowing the user expand the class and add no-common `properties` as additional properties. 

## Usage

To build a common HTTP successed responses you can use the defined variables `EXPRESSIF_HTTP_CODES` and `EXPRESSIF_HTTP_TYPES` with the standar values.

```javascript
const { ExpData, EXPRESSIF_HTTP_CODES, EXPRESSIF_HTTP_TYPES } = require('@rebelstack-io/expressif');

const dat = new ExpData(
	EXPRESSIF_HTTP_TYPES.oK,  // oK label
	EXPRESSIF_HTTP_CODES.oK,  // 200
	{ r: `Some data`}, // Custom data
	{ 
		additionalProperty: 'here', // Any additional properties that you want in your respone
		adheaders: { // Additional headers in your response
			'Etag': 'xas21321333'
		}
	} 
)
```

If you want to create custom Data that might not be related with HTTP you can pass custom strings and codes like:

```javascript
const { ExpData } = require('@rebelstack-io/expressif');

const data = new ExpData(
	`CacheOk`,
	200.11,
	{...}
)
```

## Methods

- `json()`

	Return a JSON representation of the data to be simple and common to the client.Additional headers will come in the HTTP Response headers so it is not required to set a flag to expose them

```javascript
const data = new ExpData(
	`CacheOk`,
	200.11,
	{...},
	{
		adheaders: {
			'Etag': 'xas21321333'
		},
	}
);

data.json();
/*
{ 
	"message": "Key not found in cache",
	"httpstatus": 	500.11,
	"type": "CacheOk"
	"props": {}
}
*/
```
