/* test/lib/log/index.spec.js */
'use strict';

const chai = require('chai');
const expect = chai.expect;
const LoggerOptions = require('../../../lib/log');


describe('lib/log/index.js',  () => {

	describe('availables loggers', () => {

		it('Should has the BasicLogger as property', () => {
			expect(LoggerOptions).to.has.property('BasicLogger');
		});

	});

});

