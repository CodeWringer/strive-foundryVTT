import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import * as PropertyUtility from '../utils/property-utility.mjs';

describe('property-utility', function() {
  describe('splitPropertyPath', function() {
    it('successfully splits the path "a.b"', function() {
      // Given
      const path = "a.b";
      // When
      const split = PropertyUtility.splitPropertyPath(path);
      // Then
      split.length.should.be.equal(2);
      split[0].should.be.equal("a");
      split[1].should.be.equal("b");
    });
    
    it('successfully splits the path "a.b[4].c"', function() {
      // Given
      const path = "a.b[4].c";
      // When
      const split = PropertyUtility.splitPropertyPath(path);
      // Then
      split.length.should.be.equal(4);
      split[0].should.be.equal("a");
      split[1].should.be.equal("b");
      split[2].should.be.equal(4);
      split[3].should.be.equal("c");
    });
  });

  describe('getNestedPropertyValue', function() {
    it('successfully gets the value of object at path "a.b"', function() {
      // Given
      const path = "a.b";
      const expectedValue = 42;
      const obj = {
        a: {
          b: expectedValue
        }
      };
      // When
      const actualValue = PropertyUtility.getNestedPropertyValue(obj, path);
      // Then
      actualValue.should.be.equal(expectedValue)
    });

    it('successfully gets the value of object at path "a.b[2].c"', function() {
      // Given
      const path = "a.b[2].c";
      const obj = {
        a: {
          b: [
            { c: 0 },
            { c: 1 },
            { c: 2 },
            { c: 3 },
          ]
        }
      };
      // When
      const value = PropertyUtility.getNestedPropertyValue(obj, path);
      // Then
      value.should.be.equal(2)
    });
  });

  describe('setNestedPropertyValue', function() {
    it('successfully sets the value of object at path a', function() {
      // Given
      const obj = {
        a: 0
      };
      const path = "a";
      const newValue = 42;
      // When
      PropertyUtility.setNestedPropertyValue(obj, path, newValue);
      // Then
      obj.a.should.be.equal(newValue);
    });

    it('throws an error', function() {
      // Given
      const obj = {
        a: 0
      };
      const path = "";
      const newValue = 42;
      global.game = {
        ambersteel: {
          logger: sinon.spy()
        }
      }
      // Then
      try {
        PropertyUtility.setNestedPropertyValue(obj, path, newValue).should.throw();
      } catch (error) {}
    });
  });

  describe('hasProperty', function() {
    it('successfully determines that property "b" exists on the object', function() {
      // Given
      const obj = {
        a: 0
      }
      // Then
      PropertyUtility.hasProperty(obj, "a").should.be.equal(true);
    });

    it('successfully determines that property "c" does not exist on the object', function() {
      // Given
      const obj = {
        a: 0
      }
      // Then
      PropertyUtility.hasProperty(obj, "c").should.be.equal(false);
    });
  });

  describe('ensureNestedProperty', function() {
    it('successfully ensures a property at path a.b.c exists and has value 5', function() {
      // Given 
      const expectedValue = 5;
      const obj = {}
      // When
      PropertyUtility.ensureNestedProperty(obj, "a.b.c", expectedValue);
      // Then
      obj.a.b.c.should.be.equal(expectedValue);
    });

    it('successfully returns an existing property at path a.b.c and has value 5', function() {
      // Given 
      const expectedValue = 5;
      const obj = {
        a: {
          b: {
            c: expectedValue
          }
        }
      }
      // When
      PropertyUtility.ensureNestedProperty(obj, "a.b.c", expectedValue);
      // Then
      obj.a.b.c.should.be.equal(expectedValue);
    });

    it('successfully ensures a property at path a exists and has value 5', function() {
      // Given 
      const expectedValue = 5;
      const obj = {}
      // When
      PropertyUtility.ensureNestedProperty(obj, "a", expectedValue);
      // Then
      obj.a.should.be.equal(expectedValue);
    });

    it('successfully returns an existing property at path a and has value 5', function() {
      // Given 
      const expectedValue = 5;
      const obj = {
        a: expectedValue
      }
      // When
      PropertyUtility.ensureNestedProperty(obj, "a", expectedValue);
      // Then
      obj.a.should.be.equal(expectedValue);
    });

    it('does not change an existing value', function() {
      // Given 
      const expectedValue = 5;
      const differentValue = 1;
      const obj = {
        a: {
          b: expectedValue
        }
      }
      // When
      PropertyUtility.ensureNestedProperty(obj, "a.b", differentValue);
      // Then
      obj.a.b.should.be.equal(expectedValue);
    });
  });
});
