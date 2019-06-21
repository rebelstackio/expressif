/* test/lib/expobject/optionscollector.spec.js */
'use strict';

const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);
const optionsCollector = require('lib/expobject/optionscollector');


describe('lib/expobject/optionscollector',  () => {

	describe('#optionsCollector', () => {

		it('Should return the same object if the sources keys are empty', () => {
			const options = { test: true, test2: 0, test3: 2 };
			const result = optionsCollector(options, []);
			expect(result).to.be.deep.equal(Object.assign({}, options, { props: {} }));
		});

		it('Should collect properties and values from a source object based on source( collections of keys for collect )', () => {
			const options = { test: true, test2: 0, test3: 2, test4: 1 };
			const source = [ 'test3', 'test4']
			const result = optionsCollector(options, source);
			expect(result).to.has.property('test3', 2);
			expect(result).to.has.property('test4', 1);
			expect(result).to.not.have.property('test');
			expect(result).to.not.have.property('test2');
		});

		it('Should add the remaining properties inside the props key', () => {
			const options = { test: true, test2: 0, test3: 2, test4: 1 };
			const source = [ 'test3', 'test4']
			const result = optionsCollector(options, source);
			expect(result).to.not.have.property('test');
			expect(result).to.not.have.property('test2');
			expect(result).to.have.property('props');
			expect(result.props).to.be.deep.equal({
				test: true,
				test2: 0
			});
		});

		it('Should use the values expose in the file lib/expobject/options.json as source and collect them', () => {
			const errorObject = { test: true };
			const adheaders = { header1: true, header2: true };
			const options = { test: true, test2: 0, test3: 2 , 	errorObject, adheaders };
			const result = optionsCollector(options);
			expect(result).to.has.property('errorObject');
			expect(result.errorObject).to.be.deep.equal(errorObject);
			expect(result).to.has.property('adheaders');
			expect(result.adheaders).to.be.deep.equal(adheaders);
			expect(result).to.has.property('props');
			expect(result.props).to.has.property('test', true);
			expect(result.props).to.has.property('test2', 0);
			expect(result.props).to.has.property('test3', 2);
		});

		it('Should set empty/undefined values for the target keys for collection ', () => {
			const targetkey = [ "test100" ];
			const options = { test: true, test2: 0, test3: 2 };
			const { test100, props } = optionsCollector(options, targetkey);
			expect(test100).to.be.undefined;
			expect(props).to.has.property('test', true);
			expect(props).to.has.property('test2', 0);
			expect(props).to.has.property('test3', 2);
		});

	});

});
