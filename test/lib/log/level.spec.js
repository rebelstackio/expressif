/* test/lib/log/level.spec.js */
'use strict';

const chai = require('chai');
const expect = chai.expect;
const { LEVELS_ARR, LEVELS_VALUE, getLevel } = require('../../../lib/log/level');

describe('lib/log/level.js',  () => {

	describe('#LEVELS_ARR', () => {

		it('Should LEVELS_ARR has to be an array', () => {
			expect(LEVELS_ARR).to.be.an('array').of.length(7);
		});

	});

	describe('#LEVELS_VALUE', () => {

		it('Should LEVELS_VALUE has to be an object', () => {
			expect(LEVELS_VALUE).to.be.an('object');
			expect(LEVELS_VALUE).to.has.property('ERROR', 0)
			expect(LEVELS_VALUE).to.has.property('WARN', 1);
			expect(LEVELS_VALUE).to.has.property('INFO', 2);
			expect(LEVELS_VALUE).to.has.property('VERBOSE', 3);
			expect(LEVELS_VALUE).to.has.property('TRACE', 3);
			expect(LEVELS_VALUE).to.has.property('DEBUG', 4);
			expect(LEVELS_VALUE).to.has.property('SILLY',5);
		});

	});

	describe('#getLevel', () => {

		it('Should get the level value based on the argument value', () => {
			let level = getLevel('INFO');
			expect(level).to.be.equal(LEVELS_VALUE['INFO']);
			level = getLevel('VERBOSE');
			expect(level).to.be.equal(LEVELS_VALUE['VERBOSE']);
			level = getLevel('DEBUG');
			expect(level).to.be.equal(LEVELS_VALUE['DEBUG']);
		});

		it('Should get the level value also if the argument is in lowercase', () => {
			const level = getLevel('info');
			expect(level).to.be.equal(LEVELS_VALUE['INFO']);
		});

		it('Should get the level value info by default if the argument is not present', () => {
			const level = getLevel();
			expect(level).to.be.equal(LEVELS_VALUE['INFO']);
		});

		it('Should get the level value info by default if the argument is not valid or throws an exception', () => {
			let level = getLevel(100);
			expect(level).to.be.equal(LEVELS_VALUE['INFO']);
			level = getLevel(true);
			expect(level).to.be.equal(LEVELS_VALUE['INFO']);
			level = getLevel(null);
			expect(level).to.be.equal(LEVELS_VALUE['INFO']);
			level = getLevel({a:1, b:2});
			expect(level).to.be.equal(LEVELS_VALUE['INFO']);
			level = getLevel(undefined);
			expect(level).to.be.equal(LEVELS_VALUE['INFO']);
			level = getLevel(NaN);
			expect(level).to.be.equal(LEVELS_VALUE['INFO']);
		});

	});

});

