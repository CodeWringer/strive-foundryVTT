import { arrayContains, arrayTakeUnless, arrayTakeWhen } from "../../../business/util/array-utility.mjs";
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
  
  describe('arrayContains', function() {
    it('Contains "abc" returns true', function() {
      // Given
      const arr = ["abc", "def", "ghi"];
      // When
      const r = arrayContains(arr, "abc");
      // Then
      r.should.be.equal(true);
    });

    it('Contains "abc" returns false', function() {
      // Given
      const arr = ["def", "ghi"];
      // When
      const r = arrayContains(arr, "abc");
      // Then
      r.should.be.equal(false);
    });

    it('Contains object literal returns false', function() {
      // Given
      const arr = [{ a: 42 }, { b: 0 }];
      // When
      const r = arrayContains(arr, { a: 42 });
      // Then
      r.should.be.equal(false);
    });

    it('Contains object reference returns true', function() {
      // Given
      const givenObj = { a: 42 };
      const arr = [givenObj, { b: 0 }];
      // When
      const r = arrayContains(arr, givenObj);
      // Then
      r.should.be.equal(true);
    });
  });

  describe("arrayTakeWhen", function() {
    it("Returns a new array without a given element", function() {
      // Given
      const givenArr = [1, 2, 3, 4];
      // When
      const r = arrayTakeWhen(givenArr, (element) => {
        return element !== 2;
      });
      // Then
      // Verify given array is unchanged. 
      givenArr.length.should.be.equal(4);
      givenArr[0].should.be.equal(1);
      givenArr[1].should.be.equal(2);
      givenArr[2].should.be.equal(3);
      givenArr[3].should.be.equal(4);
      
      r.length.should.be.equal(3);
      r[0].should.be.equal(1);
      r[1].should.be.equal(3);
      r[2].should.be.equal(4);
    });
  });

  describe("arrayTakeUnless", function() {
    it("Returns a new array without a given element", function() {
      // Given
      const givenArr = [1, 2, 3, 4];
      // When
      const r = arrayTakeUnless(givenArr, (element) => {
        return element === 2;
      });
      // Then
      // Verify given array is unchanged. 
      givenArr.length.should.be.equal(4);
      givenArr[0].should.be.equal(1);
      givenArr[1].should.be.equal(2);
      givenArr[2].should.be.equal(3);
      givenArr[3].should.be.equal(4);
      
      r.length.should.be.equal(3);
      r[0].should.be.equal(1);
      r[1].should.be.equal(3);
      r[2].should.be.equal(4);
    });
  });
});