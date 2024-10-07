import { ValidationUtil } from "../../../business/util/validation-utility.mjs";

describe('validation-utility', function() {
  describe('propertiesDefined', function() {
    it('properly determines properties exist on object', function() {
      // Given
      const given = { a: 0, b: "c" };
      // When
      const result = ValidationUtil.propertiesDefined(given, ["a", "b"]);
      // Then
      result.should.be.equal(true);
    });

    it('properly determines properties do not exist on object', function() {
      // Given
      const given = { a: 42, c: "d" };
      // When
      const result = ValidationUtil.propertiesDefined(given, ["b"]);
      // Then
      result.should.be.equal(false);
    });
  });

  describe('isDefined', function() {
    it('Returns false on undefined', function() {
      // Given
      const given = undefined;
      // When
      const result = ValidationUtil.isDefined(given);
      // Then
      result.should.be.equal(false);
    });

    it('Returns false on null', function() {
      // Given
      const given = null;
      // When
      const result = ValidationUtil.isDefined(given);
      // Then
      result.should.be.equal(false);
    });

    it('Returns true on "abc"', function() {
      // Given
      const given = "abc";
      // When
      const result = ValidationUtil.isDefined(given);
      // Then
      result.should.be.equal(true);
    });

    it('Returns true on "undefined"', function() {
      // Given
      const given = "undefined";
      // When
      const result = ValidationUtil.isDefined(given);
      // Then
      result.should.be.equal(true);
    });

    it('Returns true on "null"', function() {
      // Given
      const given = "null";
      // When
      const result = ValidationUtil.isDefined(given);
      // Then
      result.should.be.equal(true);
    });
  });

  describe('validateOrThrow', function() {
    it('correctly throws', function() {
      // Given
      const given = { a: 42, b: "c" };
      const call = () => { ValidationUtil.validateOrThrow(given, "doesntexist"); };
      // Then
      call.should.throw();
    });

    it('does not throw', function() {
      // Given
      const given = { a: 42, b: "c" };
      const call = () => { ValidationUtil.validateOrThrow(given, "a"); };
      // Then
      call.should.not.throw();
    });
  });

  describe('isObject', function() {
    it('correctly detects an object', function() {
      // Given
      const given = { a: 42 };
      // When
      const result = ValidationUtil.isObject(given);
      // Then
      result.should.be.equal(true);
    });

    it('correctly detects a non-object 1', function() {
      // Given
      const given = 42;
      // When
      const result = ValidationUtil.isObject(given);
      // Then
      result.should.be.equal(false);
    });

    it('correctly detects a non-object 2', function() {
      // Given
      const given = "abc";
      // When
      const result = ValidationUtil.isObject(given);
      // Then
      result.should.be.equal(false);
    });

    it('correctly detects a non-object 3', function() {
      // Given
      const given = [42];
      // When
      const result = ValidationUtil.isObject(given);
      // Then
      result.should.be.equal(false);
    });

    it('correctly detects a non-object 4', function() {
      // Given
      const given = () => { return 42; };
      // When
      const result = ValidationUtil.isObject(given);
      // Then
      result.should.be.equal(false);
    });
  });

  describe('isArray', function() {
    it('correctly detects an array', function() {
      // Given
      const given = [42];
      // When
      const result = ValidationUtil.isArray(given);
      // Then
      result.should.be.equal(true);
    });

    it('correctly detects a non-array 1', function() {
      // Given
      const given = 42;
      // When
      const result = ValidationUtil.isArray(given);
      // Then
      result.should.be.equal(false);
    });

    it('correctly detects a non-array 2', function() {
      // Given
      const given = "abc";
      // When
      const result = ValidationUtil.isArray(given);
      // Then
      result.should.be.equal(false);
    });

    it('correctly detects a non-array 3', function() {
      // Given
      const given = { a: 42 };
      // When
      const result = ValidationUtil.isArray(given);
      // Then
      result.should.be.equal(false);
    });

    it('correctly detects a non-array 4', function() {
      // Given
      const given = () => { return 42; };
      // When
      const result = ValidationUtil.isArray(given);
      // Then
      result.should.be.equal(false);
    });
  });

  describe('isFunction', function() {
    it('correctly detects an function', function() {
      // Given
      const given = () => { return 42; };
      // When
      const result = ValidationUtil.isFunction(given);
      // Then
      result.should.be.equal(true);
    });

    it('correctly detects a non-function 1', function() {
      // Given
      const given = 42;
      // When
      const result = ValidationUtil.isFunction(given);
      // Then
      result.should.be.equal(false);
    });

    it('correctly detects a non-function 2', function() {
      // Given
      const given = "abc";
      // When
      const result = ValidationUtil.isFunction(given);
      // Then
      result.should.be.equal(false);
    });

    it('correctly detects a non-function 3', function() {
      // Given
      const given = { a: 42 };
      // When
      const result = ValidationUtil.isFunction(given);
      // Then
      result.should.be.equal(false);
    });

    it('correctly detects a non-function 4', function() {
      // Given
      const given = [42];
      // When
      const result = ValidationUtil.isFunction(given);
      // Then
      result.should.be.equal(false);
    });
  });

  describe('isBlankOrUndefined', function() {
    it('correctly determines a blank string 1', function() {
      // Given
      const given = "";
      // When
      const result = ValidationUtil.isBlankOrUndefined(given);
      // Then
      result.should.be.equal(true);
    });

    it('correctly determines a blank string 2', function() {
      // Given
      const given = "   ";
      // When
      const result = ValidationUtil.isBlankOrUndefined(given);
      // Then
      result.should.be.equal(true);
    });

    it('correctly determines a blank string 3', function() {
      // Given
      const given = "  \t \r\n  ";
      // When
      const result = ValidationUtil.isBlankOrUndefined(given);
      // Then
      result.should.be.equal(true);
    });

    it('correctly determines an undefined value', function() {
      // Given
      const given = undefined;
      // When
      const result = ValidationUtil.isBlankOrUndefined(given);
      // Then
      result.should.be.equal(true);
    });

    it('correctly determines a non-blank and non-undefined value 1', function() {
      // Given
      const given = "defined";
      // When
      const result = ValidationUtil.isBlankOrUndefined(given);
      // Then
      result.should.be.equal(false);
    });

    it('correctly determines a non-blank and non-undefined value 2', function() {
      // Given
      const given = 0;
      // When
      const result = ValidationUtil.isBlankOrUndefined(given);
      // Then
      result.should.be.equal(false);
    });
  });

  describe('isNotBlankOrUndefined', function() {
    it('correctly determines a non-blank and non-undefined string 1', function() {
      // Given
      const given = "  abc def";
      // When
      const result = ValidationUtil.isNotBlankOrUndefined(given);
      // Then
      result.should.be.equal(true);
    });

    it('correctly determines a non-blank and non-undefined string 2', function() {
      // Given
      const given = 0;
      // When
      const result = ValidationUtil.isNotBlankOrUndefined(given);
      // Then
      result.should.be.equal(true);
    });

    it('correctly determines a blank and undefined string 1', function() {
      // Given
      const given = "";
      // When
      const result = ValidationUtil.isNotBlankOrUndefined(given);
      // Then
      result.should.be.equal(false);
    });

    it('correctly determines a blank and undefined string 2', function() {
      // Given
      const given = " \t \r\n  ";
      // When
      const result = ValidationUtil.isNotBlankOrUndefined(given);
      // Then
      result.should.be.equal(false);
    });
  });

  describe('isNumber', function() {
    it('detects 123 as true', function() {
      // Given
      const given = 123;
      // When
      const r = ValidationUtil.isNumber(given);
      // Then
      r.should.be.equal(true);
    });

    it('detects 123.5 as true', function() {
      // Given
      const given = 123.5;
      // When
      const r = ValidationUtil.isNumber(given);
      // Then
      r.should.be.equal(true);
    });

    it('detects "123" as true', function() {
      // Given
      const given = "123";
      // When
      const r = ValidationUtil.isNumber(given);
      // Then
      r.should.be.equal(true);
    });

    it('detects "0.123" as true', function() {
      // Given
      const given = "0.123";
      // When
      const r = ValidationUtil.isNumber(given);
      // Then
      r.should.be.equal(true);
    });

    it('detects object as false', function() {
      // Given
      const given = { a: 123, b: "345" };
      // When
      const r = ValidationUtil.isNumber(given);
      // Then
      r.should.be.equal(false);
    });

    it('detects function as false', function() {
      // Given
      const given = () => { return 124; };
      // When
      const r = ValidationUtil.isNumber(given);
      // Then
      r.should.be.equal(false);
    });
  });

  describe("isString", function() {
    it("detects 'abc' as true", function() {
      // Given
      const given = "abc";
      // When
      const r = ValidationUtil.isString(given);
      // Then
      r.should.be.equal(true);
    });

    it("detects 'true' as true", function() {
      // Given
      const given = "true";
      // When
      const r = ValidationUtil.isString(given);
      // Then
      r.should.be.equal(true);
    });

    it("detects true as false", function() {
      // Given
      const given = true;
      // When
      const r = ValidationUtil.isString(given);
      // Then
      r.should.be.equal(false);
    });

    it("detects an object as false", function() {
      // Given
      const given = { abc: "test" };
      // When
      const r = ValidationUtil.isString(given);
      // Then
      r.should.be.equal(false);
    });

    it("detects a number as false", function() {
      // Given
      const given = 34;
      // When
      const r = ValidationUtil.isString(given);
      // Then
      r.should.be.equal(false);
    });

    it("detects a negative number as false", function() {
      // Given
      const given = -34;
      // When
      const r = ValidationUtil.isString(given);
      // Then
      r.should.be.equal(false);
    });

    it("detects a floating number as false", function() {
      // Given
      const given = 34.245;
      // When
      const r = ValidationUtil.isString(given);
      // Then
      r.should.be.equal(false);
    });

    it("detects a negative floating number as false", function() {
      // Given
      const given = -34.245;
      // When
      const r = ValidationUtil.isString(given);
      // Then
      r.should.be.equal(false);
    });

    it("detects a function as false", function() {
      // Given
      const given = () => { return 5 };
      // When
      const r = ValidationUtil.isString(given);
      // Then
      r.should.be.equal(false);
    });

    it("detects a function which returns a string as false", function() {
      // Given
      const given = () => { return "abc" };
      // When
      const r = ValidationUtil.isString(given);
      // Then
      r.should.be.equal(false);
    });
  });

  describe("isIterable", () => {
    it("detects iterable array with no elements and yields true", () => {
      // Given
      const given = [];
      // When
      const r = ValidationUtil.isIterable(given);
      // Then
      r.should.be.equal(true);
    });

    it("detects iterable array with elements and yields true", () => {
      // Given
      const given = [1, 2, 3];
      // When
      const r = ValidationUtil.isIterable(given);
      // Then
      r.should.be.equal(true);
    });

    it("detects iterable Map with no elements and yields true", () => {
      // Given
      const given = new Map();
      // When
      const r = ValidationUtil.isIterable(given);
      // Then
      r.should.be.equal(true);
    });

    it("detects iterable Map with elements and yields true", () => {
      // Given
      const given = new Map();
      given.set("a", 1);
      given.set("b", 2);
      given.set("c", 3);
      // When
      const r = ValidationUtil.isIterable(given);
      // Then
      r.should.be.equal(true);
    });

    it("detects iterable String and yields true", () => {
      // Given
      const given = "abc";
      // When
      const r = ValidationUtil.isIterable(given);
      // Then
      r.should.be.equal(true);
    });

    it("detects non-iterable object and yields false", () => {
      // Given
      const given = {};
      // When
      const r = ValidationUtil.isIterable(given);
      // Then
      r.should.be.equal(false);
    });
  });
});