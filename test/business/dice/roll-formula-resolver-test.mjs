import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import RollFormulaResolver from '../../../business/dice/roll-formula-resolver.mjs';

describe("RollFormulaResolver", () => {
  describe("resolve", () => {
    it("resolves '3D' to '3D6'", () => {
      // Given
      const formula = "3D";
      const expected = "3D6";
      // When
      const r = new RollFormulaResolver({
        formula: formula,
      }).resolve();
      // Then
      r.should.be.eql(expected);
    });

    it("resolves '3D3' to '3D3'", () => {
      // Given
      const formula = "3D3";
      const expected = "3D3";
      // When
      const r = new RollFormulaResolver({
        formula: formula,
      }).resolve();
      // Then
      r.should.be.eql(expected);
    });

    it("resolves '@SI D + 3' to '0D6 + 3'", () => {
      // Given
      const formula = "@SI D + 3";
      const expected = "0D6 + 3";
      // When
      const r = new RollFormulaResolver({
        formula: formula,
      }).resolve();
      // Then
      r.should.be.eql(expected);
    });

    it("resolves '3 D + 2 D' to '3D6 + 2D6'", () => {
      // Given
      const formula = "3 D + 2 D";
      const expected = "3D6 + 2D6";
      // When
      const r = new RollFormulaResolver({
        formula: formula,
      }).resolve();
      // Then
      r.should.be.eql(expected);
    });

    it("resolves '3 D - 2 / @SI D4 + 2 D' to '3D6 - 2 / 0D4 + 2D6'", () => {
      // Given
      const formula = "3 D - 2 / @SI D4 + 2 D";
      const expected = "3D6 - 2 / 0D4 + 2D6";
      // When
      const r = new RollFormulaResolver({
        formula: formula,
      }).resolve();
      // Then
      r.should.be.eql(expected);
    });
  });
});
