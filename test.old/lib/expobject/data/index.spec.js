/* test/lib/expobject/data/index.spec.js */
'use strict';

const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);
const ExpressifObject = require('lib/expobject');
const HttpTypes = ExpressifObject.EXPRESSIF_HTTP_TYPES;
const HttpCodes= ExpressifObject.EXPRESSIF_HTTP_CODES;

describe('lib/expobject/data/index.js',  () => {

	describe('#ExpData', () => {
		let ExpData;

		beforeEach(() => {
			ExpData = ExpressifObject.ExpData;
		});

		it('Should has a property data as empty by default object that represent the Body response ', () => {
			const response = new ExpData();
			expect(response).to.has.property('data')
			expect(response.data).to.be.empty;
		});

		it('Should has a property data that represent the Body response ', () => {
			const d = { a: 1, b: 2, c : [ 1, 2, 3, 4, { a:1, b:true}]};
			const response = new ExpData(HttpTypes.noContent, HttpCodes.noContent, d);
			expect(response).to.has.property('data')
			expect(response.data).to.be.deep.equal(d);
		});

		it('Should has a property type as Ok by default', () => {
			const response = new ExpData();
			expect(response).to.has.property('type', HttpTypes.oK)
		});

		it('Should has a property httpstatus as Ok by default', () => {
			const response = new ExpData();
			expect(response).to.has.property('httpstatus', HttpCodes.oK)
		});

		it('Should be possible to set the type property based on the types', () => {
			const response = new ExpData(HttpTypes.noContent, null, {});
			expect(response).to.has.property('type', HttpTypes.noContent);
		});

		it('Should be possible to set the type property based on custom string', () => {
			const response = new ExpData('ValidUser', null, {});
			expect(response).to.has.property('type', 'ValidUser');
		});

		it('Should be possible to set the httpstatus property based on the httpstatus', () => {
			const response = new ExpData(HttpTypes.noContent, HttpCodes.noContent);
			expect(response).to.has.property('httpstatus', HttpCodes.noContent);
		});

		it('Should be possible to set the httpstatus property based on random code', () => {
			const response = new ExpData(HttpTypes.noContent, 200.11);
			expect(response).to.has.property('httpstatus', 200.11);
		});

		it('Should set the props property with custom properties', () => {
			const props = { a:1 , b:2, c:3 };
			const response = new ExpData(HttpTypes.noContent, HttpCodes.noContent, {}, props);
			expect(response).to.has.property('props');
			expect(response.props).to.be.deep.equal(props);
		});

		it('Should set the props property with custom properties and the adheaders', () => {
			const props = { a:1 , b:2, c:3, adheaders: { header1: 1, header2: 2} };
			const response = new ExpData(HttpTypes.noContent, HttpCodes.noContent, {}, props);
			expect(response).to.has.property('props');
			expect(response.props).to.be.deep.equal({ a:1 , b:2, c:3 });
			expect(response.adheaders).to.be.deep.equal(props.adheaders);
		});

		it('Should hasAdditionalHeaders return true when the adheaders option is valid', () => {
			const props = { a:1 , b:2, c:3, adheaders: { header1: 1, header2: 2} };
			const response = new ExpData(HttpTypes.noContent, HttpCodes.noContent, {}, props);
			expect(response.hasAdditionalHeaders).to.be.true;
		});

		it('Should hasAdditionalHeaders return false when the are not adheader in the options object', () => {
			const props = { a:1 , b:2, c:3 };
			const response = new ExpData(HttpTypes.noContent, HttpCodes.noContent, {}, props);
			expect(response.hasAdditionalHeaders).to.be.false;
		});

		it('Should the json method return an object with the common properties for the expData instance', () => {
			const props = { a:1 , b:2, c:3 };
			const response = new ExpData(HttpTypes.noContent, HttpCodes.noContent, {arr: [1,2,3]}, props);
			const json = response.json();
			expect(json).to.be.an('object');
			expect(json).to.has.property('httpstatus', HttpCodes.noContent)
			expect(json).to.has.property('type', HttpTypes.noContent)
			expect(json).to.has.property('data');
			expect(json.data).to.be.deep.equal({arr: [1,2,3]});
			expect(json).to.has.property('props');
			expect(json.props).to.be.deep.equal(props);
		});

	});

});
