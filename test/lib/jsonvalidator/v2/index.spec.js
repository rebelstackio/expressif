/* test/lib/jsonvalidator/v2/index.spec.js */
'use strict';

const JsonValidator = require('../../../../lib/jsonvalidator/v2');
// const DEFAULTS = require('../../../../lib/jsonvalidator/v2/defaults');


let customErrorsMock, ajvmock;

describe('TestSuit for JsonValidatorV2', () => {

	describe('init method', () => {

		beforeEach(() => {
			customErrorsMock = jest.fn();
			ajvmock = jest.fn();
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

	});
});
