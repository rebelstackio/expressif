/* test/lib/server/v2/index.spec.js */
'use strict';

const ServerFactory = require('../../../lib/server');
const DEFAULTS = require('../../../lib/server/defaults.json');

let expressMock, cors, appmock, consoleMock, requireMock, fsMock, serverMock, JSONValidatorMock;

let initMock = jest.fn(), loadSchemasMock = jest.fn();

describe('TestSuit for ServerV2', () => {

	beforeEach(() => {
		requireMock = jest.fn().mockImplementation(() => {
			return jest.fn();
		});
		cors = jest.fn();
		serverMock = {
			close: jest.fn()
		};
		appmock = {
			use: jest.fn(),
			set: jest.fn(),
			disable: jest.fn(),
			listen: jest.fn().mockImplementation(() => {
				return serverMock;
			}),
			enable: jest.fn(),
			get: jest.fn()
		};
		consoleMock = {
			log : jest.fn(),
			debug: jest.fn(),
			warn: jest.fn()
		};
		fsMock = {
			existsSync: jest.fn(),
			unlinkSync: jest.fn()
		};
		expressMock = jest.fn().mockImplementation(() => appmock);
		expressMock.json= jest.fn();
		expressMock.urlencoded = jest.fn();
		JSONValidatorMock = {
			init: function _init(){
				initMock();
				return this;
			},
			loadSchemas: function loadSchemas(){
				loadSchemasMock();
				return this;
			}
		};
	});

	test('must throw a TypeError if the wdir is not provided in the server factory options', () => {
		expect(() => {
			ServerFactory({ socketfile: '/var/run/server.socket' },{ express: expressMock, console: consoleMock, req: requireMock, fs: fsMock, JSONValidator: JSONValidatorMock });
		}).toThrow(TypeError);
	});

	test('must call express constructor to build the app', () => {
		ServerFactory({ wdir: __dirname },{ express: expressMock, console: consoleMock, req: requireMock, JSONValidator: JSONValidatorMock });

		expect(expressMock).toBeCalledTimes(1);
	});

	test('must call express constructor with the custom option to build the app', () => {
		const customOptions = {
			strict: true,
			limit: '300kb',
			inflate: false,
			wdir: __dirname
		};
		ServerFactory(customOptions,{ express: expressMock, console: consoleMock, req: requireMock, JSONValidator: JSONValidatorMock });

		expect(expressMock).toBeCalledWith({...customOptions, ...DEFAULTS });
	});

	test('must use the LOGGER in the globals as main logger', () => {
		const customOptions = {
			strict: true,
			limit: '300kb',
			inflate: false,
			wdir: __dirname
		};
		global.LOGGER = {
			debug: jest.fn(),
			warn: jest.fn()
		};
		ServerFactory(customOptions,{ express: expressMock, console: consoleMock, req: requireMock, JSONValidator: JSONValidatorMock });

		expect(global.LOGGER.debug).toBeCalledTimes(3);
	});

	test('must load routers based on the default folder name for routers(routers dah!)', () => {
		const customOptions = {
			strict: true,
			limit: '300kb',
			inflate: false,
			wdir: __dirname
		};
		global.LOGGER = {
			debug: jest.fn(),
			warn: jest.fn()
		};

		ServerFactory(customOptions, { express: expressMock, console: consoleMock, req: requireMock, JSONValidator: JSONValidatorMock });

		expect(requireMock).toBeCalledTimes(1);
	});

	test('must load routers based on a custom folder name for routers', () => {
		const customOptions = {
			strict: true,
			limit: '300kb',
			inflate: false,
			routers: 'my_routers',
			wdir: __dirname
		};
		global.LOGGER = {
			debug: jest.fn(),
			warn: jest.fn()
		};

		ServerFactory(customOptions,{ express: expressMock, console: consoleMock, req: requireMock, JSONValidator: JSONValidatorMock });

		expect(requireMock).toBeCalledTimes(1);
	});

	test('must load routers based on a custom array and require the router main files based on number of items', () => {
		const customOptions = {
			strict: true,
			limit: '300kb',
			inflate: false,
			routers: ['my_routers', 'default', 'main', 'routers'],
			wdir: __dirname
		};
		global.LOGGER = {
			debug: jest.fn(),
			warn: jest.fn()
		};

		ServerFactory(customOptions,{ express: expressMock, console: consoleMock, req: requireMock, JSONValidator: JSONValidatorMock });

		expect(requireMock).toBeCalledTimes(4);
		expect(requireMock).toBeCalledWith('my_routers');
		expect(requireMock).toBeCalledWith('default');
		expect(requireMock).toBeCalledWith('main');
		expect(requireMock).toBeCalledWith('routers');
	});

	test('must call JSONValidator object to load the schemas for request validations', () => {
		global.LOGGER = {
			debug: jest.fn(),
			warn: jest.fn()
		};
		const customOptions = {
			strict: true,
			limit: '300kb',
			inflate: false,
			routers: ['routers','router_with_errors', 'routers_v2'],
			wdir: __dirname
		};
		fsMock.existsSync = jest.fn().mockReturnValue(true);
		requireMock = jest.fn().mockImplementation(() => {
			return jest.fn();
		});
		ServerFactory(customOptions,{ fs: fsMock, express: expressMock, console: consoleMock, req: requireMock, JSONValidator: JSONValidatorMock });

		expect(initMock).toBeCalledTimes(1);
		expect(loadSchemasMock).toBeCalledTimes(1);
	});

	test('must throw a TypeError if the router options is not an array or string', () => {
		const customOptions = {
			strict: true,
			limit: '300kb',
			inflate: false,
			routers: false,
			wdir: __dirname
		};
		global.LOGGER = {
			debug: jest.fn()
		};

		expect(() => {
			ServerFactory(customOptions,{ express: expressMock, console: consoleMock, req: requireMock, JSONValidator: JSONValidatorMock });
		}).toThrow();
	});

	test('must call the logger warning method if there is a router that cannot be loaded when the routers options is an array', () => {
		global.LOGGER = {
			debug: jest.fn(),
			warn: jest.fn()
		};
		const customOptions = {
			strict: true,
			limit: '300kb',
			inflate: false,
			routers: ['routers','router_with_errors', 'routers_v2'],
			wdir: __dirname
		};
		requireMock = jest.fn().mockImplementation((path) => {
			if ( path === 'router_with_errors'){
				throw new Error('Invalid router');
			} else {
				return jest.fn();
			}
		});
		fsMock.existsSync = jest.fn().mockReturnValue(false);
		const myserver = ServerFactory(customOptions,{ fs:fsMock, express: expressMock, console: consoleMock, req: requireMock, JSONValidator: JSONValidatorMock });
		myserver.configureapp((app) => {
			app.disable('x-powered-by');
			app.set('trust proxy', 'loopback');
			app.use(cors({
				preflightContinue: true
			}));
		});

		expect(global.LOGGER.warn).toBeCalledTimes(2);
	});

	test('configureapp method must be a callback with a reference with app express object where it is possible to customize the express app by the client with any allowed property by express', () => {
		const myserver = ServerFactory({wdir: __dirname},{ express: expressMock, console: consoleMock, req: requireMock, JSONValidator: JSONValidatorMock });
		myserver.configureapp((app) => {
			app.disable('x-powered-by');
			app.set('trust proxy', 'loopback');
			app.use(cors({
				// Allow to continue with options endpoints
				preflightContinue: true
			}));
		});
		expect(appmock.use).toBeCalledTimes(3);
		expect(appmock.set).toBeCalledWith('trust proxy', 'loopback');
		expect(appmock.disable).toBeCalledWith('x-powered-by');
	});

	test('start method must use the port property and call the listen method  with the port from the express app and the default values', () => {
		const myserver = ServerFactory({ port: 8080, wdir: __dirname },{ express: expressMock, console: consoleMock, req: requireMock, JSONValidator: JSONValidatorMock });
		myserver.configureapp((app) => {
			app.disable('x-powered-by');
			app.set('trust proxy', 'loopback');
			app.use(cors({
				// Allow to continue with options endpoints
				preflightContinue: true
			}));
		});

		myserver.start();

		expect(appmock.set).toBeCalledTimes(3);
		expect(appmock.set).nthCalledWith(2, 'host', '0.0.0.0');
		expect(appmock.set).nthCalledWith(3, 'port', 8080);
		expect(appmock.listen).toBeCalledTimes(1);
	});

	test('start method must use the socket file property and call the listen method  with the socket file from the express app', () => {
		const myserver = ServerFactory({ wdir: __dirname, socketfile: '/var/run/server.socket' },{ express: expressMock, console: consoleMock, req: requireMock, fs: fsMock, JSONValidator: JSONValidatorMock });
		myserver.configureapp((app) => {
			app.disable('x-powered-by');
			app.set('trust proxy', 'loopback');
			app.use(cors({
				// Allow to continue with options endpoints
				preflightContinue: true
			}));
		});

		myserver.start();

		expect(appmock.listen.mock.calls[0][0]).toBe('/var/run/server.socket');
	});

	test('close method must call express server close method', () => {
		const myserver = ServerFactory({ wdir: __dirname, socketfile: '/var/run/server.socket' },{ express: expressMock, console: consoleMock, req: requireMock, fs: fsMock, JSONValidator: JSONValidatorMock });
		myserver.configureapp((app) => {
			app.disable('x-powered-by');
			app.set('trust proxy', 'loopback');
			app.use(cors({
				// Allow to continue with options endpoints
				preflightContinue: true
			}));
		});
		myserver.start();

		myserver.stop();

		expect(serverMock.close).toBeCalledTimes(1);
	});
});
