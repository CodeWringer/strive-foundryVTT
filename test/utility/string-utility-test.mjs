import * as StringUtil from "../../module/utils/string-utility.mjs"

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
});