import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import { ConsoleLoggingStrategy } from '../logging/console-logging-strategy.mjs';
import { LogLevels } from '../logging/base-logging-strategy.mjs';

describe('ConsoleLoggingStrategy', function() {
  describe('log verbose', function() {
    it('should call underlying _log once', function() {
      const logger = new ConsoleLoggingStrategy();
      logger.logLevel = LogLevels.VERBOSE;
      
      sinon.spy(logger, "_log");
      logger.logVerbose("Verbose");
      logger._log.should.be.calledOnce();
    });

    it('should not call underlying _error', function() {
      const logger = new ConsoleLoggingStrategy();
      logger.logLevel = LogLevels.ERROR;
    
      sinon.spy(logger, "_error");
      logger.logVerbose("Verbose");
      logger._error.should.have.callCount(0);
    });
  });
  
  describe('log debug', function() {
    it('should call underlying _log once', function() {
      const logger = new ConsoleLoggingStrategy();
      logger.logLevel = LogLevels.DEBUG;
      
      sinon.spy(logger, "_log");
      logger.logDebug("Debug");
      logger._log.should.be.calledOnce();
    });
  });
  
  describe('log warning', function() {
    it('should call underlying _warn once', function() {
      const logger = new ConsoleLoggingStrategy();
      logger.logLevel = LogLevels.WARN;
      
      sinon.spy(logger, "_warn");
      logger.logWarn("Warning");
      logger._warn.should.be.calledOnce();
    });
  });
  
  describe('log error', function() {
    it('should call underlying _error once', function() {
      const logger = new ConsoleLoggingStrategy();
      logger.logLevel = LogLevels.ERROR;
    
      sinon.spy(logger, "_error");
      logger.logError("Error");
      logger._error.should.be.calledOnce();
    });
  });
});
