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
  });
});