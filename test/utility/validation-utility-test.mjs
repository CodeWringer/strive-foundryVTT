import * as ValidationUtility from "../../module/utils/validation-utility.mjs";

describe('validation-utility', function() {
  describe('propertiesDefined', function() {
    it('properly determines properties exist on object', function() {
      // Given
      const given = { a: 0, b: "c" };
      // When
      const result = ValidationUtility.propertiesDefined(given, ["a", "b"]);
      // Then
      result.should.be.equal(true);
    });

    it('properly determines properties do not exist on object', function() {
      // Given
      const given = { a: 42, c: "d" };
      // When
      const result = ValidationUtility.propertiesDefined(given, ["b"]);
      // Then
      result.should.be.equal(false);
    });
  });

  describe('validateOrThrow', function() {
    it('correctly throws', function() {
      // Given
      const given = { a: 42, b: "c" };
      const call = () => { ValidationUtility.validateOrThrow(given, "doesntexist"); };
      // Then
      call.should.throw();
    });

    it('does not throw', function() {
      // Given
      const given = { a: 42, b: "c" };
      const call = () => { ValidationUtility.validateOrThrow(given, "a"); };
      // Then
      call.should.not.throw();
    });
  });

  describe('isObject', function() {
    it('correctly detects an object', function() {
      // Given
      const given = { a: 42 };
      // When
      const result = ValidationUtility.isObject(given);
      // Then
      result.should.be.equal(true);
    });

    it('correctly detects a non-object 1', function() {
      // Given
      const given = 42;
      // When
      const result = ValidationUtility.isObject(given);
      // Then
      result.should.be.equal(false);
    });

    it('correctly detects a non-object 2', function() {
      // Given
      const given = "abc";
      // When
      const result = ValidationUtility.isObject(given);
      // Then
      result.should.be.equal(false);
    });

    it('correctly detects a non-object 3', function() {
      // Given
      const given = [42];
      // When
      const result = ValidationUtility.isObject(given);
      // Then
      result.should.be.equal(false);
    });

    it('correctly detects a non-object 4', function() {
      // Given
      const given = () => { return 42; };
      // When
      const result = ValidationUtility.isObject(given);
      // Then
      result.should.be.equal(false);
    });
  });

  describe('isArray', function() {
    it('correctly detects an array', function() {
      // Given
      const given = [42];
      // When
      const result = ValidationUtility.isArray(given);
      // Then
      result.should.be.equal(true);
    });

    it('correctly detects a non-array 1', function() {
      // Given
      const given = 42;
      // When
      const result = ValidationUtility.isArray(given);
      // Then
      result.should.be.equal(false);
    });

    it('correctly detects a non-array 2', function() {
      // Given
      const given = "abc";
      // When
      const result = ValidationUtility.isArray(given);
      // Then
      result.should.be.equal(false);
    });

    it('correctly detects a non-array 3', function() {
      // Given
      const given = { a: 42 };
      // When
      const result = ValidationUtility.isArray(given);
      // Then
      result.should.be.equal(false);
    });

    it('correctly detects a non-array 4', function() {
      // Given
      const given = () => { return 42; };
      // When
      const result = ValidationUtility.isArray(given);
      // Then
      result.should.be.equal(false);
    });
  });

  describe('isFunction', function() {
    it('correctly detects an function', function() {
      // Given
      const given = () => { return 42; };
      // When
      const result = ValidationUtility.isFunction(given);
      // Then
      result.should.be.equal(true);
    });

    it('correctly detects a non-function 1', function() {
      // Given
      const given = 42;
      // When
      const result = ValidationUtility.isFunction(given);
      // Then
      result.should.be.equal(false);
    });

    it('correctly detects a non-function 2', function() {
      // Given
      const given = "abc";
      // When
      const result = ValidationUtility.isFunction(given);
      // Then
      result.should.be.equal(false);
    });

    it('correctly detects a non-function 3', function() {
      // Given
      const given = { a: 42 };
      // When
      const result = ValidationUtility.isFunction(given);
      // Then
      result.should.be.equal(false);
    });

    it('correctly detects a non-function 4', function() {
      // Given
      const given = [42];
      // When
      const result = ValidationUtility.isFunction(given);
      // Then
      result.should.be.equal(false);
    });
  });

  describe('isBlankOrUndefined', function() {
    it('correctly determines a blank string 1', function() {
      // Given
      const given = "";
      // When
      const result = ValidationUtility.isBlankOrUndefined(given);
      // Then
      result.should.be.equal(true);
    });

    it('correctly determines a blank string 2', function() {
      // Given
      const given = "   ";
      // When
      const result = ValidationUtility.isBlankOrUndefined(given);
      // Then
      result.should.be.equal(true);
    });

    it('correctly determines a blank string 3', function() {
      // Given
      const given = "  \t \r\n  ";
      // When
      const result = ValidationUtility.isBlankOrUndefined(given);
      // Then
      result.should.be.equal(true);
    });

    it('correctly determines an undefined value', function() {
      // Given
      const given = undefined;
      // When
      const result = ValidationUtility.isBlankOrUndefined(given);
      // Then
      result.should.be.equal(true);
    });

    it('correctly determines a non-blank and non-undefined value 1', function() {
      // Given
      const given = "defined";
      // When
      const result = ValidationUtility.isBlankOrUndefined(given);
      // Then
      result.should.be.equal(false);
    });

    it('correctly determines a non-blank and non-undefined value 2', function() {
      // Given
      const given = 0;
      // When
      const result = ValidationUtility.isBlankOrUndefined(given);
      // Then
      result.should.be.equal(false);
    });
  });

  describe('isNotBlankOrUndefined', function() {
    it('correctly determines a non-blank and non-undefined string 1', function() {
      // Given
      const given = "  abc def";
      // When
      const result = ValidationUtility.isNotBlankOrUndefined(given);
      // Then
      result.should.be.equal(true);
    });

    it('correctly determines a non-blank and non-undefined string 2', function() {
      // Given
      const given = 0;
      // When
      const result = ValidationUtility.isNotBlankOrUndefined(given);
      // Then
      result.should.be.equal(true);
    });

    it('correctly determines a blank and undefined string 1', function() {
      // Given
      const given = "";
      // When
      const result = ValidationUtility.isNotBlankOrUndefined(given);
      // Then
      result.should.be.equal(false);
    });

    it('correctly determines a blank and undefined string 2', function() {
      // Given
      const given = " \t \r\n  ";
      // When
      const result = ValidationUtility.isNotBlankOrUndefined(given);
      // Then
      result.should.be.equal(false);
    });
  });

  describe('isNumber', function() {
    it('detects 123 as true', function() {
      // Given
      const given = 123;
      // When
      const r = ValidationUtility.isNumber(given);
      // Then
      r.should.be.equal(true);
    });

    it('detects 123.5 as true', function() {
      // Given
      const given = 123.5;
      // When
      const r = ValidationUtility.isNumber(given);
      // Then
      r.should.be.equal(true);
    });

    it('detects "123" as true', function() {
      // Given
      const given = "123";
      // When
      const r = ValidationUtility.isNumber(given);
      // Then
      r.should.be.equal(true);
    });

    it('detects "0.123" as true', function() {
      // Given
      const given = "0.123";
      // When
      const r = ValidationUtility.isNumber(given);
      // Then
      r.should.be.equal(true);
    });

    it('detects object as false', function() {
      // Given
      const given = { a: 123, b: "345" };
      // When
      const r = ValidationUtility.isNumber(given);
      // Then
      r.should.be.equal(false);
    });

    it('detects function as false', function() {
      // Given
      const given = () => { return 124; };
      // When
      const r = ValidationUtility.isNumber(given);
      // Then
      r.should.be.equal(false);
    });
  });
});