# Expressif BasicLogger

Very simple logger based in the `console` method.


## Gettings Started

Creating a logger instance. By default the logger has a `INFO` level.

```js
	const BasicLogger = require('lib/log/basic'); 
	// could be require('lib/log') if you want to use one upper level
	const logger = new BasicLogger();
	// Set INFO level
```

Also is possible to set the level as argument in the `constructor`. 

```js
	const BasicLogger = require('lib/log/basic'); 
	const logger = new BasicLogger('trace');
```

__NOTE:__ If the argument is invalid or throws an exception the logger will set the `INFO` as default.

__NOTE:__ The level could be in lowercases.

## Levels

There are 5 main levels. Based on the current level the logger will ignore lower level entries( as a usual logger library)

### error

```js
	const logger = new BasicLogger();
	logger.error('Errors:',error1, error2);
```

### warn

```js
	const logger = new BasicLogger();
	logger.warn('Warning:',war1, war2);
```

### info

```js
	const logger = new BasicLogger();
	logger.info('Usual info:', var1, var2);
```
### trace

```js
	const logger = new BasicLogger();
	logger.trace('Usual info:', var1, var2);
```
### debug

```js
	const logger = new BasicLogger();
	logger.debug(var1, var2);
```

## Changing Level 

Use the method `setLevel` to change the current level of the logger instance. Will be helpfully to set the complete application into a `debug` or `trace` mode.

```js
	const logger = new BasicLogger();
	logger.setLevel('debug');
```
