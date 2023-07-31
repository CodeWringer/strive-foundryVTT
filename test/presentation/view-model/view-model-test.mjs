import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import ViewModel from '../../../presentation/view-model/view-model.mjs';
import { BaseLoggingStrategy } from '../../../business/logging/base-logging-strategy.mjs';

describe("ViewModel", function() {
  const givenViewStateSource = new Map();

  before(() => {
    globalThis.game = {
      ambersteel: {
        logger: sinon.createStubInstance(BaseLoggingStrategy),
      },
    };
  });

  after(() => {
    globalThis.game = undefined;
  });

  describe("parent", function() {
    describe("isParentOf", function() {
      it("Returns true on direct child", function() {
        // Given
        const givenParent = new ViewModel({
          viewStateSource: givenViewStateSource,
        });
        const givenChild = new ViewModel({
          viewStateSource: givenViewStateSource,
          parent: givenParent,
        });
        // When
        const r = givenParent.isParentOf(givenChild);
        // Then
        r.should.be.equal(true);
      });

      it("Returns true on first degree indirect child", function() {
        // Given
        const givenParent = new ViewModel({
          viewStateSource: givenViewStateSource,
        });
        const givenIntermediaryParent = new ViewModel({
          viewStateSource: givenViewStateSource,
          parent: givenParent,
        });
        const givenChild = new ViewModel({
          viewStateSource: givenViewStateSource,
          parent: givenIntermediaryParent,
        });
        // When
        const r = givenParent.isParentOf(givenChild);
        // Then
        r.should.be.equal(true);
      });

      it("Returns true on second degree indirect child", function() {
        // Given
        const givenParent = new ViewModel({
          viewStateSource: givenViewStateSource,
        });
        const givenIntermediaryParent1 = new ViewModel({
          viewStateSource: givenViewStateSource,
          parent: givenParent,
        });
        const givenIntermediaryParent2 = new ViewModel({
          viewStateSource: givenViewStateSource,
          parent: givenIntermediaryParent1,
        });
        const givenChild = new ViewModel({
          viewStateSource: givenViewStateSource,
          parent: givenIntermediaryParent2,
        });
        // When
        const r = givenParent.isParentOf(givenChild);
        // Then
        r.should.be.equal(true);
      });

      it("Returns false on non-child", function() {
        // Given
        const givenParent = new ViewModel({
          viewStateSource: givenViewStateSource,
        });
        const givenNonChild = new ViewModel({
          viewStateSource: givenViewStateSource,
        });
        // When
        const r = givenParent.isParentOf(givenNonChild);
        // Then
        r.should.be.equal(false);
      });

      it("Returns false on undefined", function() {
        // Given
        const givenParent = new ViewModel({
          viewStateSource: givenViewStateSource,
        });
        // When
        const r = givenParent.isParentOf(undefined);
        // Then
        r.should.be.equal(false);
      });

      it("Returns false on direct parent", function() {
        // Given
        const givenParent = new ViewModel({
          viewStateSource: givenViewStateSource,
        });
        const givenChild = new ViewModel({
          viewStateSource: givenViewStateSource,
          parent: givenParent,
        });
        // When
        const r = givenChild.isParentOf(givenParent);
        // Then
        r.should.be.equal(false);
      });

      it("Returns false on indirect parent", function() {
        // Given
        const givenParent = new ViewModel({
          viewStateSource: givenViewStateSource,
        });
        const givenIntermediaryParent1 = new ViewModel({
          viewStateSource: givenViewStateSource,
          parent: givenParent,
        });
        const givenIntermediaryParent2 = new ViewModel({
          viewStateSource: givenViewStateSource,
          parent: givenIntermediaryParent1,
        });
        const givenChild = new ViewModel({
          viewStateSource: givenViewStateSource,
          parent: givenIntermediaryParent2,
        });
        // When
        const r = givenChild.isParentOf(givenParent);
        // Then
        r.should.be.equal(false);
      });
    });

    describe("setter", function() {
      it("Does not throw on child assigned without prior parent", function() {
        // Given
        const givenParent = new ViewModel({
          viewStateSource: givenViewStateSource,
        });
        const givenChild = new ViewModel({
          viewStateSource: givenViewStateSource,
        });
        const operation = () => {
          givenChild.parent = givenParent;
        };
        // Then
        operation.should.not.throw();
      });
     
      it("Does not throw on child assigned to same parent", function() {
        // Given
        const givenParent = new ViewModel({
          viewStateSource: givenViewStateSource,
        });
        const givenChild = new ViewModel({
          viewStateSource: givenViewStateSource,
          parent: givenParent,
        });
        const operation = () => {
          givenChild.parent = givenParent;
        };
        // Then
        operation.should.not.throw();
      });

      it("Does not throw on child assigned from another parent", function() {
        // Given
        const givenParent = new ViewModel({
          viewStateSource: givenViewStateSource,
        });
        const givenOtherParent = new ViewModel({
          viewStateSource: givenViewStateSource,
        });
        const givenChild = new ViewModel({
          viewStateSource: givenViewStateSource,
          parent: givenOtherParent,
        });

        const operation = () => {
          givenChild.parent = givenParent;
        };

        // Then
        givenParent.children.length.should.be.equal(0);
        givenOtherParent.children.length.should.be.equal(1);
        givenChild.parent.should.be.equal(givenOtherParent);
        
        // When/Then
        operation.should.not.throw();

        givenParent.children.length.should.be.equal(1);
        givenOtherParent.children.length.should.be.equal(0);
        givenChild.parent.should.be.equal(givenParent);
      });

      it("Does not throw on child 'hoisting'", function() {
        // Given
        const givenParent = new ViewModel({
          viewStateSource: givenViewStateSource,
        });
        const givenIntermediaryParent1 = new ViewModel({
          viewStateSource: givenViewStateSource,
          parent: givenParent,
        });
        const givenIntermediaryParent2 = new ViewModel({
          viewStateSource: givenViewStateSource,
          parent: givenIntermediaryParent1,
        });
        const givenChild = new ViewModel({
          viewStateSource: givenViewStateSource,
          parent: givenIntermediaryParent2,
        });
        const operation = () => {
          givenChild.parent = givenParent;
        };
        // Then
        operation.should.not.throw();
      });

      it("Throws on direct recursion", function() {
        // Given
        const givenParent = new ViewModel({
          viewStateSource: givenViewStateSource,
        });
        const givenChild = new ViewModel({
          viewStateSource: givenViewStateSource,
          parent: givenParent,
        });
        const operation = () => {
          givenParent.parent = givenChild;
        };
        // Then
        operation.should.throw();
      });

      it("Throws on indirect recursion to second degree", function() {
        // Given
        const givenParent = new ViewModel({
          viewStateSource: givenViewStateSource,
        });
        const givenIntermediaryParent1 = new ViewModel({
          viewStateSource: givenViewStateSource,
          parent: givenParent,
        });
        const givenIntermediaryParent2 = new ViewModel({
          viewStateSource: givenViewStateSource,
          parent: givenIntermediaryParent1,
        });
        const givenChild = new ViewModel({
          viewStateSource: givenViewStateSource,
          parent: givenIntermediaryParent2,
        });
        const operation = () => {
          givenParent.parent = givenChild;
        };
        // Then
        operation.should.throw();
      });
    });
  });

  describe("getViewState", () => {
    it("returns undefined when no view state fields are defined", () => {
      // Given
      const given = new ViewModel();
      // When
      const r = given.getViewState();
      // Then
      should.equal(r, undefined);
    });

    it("returns object when one view state field is defined and no children", () => {
      // Given
      const given = new ViewModel();
      given.test = false;
      given.registerViewStateProperty("test");

      const expected = Object.create(null);
      expected.test = false;
      // When
      const r = given.getViewState();
      // Then
      should.deepEqual(r, expected);
    });

    it("returns object when one view state field is defined and one child also with view state field", () => {
      // Given
      const given = new ViewModel();
      given.test = false;
      given.registerViewStateProperty("test");
      
      const givenChild = new ViewModel({
        parent: given,
      });
      givenChild.test2 = true;
      givenChild.registerViewStateProperty("test2");
      
      const expected = Object.create(null);
      expected.test = false;
      // When
      const r = given.getViewState();
      // Then
      should.deepEqual(r, expected);
    });
  });
});