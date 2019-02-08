/* test/lib/jsonvalidator/index.spec.js */
'use strict';

const chai = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const expect = chai.expect;

let JsonValidator;
chai.use(sinonChai);

describe('lib/jsonvalidator/index.js',  () => {

	describe.only('#constructor', () => {
		let sandbox;
		let consSpy;
		let errSpy;
		let addSpy;

		beforeEach(()=> {
			sandbox = sinon.createSandbox();
			consSpy = sandbox.spy();
			addSpy = sandbox.spy();
			errSpy = sandbox.spy();
			JsonValidator = proxyquire('../../../lib/jsonvalidator', {
				'ajv': class {
					constructor(){
						consSpy();
					}
					addSchema(){
						addSpy();
					}
				},
				'ajv-errors': errSpy
			});
		});

		afterEach(() => {
			sandbox.restore();
		});


		it('Should call the AJV constructor', () => {
			const jv = new JsonValidator();
			expect(consSpy).to.be.calledOnce;
		});

		it('Should call ajv-errors main function', () => {
			const jv = new JsonValidator();
			expect(errSpy).to.be.calledOnce;
		});

		it('Should set the option property and it should be an object with allError and meta properties', () => {
			const jv = new JsonValidator();
			expect(jv.options).to.an('object');
			expect(jv.options).to.has.property('allErrors', true);
			expect(jv.options).to.has.property('meta');
			expect(jv.options.meta).to.be.an('object');
		});

		it('Should override the default options for the ajv instance', () =>{
			const jv = new JsonValidator([], {allErrors: false, meta: null});
			expect(jv.options).to.an('object');
			expect(jv.options).to.has.property('allErrors', false);
			expect(jv.options).to.has.property('meta', null);
		});

		it('Should set the ajv property', () => {
			const jv = new JsonValidator();
			expect(jv.ajv).to.be.an('object');
		});

		it('Should call the ajv addSchema method if there is an array of schemas to load', () => {
			const jv = new JsonValidator([{ id: 'schema1'}]);
			expect(addSpy).to.be.calledOnce;
		});

		it('Should not call the ajv addSchema method if there is not an array of schemas or it is not valid', () => {
			const jv = new JsonValidator([]);
			expect(addSpy).to.be.called;
		});


	});

});
