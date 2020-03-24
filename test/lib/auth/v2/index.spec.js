/* test/lib/auth/v2/index.spec.js */
'use strict';

const { decodeJWT, encodeJWT, parseAuthHeaders } = require('../../../../lib/auth/v2');

let jwt, secret;

describe('TestSuit for Auth', () => {

	describe('decodeErr method', () => {

	});

	describe('decodeJWT method', () => {

		beforeEach(() => {
			jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
			secret = 'asd1231asd#42135612$12124aasbasejrotosaxcr';
		});

		test('decodeJWT must call the function decode from jwt-simple package', () => {
			const dep = {
				JWT : {
					decode: jest.fn().mockImplementation(() => {
						return {
							sub: '1234567890',
							name: 'John Doe',
							iat: 1516239022
						};
					})
				}
			};
			const data = decodeJWT(jwt, secret, true, 'HS256', dep);

			expect(data).toHaveProperty('sub', '1234567890');
			expect(dep.JWT.decode).toBeCalledWith(jwt, secret, true, 'HS256');
		});
	});

	describe('encodeJWT method', () => {
		beforeEach(() => {
			jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
			secret = 'asd1231asd#42135612$12124aasbasejrotosaxcr';
		});

		test('encodeJWT must call the function encode from jwt-simple package', () => {
			const dep = {
				JWT : {
					encode: jest.fn().mockImplementation(() => {
						return jwt;
					})
				}
			};
			const payload = {
				user: 1235,
				name: `Joe Doe`
			};
			const data = encodeJWT(payload, secret, 'HS256', dep);

			expect(data).toBe(jwt);
			expect(dep.JWT.encode).toBeCalledWith(payload, secret, 'HS256');
		});
	});


	describe('parseAuthHeaders method', () => {

		test('parseAuthHeaders must throw ERROR.AuthError if the headers does has the Authorization key', () => {
			const ErrorMock = {
				AuthError: Error
			};
			const headers = {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			};
			expect(() => {
				parseAuthHeaders(headers, { ERROR: ErrorMock });
			}).toThrow(ErrorMock.AuthError);
		});

		test('parseAuthHeaders must throw ERROR.AuthError if the headers does not follow the format Authorization: Bearer XYZ...', () => {
			const ErrorMock = {
				AuthError: Error
			};
			const headers = {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIi'
			};
			expect(() => {
				parseAuthHeaders(headers, { ERROR: ErrorMock });
			}).toThrow(ErrorMock.AuthError);
		});

		test('parseAuthHeaders must throw ERROR.AuthError if the headers does not follow the format Authorization: Bearer XYZ...', () => {
			const ErrorMock = {
				AuthError: Error
			};
			const headers = {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'authorization': 'BearereyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIi'
			};
			expect(() => {
				parseAuthHeaders(headers, { ERROR: ErrorMock });
			}).toThrow(ErrorMock.AuthError);
		});

		test('parseAuthHeaders must throw ERROR.AuthError if the headers does not follow the format Authorization: Bearer XYZ...', () => {
			const ErrorMock = {
				AuthError: Error
			};
			const jwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`;
			const headers = {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'authorization': `Bearer ${jwt}`
			};
			expect(() => {
				const pjwt = parseAuthHeaders(headers, { ERROR: ErrorMock });
				expect(pjwt).toBe(jwt);
			}).not.toThrow(ErrorMock.AuthError);
		});

	});

});
