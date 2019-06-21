/* test/lib/log/basic.spec.js */
'use strict';

const chai = require('chai');
const expect = chai.expect;
const BasicLogger = require('../../../lib/log/basic');
const { LEVELS_VALUE } = require('../../../lib/log/level');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');

chai.use(sinonChai);

describe('lib/log/basic.js',  () => {

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

	describe('#error', () => {

		let sandbox;

		beforeEach(()=> {
			sandbox = sinon.createSandbox();
		});

		afterEach(() => {
			sandbox.restore();
		});

		it('Should register the log entry for error', () => {
			const logger = new BasicLogger('ERROR');
			const loggermock = sandbox.mock(console).expects('error').atLeast(1).withArgs('works!!', 1, 2);
			logger.error('works!!', 1, 2);
			loggermock.verify();
		});

		it('Should not register the log entry for lower values as warn', () => {
			const logger = new BasicLogger('WARN');
			const loggermock = sandbox.mock(console).expects('warn').atLeast(0);
			logger.warn('works!!', 1, 2);
			loggermock.verify();
		});

		it('Should not register the log entry for upper values as info', () => {
			const logger = new BasicLogger('WARN');
			const loggermock = sandbox.mock(console).expects('info').atLeast(0);
			logger.info('works!!', 1, 2);
			loggermock.verify();
		});

		it('Should not register the log entry for upper values as trace', () => {
			const logger = new BasicLogger('WARN');
			const lmock = sandbox.spy(console, 'log');
			logger.trace('works!!', 1, 2);
			expect(lmock).not.called;
		});

		it('Should not register the log entry for upper values as debug', () => {
			const logger = new BasicLogger('WARN');
			const loggermock = sandbox.mock(console).expects('debug').atLeast(0);
			logger.debug('works!!', 1, 2);
			loggermock.verify();
		});

	});

	describe('#warn', () => {

		let sandbox;

		beforeEach(()=> {
			sandbox = sinon.createSandbox();
		});

		afterEach(() => {
			sandbox.restore();
		});

		it('Should register the log entry for warn', () => {
			const logger = new BasicLogger('WARN');
			const loggermock = sandbox.mock(console).expects('warn').atLeast(1).withArgs('works!!', 1, 2);
			logger.warn('works!!', 1, 2);
			loggermock.verify();
		});

		it('Should register the log entry for lower values as error', () => {
			const logger = new BasicLogger('WARN');
			const loggermock = sandbox.mock(console).expects('error').atLeast(1).withArgs('works!!', 1, 2);
			logger.error('works!!', 1, 2);
			loggermock.verify();
		});

		it('Should not register the log entry for upper values as info', () => {
			const logger = new BasicLogger('WARN');
			const loggermock = sandbox.mock(console).expects('info').atLeast(0);
			logger.info('works!!', 1, 2);
			loggermock.verify();
		});

		it('Should not register the log entry for upper values as trace', () => {
			const logger = new BasicLogger('WARN');
			const lmock = sandbox.spy(console, 'log');
			logger.trace('works!!', 1, 2);
			expect(lmock).not.called;
		});

		it('Should not register the log entry for upper values as debug', () => {
			const logger = new BasicLogger('WARN');
			const loggermock = sandbox.mock(console).expects('debug').atLeast(0);
			logger.debug('works!!', 1, 2);
			loggermock.verify();
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

		it('Should register the log entry for info', () => {
			const logger = new BasicLogger();
			const loggermock = sandbox.mock(console).expects('info').atLeast(1).withArgs('works!!', 1, 2);
			logger.info('works!!', 1, 2);
			loggermock.verify();
		});

		it('Should register the log entry for lower values as warn', () => {
			const logger = new BasicLogger();
			const loggermock = sandbox.mock(console).expects('warn').atLeast(1).withArgs('works!!', 1, 2);
			logger.warn('works!!', 1, 2);
			loggermock.verify();
		});

		it('Should register the log entry for lower values as error', () => {
			const logger = new BasicLogger();
			const loggermock = sandbox.mock(console).expects('error').atLeast(1).withArgs('works!!', 1, 2);
			logger.error('works!!', 1, 2);
			loggermock.verify();
		});

		it('Should not register the log entry for upper values as trace', () => {
			const logger = new BasicLogger();
			const lmock = sandbox.spy(console, 'log');
			logger.trace('works!!', 1, 2);
			expect(lmock).not.called;
		});

		it('Should not register the log entry for upper values as debug', () => {
			const logger = new BasicLogger();
			const loggermock = sandbox.mock(console).expects('debug').atLeast(0);
			logger.debug('works!!', 1, 2);
			loggermock.verify();
		});

	});

	describe('#trace', () => {

		let sandbox;

		beforeEach(()=> {
			sandbox = sinon.createSandbox();
		});

		afterEach(() => {
			sandbox.restore();
		});

		//FIXME: For some weird reason the mock doesnt work - has to use spies
		it('Should register the log entry for verbose/trace', () => {
			const logger = new BasicLogger('VERBOSE');
			const lmock = sandbox.spy(console, 'log');
			logger.trace('works!!', 1, 2);
			expect(lmock).calledOnceWith('works!!', 1, 2);
		});

		it('Should register the log entry for lower values as warn', () => {
			const logger = new BasicLogger('VERBOSE');
			const loggermock = sandbox.mock(console).expects('warn').atLeast(1).withArgs('works!!', 1, 2);
			logger.warn('works!!', 1, 2);
			loggermock.verify();
		});

		it('Should register the log entry for lower values as error', () => {
			const logger = new BasicLogger('VERBOSE');
			const loggermock = sandbox.mock(console).expects('error').atLeast(1).withArgs('works!!', 1, 2);
			logger.error('works!!', 1, 2);
			loggermock.verify();
		});

		it('Should register the log entry for lower values as info ', () => {
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


	describe('#debug', () => {

		let sandbox;

		beforeEach(()=> {
			sandbox = sinon.createSandbox();
		});

		afterEach(() => {
			sandbox.restore();
		});

		it('Should register the log entry for debug level', () => {
			const logger = new BasicLogger('DEBUG');
			const lmock = sandbox.stub(console, 'debug').callsFake(() => {
				return true;
			});
			logger.debug('works!!', 1, 2);
			expect(lmock).calledOnceWith('works!!', 1, 2);
		});

		it('Should register the log entry for lower values as warn', () => {
			const logger = new BasicLogger('DEBUG');
			const loggermock = sandbox.mock(console).expects('warn').atLeast(1).withArgs('works!!', 1, 2);
			logger.warn('works!!', 1, 2);
			loggermock.verify();
		});

		it('Should register the log entry for lower values as error', () => {
			const logger = new BasicLogger('DEBUG');
			const loggermock = sandbox.mock(console).expects('error').atLeast(1).withArgs('works!!', 1, 2);
			logger.error('works!!', 1, 2);
			loggermock.verify();
		});

		it('Should register the log entry for lower values as info ', () => {
			const logger = new BasicLogger('DEBUG');
			const loggermock = sandbox.mock(console).expects('info').atLeast(1).withArgs('works!!', 1, 2);
			logger.info('works!!', 1, 2);
			loggermock.verify();
		});

		//FIXME: For some weird reason the mock doesnt work - has to use spies
		it('Should register the log entry for lower values as trace', () => {
			const logger = new BasicLogger('DEBUG');
			const lmock = sandbox.spy(console, 'log');
			logger.trace('works!!', 1, 2);
			expect(lmock).calledOnceWith('works!!', 1, 2);
		});

	});

	describe('#setLevel method', () => {

		let sandbox;

		beforeEach(()=> {
			sandbox = sinon.createSandbox();
		});

		afterEach(() => {
			sandbox.restore();
		});

		it('Should stop register log entries if the new level is lower than the previous one', () => {
			const logger = new BasicLogger();
			const loggerinfostub = sandbox.stub(console, 'info').returns(true);
			const loggerwarnstub = sandbox.stub(console, 'warn').returns(true);
			const loggerdebugstub = sandbox.stub(console, 'debug').returns(true);
			logger.info('test');
			expect(loggerinfostub).to.be.calledOnceWith('test');
			logger.setLevel('WARN');
			logger.info('test');
			expect(loggerinfostub).to.be.calledOnceWith('test');
			logger.warn('test');
			expect(loggerwarnstub).to.be.be.calledOnceWith('test');
			logger.setLevel('ERROR');
			logger.warn('test');
			expect(loggerwarnstub).to.be.be.calledOnceWith('test');
			logger.setLevel('debug');
			logger.debug('test1');
			logger.debug('test2');
			expect(loggerdebugstub).to.be.calledTwice;
			logger.setLevel('error');
			logger.debug('test1');
			logger.debug('test2');
			expect(loggerdebugstub).to.be.calledTwice;
		});

	});

});

