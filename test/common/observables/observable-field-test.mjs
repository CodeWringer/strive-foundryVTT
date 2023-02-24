import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import ObservableField from '../../../common/observables/observable-field.mjs';

describe("ObservableField", () => {
  it("accepts the given initial value", () => {
    // Given
    const givenInitialValue = 42;
    
    const given = new ObservableField({
      value: givenInitialValue,
    });
    // Then
    given.value.should.be.equal(givenInitialValue);
  });

  it("invokes callback when the value is changed", () => {
    // Given
    const givenCurrentValue = 42;
    const givenNewValue = 55;
    
    const given = new ObservableField({
      value: givenCurrentValue,
    });

    const spy = sinon.fake();
    given.onChange(spy);
    // Sanity
    given.value.should.be.equal(givenCurrentValue);
    // When
    given.value = givenNewValue;
    // Then
    spy.should.have.been.calledOnce();
    spy.should.have.been.calledWith(givenCurrentValue, givenNewValue);
    given.value.should.be.equal(givenNewValue);
  });

  it("un-registers a callback as expected", () => {
    // Given
    const givenCurrentValue = 42;
    const givenNewValue1 = 55;
    const givenNewValue2 = -99;
    
    const given = new ObservableField({
      value: givenCurrentValue,
    });

    const spy = sinon.fake();
    const callbackId = given.onChange(spy);
    // Sanity
    given.value.should.be.equal(givenCurrentValue);
    spy.should.not.have.been.called();
    // When
    given.value = givenNewValue1;
    given.offChange(callbackId);
    given.value = givenNewValue2;
    // Then
    spy.should.have.been.calledOnce();
    spy.should.have.been.calledWith(givenCurrentValue, givenNewValue1);
    given.value.should.be.equal(givenNewValue2);
  });
});