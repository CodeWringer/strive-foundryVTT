import { StringUtil } from "../../../business/util/string-utility.mjs";

describe('string-utility', function() {
  describe('format', function() {
    it('outputs "Hello, Bob!"', function() {
      // Given
      const given = "Hello, %s!";
      const givenReplacement = "Bob";
      // When
      const r = StringUtil.format(given, givenReplacement);
      // Then
      r.should.be.equal("Hello, Bob!");
    });

    it('outputs "Hello, Bob! Goodbye, Bobette!"', function() {
      // Given
      const given = "Hello, %s! Goodbye, %s!";
      const givenReplacement1 = "Bob";
      const givenReplacement2 = "Bobette";
      // When
      const r = StringUtil.format(given, givenReplacement1, givenReplacement2);
      // Then
      r.should.be.equal("Hello, Bob! Goodbye, Bobette!");
    });

    it('not enough arguments outputs "Hello, Bob! Goodbye, %s!"', function() {
      // Given
      const given = "Hello, %s! Goodbye, %s!";
      const givenReplacement1 = "Bob";
      // When
      const r = StringUtil.format(given, givenReplacement1);
      // Then
      r.should.be.equal("Hello, Bob! Goodbye, %s!");
    });

    it('too many arguments outputs "Hello, Bob! Goodbye, Bobette!"', function() {
      // Given
      const given = "Hello, %s! Goodbye, %s!";
      const givenReplacement1 = "Bob";
      const givenReplacement2 = "Bobette";
      const givenReplacement3 = "Dave";
      const givenReplacement4 = "Anton";
      // When
      const r = StringUtil.format(given, givenReplacement1, givenReplacement2, givenReplacement3, givenReplacement4);
      // Then
      r.should.be.equal("Hello, Bob! Goodbye, Bobette!");
    });
  });

  describe("coerce", function() {
    it("parses boolean true", function() {
      // Given
      const given = "true";
      // When
      const r = StringUtil.coerce(given);
      // Then
      r.should.be.equal(true);
    });

    it("parses boolean false", function() {
      // Given
      const given = "false";
      // When
      const r = StringUtil.coerce(given);
      // Then
      r.should.be.equal(false);
    });

    it("parses negative integer", function() {
      // Given
      const given = "-5";
      // When
      const r = StringUtil.coerce(given);
      // Then
      r.should.be.equal(-5);
    });

    it("parses positive integer", function() {
      // Given
      const given = "5";
      // When
      const r = StringUtil.coerce(given);
      // Then
      r.should.be.equal(5);
    });

    it("parses negative float", function() {
      // Given
      const given = "-5.3";
      // When
      const r = StringUtil.coerce(given);
      // Then
      r.should.be.equal(-5.3);
    });

    it("parses positive float", function() {
      // Given
      const given = "5.3";
      // When
      const r = StringUtil.coerce(given);
      // Then
      r.should.be.equal(5.3);
    });
  });
});