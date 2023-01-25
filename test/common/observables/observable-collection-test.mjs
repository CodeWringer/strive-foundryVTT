import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import ObservableCollection, { CollectionChangeTypes } from '../../../common/observables/observable-collection.mjs';

describe("ObservableCollection", () => {
  it("accepts given elements", () => {
    // Given
    const givenElements = [1, 2, 3];
    const given = new ObservableCollection({
      elements: givenElements,
    });
    // Then
    given.length.should.be.equal(3);
  });

  it("returns all elements on 'getAll'", () => {
    // Given
    const givenElements = [1, 2, 3];
    const given = new ObservableCollection({
      elements: givenElements,
    });
    // Sanity
    given.length.should.be.equal(3);
    // When
    const elements = given.getAll();
    elements.length.should.be.eql(3);
    elements[0].should.be.eql(1);
  });

  it("invokes callback and change is 'ADD' on 'add'", () => {
    // Given
    const givenCallback = (change, elements) => {
      change.should.be.equal(CollectionChangeTypes.ADD);
      elements.length.should.be.equal(1);
    };
    const given = new ObservableCollection({
      onChange: givenCallback,
    });
    // Sanity
    given.length.should.be.equal(0);
    // When
    given.add(4);
    // Then
    given.length.should.be.equal(1);
    given.get(0).should.be.equal(4);
  });

  it("invokes callback and change is 'ADD' on 'addAt'", () => {
    // Given
    const givenCallback = (change, elements) => {
      change.should.be.equal(CollectionChangeTypes.ADD);
      elements.length.should.be.equal(1);
    };
    const givenElements = [1, 2, 3];
    const given = new ObservableCollection({
      elements: givenElements,
      onChange: givenCallback,
    });
    // Sanity
    given.length.should.be.equal(3);
    // When
    given.addAt(0, 4);
    // Then
    given.length.should.be.equal(4);
    given.get(0).should.be.equal(4);
  });

  it("invokes callback and change is 'ADD' on 'addAll'", () => {
    // Given
    const givenCallback = (change, elements) => {
      change.should.be.equal(CollectionChangeTypes.ADD);
      elements.length.should.be.equal(3);
    };
    const givenElements = [1, 2, 3];
    const given = new ObservableCollection({
      onChange: givenCallback,
    });
    // Sanity
    given.length.should.be.equal(0);
    // When
    given.addAll(givenElements);
    // Then
    given.length.should.be.equal(3);
    given.get(0).should.be.equal(1);
  });

  it("invokes callback and change is 'REMOVE' on 'remove'", () => {
    // Given
    const givenElements = [1, 2, 3];
    const givenCallback = (change, elements) => {
      change.should.be.equal(CollectionChangeTypes.REMOVE);
      elements.length.should.be.equal(1);
      elements[0].should.be.equal(2);
    };
    const given = new ObservableCollection({
      elements: givenElements,
      onChange: givenCallback,
    });
    // Sanity
    given.length.should.be.equal(3);
    // When
    given.remove(2);
    // Then
    given.length.should.be.equal(2);
  });

  it("invokes callback and change is 'REMOVE' on 'removeAt'", () => {
    // Given
    const givenElements = [1, 2, 3];
    const givenCallback = (change, elements) => {
      change.should.be.equal(CollectionChangeTypes.REMOVE);
      elements.length.should.be.equal(1);
      elements.length.should.be.eql(1);
      elements[0].should.be.equal(2);
    };
    const given = new ObservableCollection({
      elements: givenElements,
      onChange: givenCallback,
    });
    // Sanity
    given.length.should.be.equal(3);
    // When
    given.removeAt(1);
    // Then
    given.length.should.be.equal(2);
    given.get(0).should.be.eql(1);
    given.get(1).should.be.eql(3);
  });

  it("invokes callback and change is 'REMOVE' on 'clear'", () => {
    // Given
    const givenElements = [1, 2, 3];
    const givenCallback = (change, elements) => {
      change.should.be.equal(CollectionChangeTypes.REMOVE);
      elements.length.should.be.equal(3);
    };
    const given = new ObservableCollection({
      elements: givenElements,
      onChange: givenCallback,
    });
    // Sanity
    given.length.should.be.equal(3);
    // When
    given.clear();
    // Then
    given.length.should.be.equal(0);
  });
});