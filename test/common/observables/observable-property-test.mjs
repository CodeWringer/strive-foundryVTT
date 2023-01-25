import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import ObservableProperty from '../../../common/observables/observable-property.mjs';

describe("ObservableProperty", () => {
  it("invokes callback when the value is changed", () => {
    // Given
    const givenCurrentValue = 42;
    const givenNewValue = 55;
    let calls = 0;
    
    const givenCallback = (oldValue, newValue) => {
      calls++;
    };
    const spy = sinon.spy(givenCallback);

    const given = new ObservableProperty({
      value: givenCurrentValue,
      onChange: spy,
    });
    // Sanity
    calls.should.be.equal(0);
    given.value.should.be.equal(givenCurrentValue);
    // When
    given.value = givenNewValue;
    // Then
    spy.should.have.been.calledOnce();
    calls.should.be.equal(1);
    given.value.should.be.equal(givenNewValue);
  });
});