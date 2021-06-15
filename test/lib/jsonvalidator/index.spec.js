/* test/lib/jsonvalidator/v2/index.spec.js */
'use strict';

const JsonValidator = require('../../../lib/jsonvalidator');

let customErrorsMock, ajvmock, collectFilePathsRecursive,requireMock,addschemamock;

describe('TestSuit for JsonValidatorV2', () => {

	describe('init method', () => {

		beforeEach(() => {
			customErrorsMock = jest.fn();
			ajvmock = jest.fn();
			global.LOGGER = {
				debug: jest.fn(),
				error: jest.fn(),
				warn: jest.fn()
			};
		});

		test('init must call ajv-errors and ajv packages', () => {
			JsonValidator.init('schemas',{}, { customErrors:customErrorsMock, AJV:ajvmock });

			expect(ajvmock).toBeCalledTimes(1);
			expect(customErrorsMock).toBeCalledTimes(1);
		});

		test('init must call ajv package constructor with the allError flag enable by default', () => {
			JsonValidator.init('schemas',{}, { customErrors:customErrorsMock, AJV:ajvmock });
			const options = ajvmock.mock.calls[0][0];

			expect(options).toHaveProperty('allErrors', true);
		});


		test('init must call customErrors function with the keepErrors flag as false by default', () => {
			JsonValidator.init('schemas',{}, { customErrors:customErrorsMock, AJV:ajvmock });
			const options = customErrorsMock.mock.calls[0][1];

			expect(options).toHaveProperty('keepErrors', false);
		});

		test('init must set the flag _ready as false if there is an exception loading the AJV package', () => {
			ajvmock = jest.fn().mockImplementation(() => {
				throw new Error(`Unable load AJV with the current options`);
			});
			const jv = JsonValidator.init('schemas',{}, { customErrors:customErrorsMock, AJV:ajvmock });
			expect(jv.isReady()).toBeFalse();
		});

	});

	describe('loadSchemas method', () => {

		beforeEach(() => {
			requireMock = jest.fn().mockImplementation(() => {
				return { schema: true };
			});
			customErrorsMock = jest.fn();
			addschemamock = jest.fn();
			ajvmock = jest.fn().mockImplementation(() => {
				return {
					addSchema: addschemamock
				};
			});
			collectFilePathsRecursive = jest.fn().mockImplementation(() =>{
				return[
					'/home/proj1/schemas/base.json',
					'/home/proj1/schemas/f1/r1.json',
					'/home/proj1/schemas/f1/r2.json'
				];
			});
		});

		test('loadSchemas must call collectFilePathsRecursive function to get all the posible schemas under the target folder', () => {
			const jv = JsonValidator.init('schemas',{}, { customErrors:customErrorsMock, AJV:ajvmock });
			jv.loadSchemas(collectFilePathsRecursive, requireMock);

			expect(collectFilePathsRecursive).toBeCalledTimes(1);
		});

		test('loadSchemas must not call collectFilePathsRecursive function if there was a problem loading the AJV package', () => {
			ajvmock = jest.fn().mockImplementation(() => {
				throw new Error(`Unable load AJV with the current options`);
			});
			const jv = JsonValidator.init('schemas',{}, { customErrors:customErrorsMock, AJV:ajvmock });
			jv.loadSchemas(collectFilePathsRecursive, requireMock);

			expect(collectFilePathsRecursive).toBeCalledTimes(0);
		});

		test('loadSchemas must call require with all schemas(fullpath) returned by collectFilePathsRecursive', () => {
			JsonValidator.init(
				'schemas',{}, { customErrors:customErrorsMock, AJV:ajvmock }
			).loadSchemas(collectFilePathsRecursive, requireMock);

			expect(requireMock).toBeCalledTimes(3);
			expect(requireMock).toHaveBeenNthCalledWith(1, '/home/proj1/schemas/base.json');
			expect(requireMock).toHaveBeenNthCalledWith(2, '/home/proj1/schemas/f1/r1.json');
			expect(requireMock).toHaveBeenNthCalledWith(3, '/home/proj1/schemas/f1/r2.json');
		});

		test('loadSchemas must call LOGGER warn if there was problem loading a schema', () => {
			requireMock = jest.fn().mockImplementation(( p ) => {
				if ( p === '/home/proj1/schemas/base.json') {
					throw new Error(`Unable to load schema ${p}`);
				} else {
					return { schema: true };
				}
			});
			JsonValidator.init(
				'schemas',{}, { customErrors:customErrorsMock, AJV:ajvmock }
			).loadSchemas(collectFilePathsRecursive, requireMock);

			expect(requireMock).toBeCalledTimes(3);
			expect(global.LOGGER.warn).toBeCalledTimes(1);
		});

		test('loadSchemas must call AJV addSchema with all the collected schemas already required', () => {
			requireMock = jest.fn().mockImplementation(( p ) => {
				return { schema: p };
			});
			JsonValidator.init(
				'schemas',{}, { customErrors:customErrorsMock, AJV:ajvmock }
			).loadSchemas(collectFilePathsRecursive, requireMock);

			const args = addschemamock.mock.calls[0][0];
			expect(addschemamock).toBeCalledTimes(1);
			expect(args).toIncludeAnyMembers([
				{ schema: '/home/proj1/schemas/base.json' },
				{ schema: '/home/proj1/schemas/f1/r1.json' },
				{ schema: '/home/proj1/schemas/f1/r2.json' }
			]);
		});
	});
});
