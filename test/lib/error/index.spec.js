/* test/lib/error/index.spec.js */
'use strict';

const chai = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const expect = chai.expect;
chai.use(sinonChai);
const Errors = require('lib/error');
const ErrorTypes = require('lib/error/types');
const ErrorHttpCodes= require('lib/error/httpcodes');

describe.only('lib/error/index.js',  () => {

	describe('#AppError', () => {
		let AppError;

		beforeEach(() => {
			AppError = Errors.AppError;
		});

		it('Should the AppError be available in the lib/error module', () => {
			expect(Errors).to.has.property('AppError');
		});

		it('Should AppError object be an instance of Error', () => {
			const err = new AppError(null, null, 'sample error');
			expect(err).to.be.instanceOf(Error);
		});

		it('Should AppError has the property message', () => {
			const msg = 'sample error';
			const err = new AppError(ErrorTypes.serverError, ErrorHttpCodes.serverError, msg);
			expect(err).to.has.property('message', msg);
		});

		it('Should AppError has the type property by default as Server Error', () => {
			const msg = 'sample error';
			const err = new AppError(null, null, msg);
			expect(err).to.has.property('type', ErrorTypes.serverError);
		});

		it('Should be possible to set the type property in an AppError', () => {
			const msg = 'sample error';
			const err = new AppError(ErrorTypes.badRequest, null, msg);
			expect(err).to.has.property('type', ErrorTypes.badRequest);
		});

		it('Should AppError has the httpstatus property by default as Server Error(500)', () => {
			const msg = 'sample error';
			const err = new AppError(null, null, msg);
			expect(err).to.has.property('httpstatus', ErrorHttpCodes.serverError);
		});

		it('Should be possible to set the httpstatus property in an AppError', () => {
			const msg = 'sample error';
			const err = new AppError(null, ErrorHttpCodes.badRequest, msg);
			expect(err).to.has.property('httpstatus', ErrorHttpCodes.badRequest);
		});

		it('Should AppError has a errorObject property by defaul as an empty object', () => {
			const msg = 'sample error';
			const error = new AppError(ErrorTypes.badRequest, ErrorHttpCodes.serverError, msg );
			expect(error).to.has.property('errorObject');
			expect(error.errorObject).to.be.deep.equal({});
		});

		it('Should be possible to set an errorObject( error from another source) in the options argument', () => {
			const msg = 'sample error';
			const err = new Error('error');
			const error = new AppError(ErrorTypes.badRequest, ErrorHttpCodes.serverError, msg, { errorObject: err } );
			expect(error).to.has.property('errorObject');
			expect(error.errorObject).to.be.deep.equal(err);
		});

		it('Should be possible to set aditional relevant properties in the options argument', () => {
			const msg = 'sample error';
			const err = new Error('error');
			const options = { errorObject: err, important: true, access: true };
			const error = new AppError(ErrorTypes.badRequest, ErrorHttpCodes.serverError, msg, options );
			delete options.errorObject;
			expect(error).to.has.property('props');
			expect(error.props).to.be.deep.equal(options);
		});

		it('Should an AppError display a string message when it is represented as string', () => {
			const msg = 'sample error';
			const err = new Error('error');
			const options = { errorObject: err, important: true, access: true };
			const error = new AppError(ErrorTypes.badRequest, ErrorHttpCodes.badRequest, msg, options );
			expect(error.toString()).to.be.equal(`[${ErrorTypes.badRequest}|${ErrorHttpCodes.badRequest}] ${msg}`);
		});

	});

});
