'use strict';

const chai = require("chai");
const assert = chai.assert;
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);
const RESPOND = require('../../../lib/respond');
const ERROR = require('../../../lib/exception');
const MERESP = require('../../mock/express/response.js');

describe('lib/respond/index.js', function () {

	describe('#respondNotAuthorized', function () {

		const req = {};
		const res = new MERESP();
		const e = new ERROR.BadAuth('JWT Authorization is required', ERROR.codes.JWT_CREDS_REQUIRED);
		const sendResp = RESPOND.notAuthorized(res, req, e);

		it('should send response with x-error-code header equal to error code',
			function () {
				assert.equal(sendResp._header['X-Error-Code'], e.code, "Error codes should match");
			}
		);
		it('should send response with no body',
			function () {
				assert.isUndefined(sendResp.body, "No body for error returns");
			}
		);
	});

	describe('#wrapSuccessData', () => {
		let wrapSuccessData;
		before(()=>{
			wrapSuccessData = RESPOND.wrapSuccessData;
		});

		it('Should return an object with the data property based on the first argument',  () => {
			const data = { data: true , test: 1, test: 2};
			const r = wrapSuccessData(data);
			expect(r).to.has.property('data')
			expect(r.data).to.be.deep.equal(data);
		});

		it('Should return an object with the path property based on the second argument', () => {
			const data = { data: true , test: 1, test: 2};
			const path = '/test';
			const r = wrapSuccessData(data, path);
			expect(r).to.has.property('path', path)
		});

		it('Should return a empty object as data by default if the first argument is not provided', () => {
			const r = wrapSuccessData();
			expect(r).to.has.property('data');
			expect(r.data).to.be.empty;
		});

		it('Should remove the type propery from the wrapped object if the path is not valid(unidefied, null..)', () => {
			const data = { data: true , test: 1, test: 2};
			let r = wrapSuccessData(data);
			expect(r).to.not.have.property('path');
			r = wrapSuccessData(data, null);
			expect(r).to.not.have.property('path');
			r = wrapSuccessData(data, undefined);
			expect(r).to.not.have.property('path');
			r = wrapSuccessData(data, false);
			expect(r).to.not.have.property('path');
		});

		it('Should return an object with the options property as an empty object by default', () => {
			const data = { data: true , test: 1, test: 2};
			const r = wrapSuccessData(data);
			expect(r).to.have.property('options');
			expect(r.options).to.be.empty;
		});

		it('Should return an object with the options property based on the 3rd argument', () => {
			const data = { data: true , test: 1, test: 2};
			const options = { opt: true };
			const r = wrapSuccessData(data, '/test', options);
			expect(r).to.have.property('options');
			expect(r.options).to.be.deep.equal(options);
		});

		it('Should return an object with the options property and the path property should not exists  if the type argument is an object', () => {
			const data = { data: true , test: 1, test: 2};
			const options = { opt: true };
			const r = wrapSuccessData(data, options);
			expect(r).to.have.property('options');
			expect(r.options).to.be.deep.equal(options);
			expect(r).to.not.have.property('path');
		});

	});

});
