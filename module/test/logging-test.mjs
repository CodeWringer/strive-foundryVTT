import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import { ConsoleLoggingStrategy } from '../logging/console-logging-strategy.mjs';

describe('ConsoleLoggingStrategy', function() {
  describe('log verbose', function() {
    it('should call underlying log once', function() {
      const logger = new ConsoleLoggingStrategy();
    
      sinon.spy(logger, "log");
      logger.logVerbose("Verbose");
      logger.log.should.be.calledOnce();
    });
  });

  describe('log debug', function() {
    it('should call underlying log once', function() {
      const logger = new ConsoleLoggingStrategy();
    
      sinon.spy(logger, "log");
      logger.logDebug("Debug");
      logger.log.should.be.calledOnce();
    });
  });
  
  describe('log warning', function() {
    it('should call underlying log once', function() {
      const logger = new ConsoleLoggingStrategy();
    
      sinon.spy(logger, "log");
      logger.logWarn("Warning");
      logger.log.should.be.calledOnce();
    });
  });

  describe('log error', function() {
    it('should call underlying log once', function() {
      const logger = new ConsoleLoggingStrategy();
    
      sinon.spy(logger, "log");
      logger.logError("Error");
      logger.log.should.be.calledOnce();
    });
  });

  describe('bad log level', function() {
    it('should throw exception', function() {
      const logger = new ConsoleLoggingStrategy();
    
      try {
        logger.log(-1, "Invalid");
      } catch (error) {
        should(error.message).be.equal("Invalid log level '-1'");
      }
    });
  });
});
