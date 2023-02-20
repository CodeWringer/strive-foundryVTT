import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import { EventEmitter } from '../../common/event-emitter.mjs';

describe("EventEmitter", () => {
  describe("on & emit", () => {
    it("Registers an event and emits it repeatedly", () => {
      // Given
      const given = new EventEmitter();
      const givenEvent = "givenEvent";
      let calls = 0;
      const givenCallback = () => {
        calls++;
      }
      // When & Then
      calls.should.be.equal(0);
      const eventId = given.on(givenEvent, givenCallback);
      given.emit(givenEvent);
      calls.should.be.equal(1);
      given.emit(givenEvent);
      calls.should.be.equal(2);
    });
  });

  describe("once & emit", () => {
    it("Registers an event and emits it once", () => {
      // Given
      const given = new EventEmitter();
      const givenEvent = "givenEvent";
      let calls = 0;
      const givenCallback = () => {
        calls++;
      }
      // When & Then
      calls.should.be.equal(0);
      const eventId = given.once(givenEvent, givenCallback);
      given.emit(givenEvent);
      calls.should.be.equal(1);
      given.emit(givenEvent);
      calls.should.be.equal(1);
    });
  });

  describe("off & emit", () => {
    it("Registers an event and emits it then unregisters it", () => {
      // Given
      const given = new EventEmitter();
      const givenEvent = "givenEvent";
      let calls = 0;
      const givenCallback = () => {
        calls++;
      }
      // When & Then
      calls.should.be.equal(0);
      const eventId = given.once(givenEvent, givenCallback);
      given.emit(givenEvent);
      calls.should.be.equal(1);
      given.off(eventId);
      given.emit(givenEvent);
      calls.should.be.equal(1);
    });
  });

  describe("allOff", () => {
    it("Unregisters all events", () => {
      // Given
      const given = new EventEmitter();

      const givenEvent1 = "givenEvent1";
      const givenEvent2 = "givenEvent2";
      const givenEvent3 = "givenEvent3";

      const givenCallback1 = sinon.fake();
      const givenCallback2 = sinon.fake();
      const givenCallback3 = sinon.fake();

      given.on(givenEvent1, givenCallback1);
      given.on(givenEvent2, givenCallback2);
      given.on(givenEvent3, givenCallback3);

      // Sanity
      givenCallback1.should.not.have.been.called();
      givenCallback2.should.not.have.been.called();
      givenCallback3.should.not.have.been.called();

      // When
      given.allOff(givenEvent1);
      given.allOff(givenEvent2);
      given.allOff(givenEvent3);

      given.emit(givenEvent1);
      given.emit(givenEvent2);
      given.emit(givenEvent3);

      // Then
      givenCallback1.should.not.have.been.called();
      givenCallback2.should.not.have.been.called();
      givenCallback3.should.not.have.been.called();
    });
  });

  describe("bind", () => {
    // Given
    const given = new EventEmitter();
    const givenOther = {};

    // Sanity
    should.equal(givenOther.on, undefined);
    should.equal(givenOther.once, undefined);
    should.equal(givenOther.off, undefined);
    should.equal(givenOther.allOff, undefined);
    should.equal(givenOther.emit, undefined);
    
    // When
    given.bind(givenOther);
    
    // Then
    should.notEqual(givenOther.on, undefined);
    should.notEqual(givenOther.once, undefined);
    should.notEqual(givenOther.off, undefined);
    should.notEqual(givenOther.allOff, undefined);
    should.notEqual(givenOther.emit, undefined);
  });
});