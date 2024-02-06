import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import VersionCode from '../../../business/migration/version-code.mjs';

describe("VersionCode", () => {
  describe("constructor", () => {
    it("constructs 6.5.2 as expected", () => {
      // When
      const r = new VersionCode(6, 5, 2);
      // Then
      r.major.should.be.eql(6);
      r.minor.should.be.eql(5);
      r.patch.should.be.eql(2);
    });
  });

  describe("fromString", () => {
    it("parses 6.5.2 as expected", () => {
      // Given
      const given = "6.5.2";
      // When
      const r = VersionCode.fromString(given);
      // Then
      r.major.should.be.eql(6);
      r.minor.should.be.eql(5);
      r.patch.should.be.eql(2);
    });
  });

  describe("toString", () => {
    it("returns '6.5.2' as expected", () => {
      // Given
      const given = new VersionCode(6, 5, 2);
      // When
      const r = given.toString();
      // Then
      r.should.be.eql("6.5.2");
    });
  });

  describe("greaterThan", () => {
    it("6.5.2 is correctly returned as greater than 6.4.1", () => {
      // Given
      const given = new VersionCode(6, 5, 2);
      const otherGiven = new VersionCode(6, 4, 1);
      // When
      const r = given.greaterThan(otherGiven);
      // Then
      r.should.be.eql(true);
    });

    it("6.4.1 is correctly returned as not greater than 6.5.2", () => {
      // Given
      const given = new VersionCode(6, 5, 2);
      const otherGiven = new VersionCode(6, 4, 1);
      // When
      const r = otherGiven.greaterThan(given);
      // Then
      r.should.be.eql(false);
    });
  });

  describe("lesserThan", () => {
    it("6.5.2 is correctly returned as not lesser than 6.4.1", () => {
      // Given
      const given = new VersionCode(6, 5, 2);
      const otherGiven = new VersionCode(6, 4, 1);
      // When
      const r = given.lesserThan(otherGiven);
      // Then
      r.should.be.eql(false);
    });

    it("6.4.1 is correctly returned as lesser than 6.5.2", () => {
      // Given
      const given = new VersionCode(6, 5, 2);
      const otherGiven = new VersionCode(6, 4, 1);
      // When
      const r = otherGiven.lesserThan(given);
      // Then
      r.should.be.eql(true);
    });
  });

  describe("equals", () => {
    it("6.5.2 is correctly returned as equals 6.5.2", () => {
      // Given
      const given = new VersionCode(6, 5, 2);
      const otherGiven = new VersionCode(6, 5, 2);
      // When
      const r = given.equals(otherGiven);
      // Then
      r.should.be.eql(true);
    });

    it("6.4.1 is correctly returned as does not equal 6.5.2", () => {
      // Given
      const given = new VersionCode(6, 5, 2);
      const otherGiven = new VersionCode(6, 4, 1);
      // When
      const r = otherGiven.equals(given);
      // Then
      r.should.be.eql(false);
    });
  });
});