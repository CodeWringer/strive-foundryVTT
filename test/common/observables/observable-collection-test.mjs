import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import ObservableCollection, { CollectionChangeTypes } from '../../../common/observables/observable-collection.mjs';

describe("ObservableCollection", () => {
  describe("constructor", () => {
    it("accepts given elements", () => {
      // Given
      const givenElements = [1, 2, 3];
      const given = new ObservableCollection({
        elements: givenElements,
      });
      // Then
      given.length.should.be.equal(3);
    });
  });

  describe("getAll", () => {
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
  });

  describe("get", () => {
    it("returns expected element", () => {
      // Given
      const givenElements = [1, 2, 3];
      const given = new ObservableCollection({
        elements: givenElements,
      });
      // When
      const element = given.get(1);
      element.should.be.eql(2);
    });

    it("returns expected element 2", () => {
      // Given
      const givenElements = [1, 2, 3];
      const given = new ObservableCollection({
        elements: givenElements,
      });
      // When
      const element = given.get(2);
      element.should.be.eql(3);
    });

    it("returns undefined on index out of bounds", () => {
      // Given
      const givenElements = [1, 2, 3];
      const given = new ObservableCollection({
        elements: givenElements,
      });
      // When
      const r = given.get(-1);
      should.equal(r, undefined);
    });
  });

  describe("indexOf", () => {
    it("returns expected index of element", () => {
      const givenElements = [1, 2, 3];
      const given = new ObservableCollection({
        elements: givenElements,
      });
      const expected = 1;
      // When
      const r = given.indexOf(2);
      // Then
      r.should.be.eql(expected);
    });

    it("returns expected index out of bounds", () => {
      const givenElements = [1, 2, 3];
      const given = new ObservableCollection({
        elements: givenElements,
      });
      const expected = -1;
      // When
      const r = given.indexOf(99);
      // Then
      r.should.be.eql(expected);
    });
  });

  describe("add", () => {
    it("invokes callback and change is 'ADD' on 'add'", () => {
      // Given
      const given = new ObservableCollection();
      const spy = sinon.fake();
      given.onChange(spy);
      // Sanity
      given.length.should.be.equal(0);
      // When
      given.add(4);
      // Then
      given.length.should.be.equal(1);
      given.get(0).should.be.equal(4);

      spy.should.have.been.calledOnce();
      spy.should.have.been.calledWith(CollectionChangeTypes.ADD, [4]);
    });
  });

  describe("addAt", () => {
    it("invokes callback and change is 'ADD' on 'addAt'", () => {
      // Given
      const givenElements = [1, 2, 3];
      const given = new ObservableCollection({
        elements: givenElements,
      });
      const spy = sinon.fake();
      given.onChange(spy);
      // Sanity
      given.length.should.be.equal(3);
      // When
      given.addAt(0, 4);
      // Then
      given.length.should.be.equal(4);
      given.get(0).should.be.equal(4);

      spy.should.have.been.calledOnce();
      spy.should.have.been.calledWith(CollectionChangeTypes.ADD, [4], 0);
    });
  });

  describe("addAll", () => {
    it("invokes callback and change is 'ADD' on 'addAll'", () => {
      // Given
      const givenElements = [1, 2, 3];
      const given = new ObservableCollection();
      const spy = sinon.fake();
      given.onChange(spy);
      // Sanity
      given.length.should.be.equal(0);
      // When
      given.addAll(givenElements);
      // Then
      given.length.should.be.equal(3);
      given.get(0).should.be.equal(1);

      spy.should.have.been.calledOnce();
      spy.should.have.been.calledWith(CollectionChangeTypes.ADD, givenElements);
    });
  });

  describe("remove", () => {
    it("invokes callback and change is 'REMOVE' on 'remove'", () => {
      // Given
      const givenElements = [1, 2, 3];
      const given = new ObservableCollection({
        elements: givenElements,
      });
      const spy = sinon.fake();
      given.onChange(spy);
      // Sanity
      given.length.should.be.equal(3);
      // When
      given.remove(2);
      // Then
      given.length.should.be.equal(2);

      spy.should.have.been.calledOnce();
      spy.should.have.been.calledWith(CollectionChangeTypes.REMOVE, [2]);
    });
  });

  describe("removeAt", () => {
    it("invokes callback and change is 'REMOVE' on 'removeAt'", () => {
      // Given
      const givenElements = [1, 2, 3];
      const given = new ObservableCollection({
        elements: givenElements,
      });
      const spy = sinon.fake();
      given.onChange(spy);
      // Sanity
      given.length.should.be.equal(3);
      // When
      given.removeAt(1);
      // Then
      given.length.should.be.equal(2);
      given.get(0).should.be.eql(1);
      given.get(1).should.be.eql(3);

      spy.should.have.been.calledOnce();
      spy.should.have.been.calledWith(CollectionChangeTypes.REMOVE, [2], 1);
    });
  });

  describe("clear", () => {
    it("invokes callback and change is 'REMOVE' on 'clear'", () => {
      // Given
      const givenElements = [1, 2, 3];
      const given = new ObservableCollection({
        elements: givenElements,
      });
      const spy = sinon.fake();
      given.onChange(spy);
      // Sanity
      given.length.should.be.equal(3);
      // When
      given.clear();
      // Then
      given.length.should.be.equal(0);

      spy.should.have.been.calledOnce();
      spy.should.have.been.calledWith(CollectionChangeTypes.REMOVE, givenElements);
    });
  });

  describe("move", () => {
    it("invokes callback and change is 'MOVE' with sane indices", () => {
      // Given
      const givenElements = [1, 2, 3];
      const given = new ObservableCollection({
        elements: givenElements,
      });
      const spy = sinon.fake();
      given.onChange(spy);
      const givenFromIndex = 0;
      const givenToIndex = 2;
      // Sanity
      given.length.should.be.equal(3);
      // When
      given.move(givenFromIndex, givenToIndex);
      // Then
      spy.should.have.been.calledOnce();
      spy.should.have.been.calledWith(CollectionChangeTypes.MOVE, givenFromIndex, givenToIndex);

      given.get(0).should.be.eql(2);
      given.get(1).should.be.eql(3);
      given.get(2).should.be.eql(1);
    });

    it("invokes callback and change is 'MOVE' with very high toIndex", () => {
      // Given
      const givenElements = [1, 2, 3];
      const given = new ObservableCollection({
        elements: givenElements,
      });
      const spy = sinon.fake();
      given.onChange(spy);
      const givenFromIndex = 1;
      const givenToIndex = 99;
      // Sanity
      given.length.should.be.equal(3);
      // When
      given.move(givenFromIndex, givenToIndex);
      // Then
      spy.should.have.been.calledOnce();
      spy.should.have.been.calledWith(CollectionChangeTypes.MOVE, givenFromIndex, 2);

      given.get(0).should.be.eql(1);
      given.get(1).should.be.eql(3);
      given.get(2).should.be.eql(2);
    });

    it("invokes callback and change is 'MOVE' with negative toIndex", () => {
      // Given
      const givenElements = [1, 2, 3];
      const given = new ObservableCollection({
        elements: givenElements,
      });
      const spy = sinon.fake();
      given.onChange(spy);
      const givenFromIndex = 1;
      const givenToIndex = -99;
      // Sanity
      given.length.should.be.equal(3);
      // When
      given.move(givenFromIndex, givenToIndex);
      // Then
      spy.should.have.been.calledOnce();
      spy.should.have.been.calledWith(CollectionChangeTypes.MOVE, givenFromIndex, 0);

      given.get(0).should.be.eql(2);
      given.get(1).should.be.eql(1);
      given.get(2).should.be.eql(3);
    });

    it("throws on negative fromIndex", () => {
      // Given
      const givenElements = [1, 2, 3];
      const given = new ObservableCollection({
        elements: givenElements,
      });
      const spy = sinon.fake();
      given.onChange(spy);
      const givenFromIndex = -1;
      const givenToIndex = 2;
      // Sanity
      given.length.should.be.equal(3);
      // Then
      (() => {
        given.move(givenFromIndex, givenToIndex);
      }).should.throw();
      spy.should.not.have.been.called();
    });

    it("throws on positive out of bounds fromIndex", () => {
      // Given
      const givenElements = [1, 2, 3];
      const given = new ObservableCollection({
        elements: givenElements,
      });
      const spy = sinon.fake();
      given.onChange(spy);
      const givenFromIndex = 99;
      const givenToIndex = 2;
      // Sanity
      given.length.should.be.equal(3);
      // Then
      (() => {
        given.move(givenFromIndex, givenToIndex);
      }).should.throw();
      spy.should.not.have.been.called();
    });
  });

  describe("sort", () => {
    it("sorts by number descending", () => {
      // Given
      const givenElements = [1, 2, 3];
      const given = new ObservableCollection({
        elements: givenElements,
      });
      const spy = sinon.fake();
      given.onChange(spy);
      // When
      given.sort((a, b) => b - a);

      // Then
      spy.should.have.been.calledOnce();
      spy.should.have.been.calledWith(CollectionChangeTypes.MOVE, [1, 2, 3], [3, 2, 1]);

      given.get(0).should.be.eql(3);
      given.get(1).should.be.eql(2);
      given.get(2).should.be.eql(1);
    });
  });

  describe("replace", () => {
    it("replaces element as expected", () => {
      // Given
      const givenElements = [1, 2, 3];
      const given = new ObservableCollection({
        elements: givenElements,
      });
      const spy = sinon.fake();
      given.onChange(spy);
      // When
      given.replace(1, 4);
      // Then
      spy.should.have.been.calledOnce();
      spy.should.have.been.calledWith(CollectionChangeTypes.REPLACE, 1, 4);

      given.get(0).should.be.eql(4);
      given.get(1).should.be.eql(2);
      given.get(2).should.be.eql(3);
    });

    it("throws on negative index", () => {
      // Given
      const givenElements = [1, 2, 3];
      const given = new ObservableCollection({
        elements: givenElements,
      });
      const spy = sinon.fake();
      given.onChange(spy);
      // Then
      (() => {
        given.replace(-1, 4);
      }).should.throw();
    });

    it("throws on positive out of bounds index", () => {
      // Given
      const givenElements = [1, 2, 3];
      const given = new ObservableCollection({
        elements: givenElements,
      });
      const spy = sinon.fake();
      given.onChange(spy);
      // Then
      (() => {
        given.replace(99, 4);
      }).should.throw();
    });
  });

  describe("replaceAt", () => {
    it("replaces element as expected", () => {
      // Given
      const givenElements = [1, 2, 3];
      const given = new ObservableCollection({
        elements: givenElements,
      });
      const spy = sinon.fake();
      given.onChange(spy);
      // When
      given.replaceAt(0, 4);
      // Then
      spy.should.have.been.calledOnce();
      spy.should.have.been.calledWith(CollectionChangeTypes.REPLACE, 1, 4);

      given.get(0).should.be.eql(4);
      given.get(1).should.be.eql(2);
      given.get(2).should.be.eql(3);
    });

    it("throws on negative index", () => {
      // Given
      const givenElements = [1, 2, 3];
      const given = new ObservableCollection({
        elements: givenElements,
      });
      const spy = sinon.fake();
      given.onChange(spy);
      // Then
      (() => {
        given.replaceAt(-1, 4);
      }).should.throw();
    });

    it("throws on positive out of bounds index", () => {
      // Given
      const givenElements = [1, 2, 3];
      const given = new ObservableCollection({
        elements: givenElements,
      });
      const spy = sinon.fake();
      given.onChange(spy);
      // Then
      (() => {
        given.replaceAt(99, 4);
      }).should.throw();
    });
  });

  describe("replaceAll", () => {
    it("replaces as expected", () => {
      // Given
      const givenElements = [1, 2, 3];
      const given = new ObservableCollection({
        elements: givenElements,
      });
      const spy = sinon.fake();
      given.onChange(spy);

      const givenReplacements = [4, 5, 6];
      // When
      given.replaceAll(givenReplacements);
      // Then
      spy.should.have.been.calledOnce();
      spy.should.have.been.calledWith(CollectionChangeTypes.REPLACE, givenElements, givenReplacements);

      given.get(0).should.be.eql(4);
      given.get(1).should.be.eql(5);
      given.get(2).should.be.eql(6);
    });
  });
});