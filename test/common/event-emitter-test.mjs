import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import { EventEmitter } from '../../common/event-emitter.mjs';

describe("EventEmitter", () => {
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