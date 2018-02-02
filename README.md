# At your Express service
ayEs is a wrapper for the node Express framework that adds some opinions as to how to structure simple web services on an api server. The request flow goes through `authorize` -> `validate request structure` -> `validate request parameters` -> `controller middleware` -> `response`. 

![Service Request Flow](./docs/img/ServiceRequestFlow.svg)

Each stage is supported by library functions with the aim to standardise how service requests are validated and responded to.

* __Authorization__ is handled using [`JWT`](https://jwt.io/) and supports adding additional middleware to handle, for example, roles and/or permissions.

* __Validation__ of request structure will check the headers and session state of the request and the requesting user and return errors appropriately on any failed validation. 

* __Validation__ of request parameters is handled using [JSON schemes](https://spacetelescope.github.io/understanding-json-schema/). If required these are provided as part of the endpoint specification and passed to the route builder as part of a route configuration.

* __Controller middleware__ is an array of functions that make use of the ayES libraries for errors and responses, in order to standardize all service responses.

* __Response__ is handled by a set of library functions that wrap all responses in a standard format and apply custom headers and response strategies. Again, the intention here is one of standardisation. 