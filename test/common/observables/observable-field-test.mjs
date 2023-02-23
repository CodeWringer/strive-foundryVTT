import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import ObservableField from '../../../common/observables/observable-field.mjs';

describe("ObservableField", () => {
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
});