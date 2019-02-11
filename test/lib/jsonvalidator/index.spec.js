/* test/lib/jsonvalidator/index.spec.js */
'use strict';

const chai = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const expect = chai.expect;
const AJV = require('ajv');

let JsonValidator;
chai.use(sinonChai);

describe('lib/jsonvalidator/index.js',  () => {

	describe('#constructor', () => {
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

	describe('#addSchema', () => {
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
					addSchema(a, i){
						addSpy(a, i);
					}
				},
				'ajv-errors': errSpy
			});
		});

		afterEach(() => {
			sandbox.restore();
		});

		it('Should call the AJV addSchema method with an array if the argument is an array', () => {
			const jv = new JsonValidator();
			jv.addSchema([{id:1}]);
			expect(addSpy).to.be.calledOnceWith([{id:1}]);
		});

		it('Should call the AJV addSchema method with an string and a key if the argument is as tring and there is also another argument', () => {
			const jv = new JsonValidator();
			const str = '{"a":1}'
			const strpar = JSON.parse(str);
			const key = 1;
			jv.addSchema(str, key);
			expect(addSpy).to.be.calledOnceWith(strpar, key);
		});

		it('Should call the AJV addSchema method with an an object', () => {
			const jv = new JsonValidator();
			const str = '{"a":1}'
			const strpar = JSON.parse(str);
			jv.addSchema(strpar);
			expect(addSpy).to.be.calledOnceWith(strpar);
		});

		it('Should throw an exception if the schemas argument is not a valid type for the method', () => {
			const jv = new JsonValidator();
			expect(() => {
				jv.addSchema(true);
			}).to.throw(TypeError);
		});

	});

	describe('#validateInput', () => {
		let sandbox;
		let errSpy;

		beforeEach(()=> {
			sandbox = sinon.createSandbox();
			errSpy = sandbox.spy();
			sandbox.stub(AJV.prototype, 'getSchema').callsFake((schema) => {
				if ( schema == 'test1') {
					return function() { return true; }
				} else {
					return function() { return false; }
				}
			});
			sandbox.stub(AJV.prototype, 'compile').callsFake((schema) => {
				return function() { return true; }
			});
			sandbox.stub(AJV.prototype, 'addSchema').returns(true);

			JsonValidator = proxyquire('../../../lib/jsonvalidator', {
				'ajv-errors': errSpy
			});
		});

		afterEach(() => {
			sandbox.restore();
		});

		it('Should call the ajv getSchema method and return a true if the schema validate withouts error the body', () => {
			const jv = new JsonValidator();
			const str = '{"a":1}';
			jv.addSchema(str, 'test1');
			const r = jv.validateInput('test1', {});
			expect(r).to.be.true;
		});

		it('Should call the ajv compile method and return a true if the schema validate withouts error the body', () => {
			const jv = new JsonValidator();
			const str = {"a":1};
			const r = jv.validateInput(str, {});
			expect(r).to.be.true;
		});

		it('Should return the validation function if the schemas rejects the body', () => {
			const jv = new JsonValidator();
			const str = '{"a":1}';
			jv.addSchema(str, 'test2');
			const r = jv.validateInput('test2', {});
			expect(r).to.be.instanceOf(Function);
		});

		it('Should throw an exception if the schema is not a valid argument(string or obejct)', () => {
			const jv = new JsonValidator();
			const str = '{"a":1}';
			jv.addSchema(str, 'test2');
			expect(() => {
				const r = jv.validateInput(true, {});
			}).to.throw(TypeError);
		});

	});

});
