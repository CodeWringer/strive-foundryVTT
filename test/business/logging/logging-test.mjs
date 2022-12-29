import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import { ConsoleLoggingStrategy } from '../../../business/logging/console-logging-strategy.mjs';
import { LogLevels } from '../../../business/logging/base-logging-strategy.mjs';

describe('ConsoleLoggingStrategy', function() {
  describe('logVerbose', function() {
    it('calls underlying log once', function() {
      const logger = new ConsoleLoggingStrategy();
      logger.logLevel = LogLevels.VERBOSE;
      
      sinon.spy(logger, "log");
      logger.logVerbose("Verbose");
      logger.log.should.be.calledOnce();
    });
  });

  describe('logDebug', function() {
    it('calls underlying log once', function() {
      const logger = new ConsoleLoggingStrategy();
      logger.logLevel = LogLevels.VERBOSE;
      
      sinon.spy(logger, "log");
      logger.logDebug("Verbose");
      logger.log.should.be.calledOnce();
    });
  });

  describe('logWarn', function() {
    it('calls underlying log once', function() {
      const logger = new ConsoleLoggingStrategy();
      logger.logLevel = LogLevels.VERBOSE;
      
      sinon.spy(logger, "log");
      logger.logWarn("Verbose");
      logger.log.should.be.calledOnce();
    });
  });

  describe('logError', function() {
    it('calls underlying log once', function() {
      const logger = new ConsoleLoggingStrategy();
      logger.logLevel = LogLevels.VERBOSE;
      
      sinon.spy(logger, "log");
      logger.logError("Verbose");
      logger.log.should.be.calledOnce();
    });
  });
});
