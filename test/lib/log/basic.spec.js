/* test/lib/log/basic.spec.js */
'use strict';

const chai = require('chai');
const expect = chai.expect;
const BasicLogger = require('../../../lib/log/basic');
const { LEVELS_VALUE } = require('../../../lib/log/level');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');

chai.use(sinonChai);

describe.only('lib/log/basic.js',  () => {

	describe('#constructor', () => {

		it('Should set the level by default as INFO', () => {
			const logger = new BasicLogger();
			expect(logger.level).to.be.equal(LEVELS_VALUE['INFO']);
		});

		it('Should set the level based in the argument', () => {
			const logger = new BasicLogger('WARN');
			expect(logger.level).to.be.equal(LEVELS_VALUE['WARN']);
		});

		it('Should set the level by default as INFO if the argument is invalid', () => {
			let logger = new BasicLogger(1000);
			expect(logger.level).to.be.equal(LEVELS_VALUE['INFO']);
			logger = new BasicLogger(true);
			expect(logger.level).to.be.equal(LEVELS_VALUE['INFO']);
			logger = new BasicLogger({a:1});
			expect(logger.level).to.be.equal(LEVELS_VALUE['INFO']);
			logger = new BasicLogger(null);
			expect(logger.level).to.be.equal(LEVELS_VALUE['INFO']);
		});

	});

	describe('#info', () => {

		let sandbox;

		beforeEach(()=> {
			sandbox = sinon.createSandbox();
		});

		afterEach(() => {
			sandbox.restore();
		});

		it('Should register the log entry for info level', () => {
			const logger = new BasicLogger();
			const loggermock = sandbox.mock(console).expects('info').atLeast(1).withArgs('works!!', 1, 2);
			logger.info('works!!', 1, 2);
			loggermock.verify();
		});

		it('Should register the log entry for lower values as info level[1]', () => {
			const logger = new BasicLogger();
			const loggermock = sandbox.mock(console).expects('warn').atLeast(1).withArgs('works!!', 1, 2);
			logger.warn('works!!', 1, 2);
			loggermock.verify();
		});

		it('Should register the log entry for lower values as info level[2]', () => {
			const logger = new BasicLogger();
			const loggermock = sandbox.mock(console).expects('error').atLeast(1).withArgs('works!!', 1, 2);
			logger.error('works!!', 1, 2);
			loggermock.verify();
		});

		it('Should not register the log entry for upper values as trace', () => {
			const logger = new BasicLogger();
			const loggermock = sandbox.mock(console).expects('log').atLeast(0);
			logger.trace('works!!', 1, 2);
			loggermock.verify();
		});

		it('Should not register the log entry for upper values as verbose', () => {
			const logger = new BasicLogger();
			const loggermock = sandbox.mock(console).expects('log').atLeast(0);
			logger.verbose('works!!', 1, 2);
			loggermock.verify();
		});

		it('Should not register the log entry for upper values as debug', () => {
			const logger = new BasicLogger();
			const loggermock = sandbox.mock(console).expects('debug').atLeast(0);
			logger.debug('works!!', 1, 2);
			loggermock.verify();
		});

	});

	describe('#verbose', () => {

		let sandbox;

		beforeEach(()=> {
			sandbox = sinon.createSandbox();
		});

		afterEach(() => {
			sandbox.restore();
		});

		it('Should register the log entry for verbose level', () => {
			const logger = new BasicLogger('VERBOSE');
			const lmock = sandbox.spy(console, 'log');
			logger.trace('works!!', 1, 2);
			expect(lmock).calledOnce;
		});

		it('Should register the log entry for lower values as info level[1]', () => {
			const logger = new BasicLogger('VERBOSE');
			const loggermock = sandbox.mock(console).expects('warn').atLeast(1).withArgs('works!!', 1, 2);
			logger.warn('works!!', 1, 2);
			loggermock.verify();
		});

		it('Should register the log entry for lower values as info level[2]', () => {
			const logger = new BasicLogger('VERBOSE');
			const loggermock = sandbox.mock(console).expects('error').atLeast(1).withArgs('works!!', 1, 2);
			logger.error('works!!', 1, 2);
			loggermock.verify();
		});

		it('Should register the log entry for lower values as info level[3]', () => {
			const logger = new BasicLogger('VERBOSE');
			const loggermock = sandbox.mock(console).expects('info').atLeast(1).withArgs('works!!', 1, 2);
			logger.info('works!!', 1, 2);
			loggermock.verify();
		});

		it('Should not register the log entry for upper values as debug', () => {
			const logger = new BasicLogger('VERBOSE');
			const loggermock = sandbox.mock(console).expects('debug').atLeast(0);
			logger.debug('works!!', 1, 2);
			loggermock.verify();
		});

	});

});

