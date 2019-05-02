/* test/lib/error/index.spec.js */
'use strict';

const chai = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const expect = chai.expect;
chai.use(sinonChai);
const Errors = require('lib/error');

describe.only('lib/error/index.js',  () => {

	describe('#ExpressifError', () => {
		let ExpressifError;

		beforeEach(() => {
			ExpressifError = Errors.ExpressifError;
		});

		it('Should the ExpressifError be available in the lib/error module', () => {
			expect(Errors).to.has.property('ExpressifError');
		});

		it('Should ExpressifError be an abstract class an avoid create instances', () => {
			expect(() => {
				const nerror = new ExpressifError();
			}).to.throw(TypeError);
		});

	});

	describe('#ServerError', () => {
		let ServerError, ExpressifError;

		beforeEach(() => {
			ServerError = Errors.ServerError;
			ExpressifError = Errors.ExpressifError;
		});

		it('Should the ServerError be available in the lib/error module', () => {
			expect(Errors).to.has.property('ServerError');
		});

		it('Should ServerError be a instance of Error and ExpressifError', () => {
			const nerror = new ServerError();
			expect(nerror).be.instanceOf(ExpressifError);
			expect(nerror).be.instanceOf(Error);
		});

		it('Should ServerError has a name property with the same value as the Constructor Name', () => {
			const nerror = new ServerError();
			expect(nerror).to.has.property('name', 'ServerError');
		});

		it('Should ServerError has a message as 1st argument', () => {
			const msg = 'error message';
			const nerror = new ServerError(msg);
			expect(nerror).to.has.property('message', msg);
		});

		it('Should ServerError set a default value(empty string) for the message argument', () => {
			const error =	new ServerError();
			expect(error.message).to.be.empty;
		});

		it('Should ServerError has a default httpstatus value of 500(server error)', () => {
			const msg = 'error message';
			const nerror = new ServerError(msg);
			expect(nerror).to.has.property('httpstatus', 500);
		});

		it('Should ServerError set a new value of httpstatus overwriting the default value if the property httpstatus is set in the options argument', () => {
			const msg = 'error message';
			const nerror = new ServerError(msg, { httpstatus: 404 });
			expect(nerror).to.has.property('httpstatus', 404);
		});

		it('Should ServerError has a errorObject as empty object by default', () => {
			const msg = 'error message';
			const nerror = new ServerError(msg);
			expect(nerror).to.has.property('errorObject');
			expect(nerror.errorObject).to.be.deep.equal({});
		});

		it('Should ServerError set a errorObject if the property errorObject is set in the options argument', () => {
			const sourceerror = { error: true, origin: 'not'};
			const nerror = new ServerError('custom error', { errorObject: sourceerror });
			expect(nerror.errorObject).to.be.deep.equal(sourceerror);
		});

		it('Should ServerError set a params aditional property if the options argument has extre properties not required by the constructor',  () => {
			const options = { error: true, origin: 'not', errorObject: { source: true}};
			const nerror = new ServerError('custom error', options);
			const { errorObject, ...props } = options;
			expect(nerror.props).to.be.deep.equal(props);
		});

		it('Should ServerError display a string when it printed in console or by a log class', () => {
			const nerror = new ServerError('custom error');
			expect(nerror.toString()).to.be.not.empty;
			expect(nerror.toString()).to.contain(`[500]custom error`);
		});

	});

});
