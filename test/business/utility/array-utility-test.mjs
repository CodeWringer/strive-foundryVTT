import { moveArrayElementBy } from "../../../business/util/array-utility.mjs";
import { moveArrayElement } from "../../../business/util/array-utility.mjs";

describe('array-utility', function() {
  describe('moveArrayElement', function() {
    it('Correctly moves the element to the front', function() {
      // Given
      const arr = ["abc", "def", "ghi"];
      // When
      moveArrayElement(arr, "def", 0);
      // Then
      arr[0].should.be.equal("def");
      arr[1].should.be.equal("abc");
      arr[2].should.be.equal("ghi");
    });
    
    it('Correctly moves the element to the back', function() {
      // Given
      const arr = ["abc", "def", "ghi"];
      // When
      moveArrayElement(arr, "def", arr.length-1);
      // Then
      arr[0].should.be.equal("abc");
      arr[1].should.be.equal("ghi");
      arr[2].should.be.equal("def");
    });
    
    it('Correctly moves the element to the middle', function() {
      // Given
      const arr = ["abc", "def", "ghi"];
      // When
      moveArrayElement(arr, "abc", 1);
      // Then
      arr[0].should.be.equal("def");
      arr[1].should.be.equal("abc");
      arr[2].should.be.equal("ghi");
    });
  });
  
  describe('moveArrayElementBy', function() {
    it('Correctly moves the element forward', function() {
      // Given
      const arr = ["abc", "def", "ghi"];
      // When
      moveArrayElementBy(arr, "def", -1);
      // Then
      arr[0].should.be.equal("def");
      arr[1].should.be.equal("abc");
      arr[2].should.be.equal("ghi");
    });

    it('Correctly respects the lower array boundary', function() {
      // Given
      const arr = ["abc", "def", "ghi"];
      // When
      moveArrayElementBy(arr, "abc", -1);
      // Then
      arr[0].should.be.equal("abc");
      arr[1].should.be.equal("def");
      arr[2].should.be.equal("ghi");
    });

    it('Correctly moves the element back', function() {
      // Given
      const arr = ["abc", "def", "ghi"];
      // When
      moveArrayElementBy(arr, "def", 1);
      // Then
      arr[0].should.be.equal("abc");
      arr[1].should.be.equal("ghi");
      arr[2].should.be.equal("def");
    });

    it('Correctly respects the upper array boundary', function() {
      // Given
      const arr = ["abc", "def", "ghi"];
      // When
      moveArrayElementBy(arr, "ghi", 1);
      // Then
      arr[0].should.be.equal("abc");
      arr[1].should.be.equal("def");
      arr[2].should.be.equal("ghi");
    });
  });
});