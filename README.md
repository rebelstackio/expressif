# expressif
[![Node.js CI](https://github.com/rebelstackio/expressif/actions/workflows/build.yml/badge.svg)](https://github.com/rebelstackio/expressif/actions/workflows/build.yml)

expressif is an opinionated MCR wrapper and bootstrap for the [express framework](https://expressjs.com/en/guide/routing.html) that vastly simplifies creating self-documenting JSON RESTful web services based on [JWT](https://jwt.io/) and [PostgresSQL](https://www.postgresql.org/).

The request flow goes through `authorize` -> `validate request structure` -> `validate request parameters` -> `controller middleware` -> `response`.

![Service Request Flow](docs/img/ServiceRequestFlow.svg)

## Features

* Basic template for JSON Rest APIs.
* self-documenting JSON RESTful API.
* Basic Wrappers for (M)odels, (C)ontrollers and (R)outers.
* Custom API.

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 8 or higher is required.

```bash
$ npm install @rebelstack/expressif
```

## Docs & Community

* [Getting started](./docs/README.md)
* [Discord](https://discord.gg/5hQBKWTU)
  <!-- * [API]() -  -->

## Tests

  To run the test suite, first install the dependencies, then run `npm test`:

```bash
$ npm install
$ npm test
```
