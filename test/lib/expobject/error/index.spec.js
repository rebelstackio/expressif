/* test/lib/error/index.spec.js */
'use strict';

const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);
const ExpressifObject = require('lib/expobject');
const ErrorTypes = ExpressifObject.EXPRESSIF_HTTP_TYPES;
const ErrorHttpCodes= ExpressifObject.EXPRESSIF_HTTP_CODES;

describe('lib/expobject/error/index.js',  () => {

	describe('#ExpError', () => {
		let ExpError;

		beforeEach(() => {
			ExpError = ExpressifObject.ExpError;
		});

		it('Should the ExpError be available in the lib/error module', () => {
			expect(ExpressifObject).to.has.property('ExpError');
		});

		it('Should ExpError has the property message', () => {
			const msg = 'sample error';
			const err = new ExpError(ErrorTypes.serverError, ErrorHttpCodes.serverError, msg);
			expect(err).to.has.property('message', msg);
		});

		it('Should ExpError has the stack property inherent from Error object', () => {
			const msg = 'sample error';
			const err = new ExpError(ErrorTypes.serverError, ErrorHttpCodes.serverError, msg);
			expect(err).to.has.property('stack');
		});

		it('Should ExpError has the type property by default as Server Error', () => {
			const msg = 'sample error';
			const err = new ExpError(null, null, msg);
			expect(err).to.has.property('type', ErrorTypes.serverError);
		});

		it('Should be possible to set the type property in an ExpError', () => {
			const msg = 'sample error';
			const err = new ExpError(ErrorTypes.badRequest, null, msg);
			expect(err).to.has.property('type', ErrorTypes.badRequest);
		});

		it('Should ExpError has the httpstatus property by default as Server Error(500)', () => {
			const msg = 'sample error';
			const err = new ExpError(null, null, msg);
			expect(err).to.has.property('httpstatus', ErrorHttpCodes.serverError);
		});

		it('Should be possible to set the httpstatus property in an ExpError', () => {
			const msg = 'sample error';
			const err = new ExpError(null, ErrorHttpCodes.badRequest, msg);
			expect(err).to.has.property('httpstatus', ErrorHttpCodes.badRequest);
		});

		it('Should ExpError has a errorObject property by default is udnefined', () => {
			const msg = 'sample error';
			const error = new ExpError(ErrorTypes.badRequest, ErrorHttpCodes.serverError, msg );
			expect(error).to.has.property('errorObject');
			expect(error.errorObject).to.be.undefined;
		});

		it('Should be possible to set an errorObject( error from another source) in the options argument', () => {
			const msg = 'sample error';
			const err = new Error('error');
			const error = new ExpError(ErrorTypes.badRequest, ErrorHttpCodes.serverError, msg, { errorObject: err } );
			expect(error).to.has.property('errorObject');
			expect(error.errorObject).to.be.deep.equal(err);
		});

		it('Should be possible to set aditional relevant properties in the options argument', () => {
			const msg = 'sample error';
			const err = new Error('error');
			const options = { errorObject: err, important: true, access: true };
			const error = new ExpError(ErrorTypes.badRequest, ErrorHttpCodes.serverError, msg, options );
			delete options.errorObject;
			expect(error).to.has.property('props');
			expect(error.props).to.be.deep.equal({ important: true, access: true });
			expect(error.errorObject).to.be.equal(err);
		});

		it('Should an ExpError display a string message when it is represented as string', () => {
			const msg = 'sample error';
			const err = new Error('error');
			const options = { errorObject: err, important: true, access: true };
			const error = new ExpError(ErrorTypes.badRequest, ErrorHttpCodes.badRequest, msg, options );
			expect(error.toString()).to.be.equal(`[${ErrorTypes.badRequest}|${ErrorHttpCodes.badRequest}] ${msg}`);
		});

		it('Should an ExpError has additional Headers property(adheaders) as empty object by default', () => {
			const msg = 'sample error';
			const error = new ExpError(ErrorTypes.badRequest, ErrorHttpCodes.badRequest, msg, );
			expect(error).to.has.property('adheaders');
			expect(error.adheaders).to.be.empty;
		});

		it('Should an ExpError set any additional Headers property(adheaders) and overwrite the default value', () => {
			const newadheaders = {
				'X-Error-Code': 501.12,
			};
			const error = new ExpError(
				ErrorTypes.badRequest,
				ErrorHttpCodes.badRequest,
				'sample error',
				{
					adheaders : newadheaders
				}
			);
			expect(error).to.has.property('adheaders');
			expect(error.adheaders).to.be.deep.equal(newadheaders);
		});

		it('Should an ExpError has the property hasAdditionalHeaders as false if the adheader property is empty', () => {
			const error = new ExpError(
				ErrorTypes.badRequest,
				ErrorHttpCodes.badRequest,
				'sample error'
			);
			expect(error).to.has.property('hasAdditionalHeaders', false);
		});

		it('Should an ExpError has the property hasAdditionalHeaders as true if the adheader property is not empty', () => {
			const newadheaders = {
				'X-Error-Code': 501.12,
			};
			const error = new ExpError(
				ErrorTypes.badRequest,
				ErrorHttpCodes.badRequest,
				'sample error',
				{
					adheaders : newadheaders
				}
			);
			expect(error).to.has.property('hasAdditionalHeaders', true);
		});

		it('Should the json method return a object with the message representing the response for HTTP request', () => {
			const msg = 'Invalid options for your action';
			const error = new ExpError(
				ErrorTypes.badRequest,
				ErrorHttpCodes.badRequest,
				msg
			);
			const response = error.json();
			expect(response).to.has.property('message', msg);
		});

		it('Should the json method return a object with the httpstatus representing the response for HTTP request', () => {
			const error = new ExpError(
				ErrorTypes.badRequest,
				ErrorHttpCodes.badRequest,
				'Invalid options for your action'
			);
			const response = error.json();
			expect(response).to.has.property('httpstatus', ErrorHttpCodes.badRequest);
		});

		it('Should the json method return a object with the type representing the response for HTTP request', () => {
			const error = new ExpError(
				ErrorTypes.badRequest,
				ErrorHttpCodes.badRequest,
				'Invalid options for your action'
			);
			const response = error.json();
			expect(response).to.has.property('type', 	ErrorTypes.badRequest);
		});

		it('Should the json method return a object with the props property representing the response for HTTP request with custom data provided by the developer', () => {
			const options = { important: true, access: true };
			const error = new ExpError(
				ErrorTypes.badRequest,
				ErrorHttpCodes.badRequest,
				'Invalid options for your action',
				options
			);
			const response = error.json();
			expect(response).to.has.property('props');
			// Seems the ExpError constructor(options collector destroy the object)
			expect(response.props).to.be.deep.equal(options);
		});

		it('Should avoid set the originerror(errorobject) by default', () => {
			const error = new ExpError(
				ErrorTypes.badRequest,
				ErrorHttpCodes.badRequest,
				'Invalid options for your action'
			);
			const response = error.json();
			expect(response).to.not.has.property('errorobject');
		});

		it('Should set the originerror(errorobject) if the argument is set as true', () => {
			const err = new Error('error');
			const options = { errorObject: err, important: true, access: true };
			const error = new ExpError(
				ErrorTypes.badRequest,
				ErrorHttpCodes.badRequest,
				'Invalid options for your action',
				options
			);
			const response = error.json(true);
			expect(response).to.has.property('errorobject');
		});

	});

});
