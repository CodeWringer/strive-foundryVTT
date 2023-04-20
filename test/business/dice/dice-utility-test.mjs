import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import * as DiceUtility from "../../../business/dice/dice-utility.mjs";
import { DiceOutcomeTypes } from '../../../business/dice/dice-outcome-types.mjs';
import DicePoolResult from '../../../business/dice/dice-pool-result.mjs';

describe("dice-utility", () => {
  describe("rollDicePool", () => {
    it("1 die and 0 obstacle yields no result", () => {
      // Given
      const givenNumberOfDice = 1;
      const givenObstacle = 0;
      const givenBonusDice = 0;
      // Setup
      globalThis.Die = function(args = {}) {
        return {
          faces: args.faces,
          number: args.number,
          evaluate: function() {
            return {
              results: [
                { result: 6 },
              ],
            };
          },
        }
      }
      // When
      const r = DiceUtility.rollDicePool({
        numberOfDice: givenNumberOfDice,
        obstacle: givenObstacle,
        bonusDice: givenBonusDice,
      });
      // Then
      r.should.deepEqual(new DicePoolResult({
        numberOfDice: givenNumberOfDice,
        obstacle: givenObstacle,
        degree: 0,
        positives: [6],
        negatives: [],
        outcomeType: DiceOutcomeTypes.NONE,
      }));
    });

    it("3 dice and 1 obstacle yields success with degree 0", () => {
      // Given
      const givenNumberOfDice = 3;
      const givenObstacle = 1;
      const givenBonusDice = 0;
      // Setup
      globalThis.Die = function(args = {}) {
        return {
          faces: args.faces,
          number: args.number,
          evaluate: function() {
            return {
              results: [
                { result: 6 },
                { result: 3 },
                { result: 1 },
              ],
            };
          },
        }
      }
      // When
      const r = DiceUtility.rollDicePool({
        numberOfDice: givenNumberOfDice,
        obstacle: givenObstacle,
        bonusDice: givenBonusDice,
      });
      // Then
      r.should.deepEqual(new DicePoolResult({
        numberOfDice: givenNumberOfDice,
        obstacle: givenObstacle,
        degree: 0,
        positives: [6],
        negatives: [3, 1],
        outcomeType: DiceOutcomeTypes.SUCCESS,
      }));
    });

    it("3 dice and 1 obstacle yields success with degree 1", () => {
      // Given
      const givenNumberOfDice = 3;
      const givenObstacle = 1;
      const givenBonusDice = 0;
      // Setup
      globalThis.Die = function(args = {}) {
        return {
          faces: args.faces,
          number: args.number,
          evaluate: function() {
            return {
              results: [
                { result: 6 },
                { result: 5 },
                { result: 1 },
              ],
            };
          },
        }
      }
      // When
      const r = DiceUtility.rollDicePool({
        numberOfDice: givenNumberOfDice,
        obstacle: givenObstacle,
        bonusDice: givenBonusDice,
      });
      // Then
      r.should.deepEqual(new DicePoolResult({
        numberOfDice: givenNumberOfDice,
        obstacle: givenObstacle,
        degree: 1,
        positives: [6, 5],
        negatives: [1],
        outcomeType: DiceOutcomeTypes.SUCCESS,
      }));
    });

    it("3 dice and 1 obstacle yields failure", () => {
      // Given
      const givenNumberOfDice = 3;
      const givenObstacle = 1;
      const givenBonusDice = 0;
      // Setup
      globalThis.Die = function(args = {}) {
        return {
          faces: args.faces,
          number: args.number,
          evaluate: function() {
            return {
              results: [
                { result: 3 },
                { result: 4 },
                { result: 1 },
              ],
            };
          },
        }
      }
      // When
      const r = DiceUtility.rollDicePool({
        numberOfDice: givenNumberOfDice,
        obstacle: givenObstacle,
        bonusDice: givenBonusDice,
      });
      // Then
      r.should.deepEqual(new DicePoolResult({
        numberOfDice: givenNumberOfDice,
        obstacle: givenObstacle,
        degree: 0,
        positives: [],
        negatives: [3, 4, 1],
        outcomeType: DiceOutcomeTypes.FAILURE,
      }));
    });

    it("3 dice and 2 obstacle yields partial", () => {
      // Given
      const givenNumberOfDice = 3;
      const givenObstacle = 2;
      const givenBonusDice = 0;
      // Setup
      globalThis.Die = function(args = {}) {
        return {
          faces: args.faces,
          number: args.number,
          evaluate: function() {
            return {
              results: [
                { result: 6 },
                { result: 4 },
                { result: 1 },
              ],
            };
          },
        }
      }
      // When
      const r = DiceUtility.rollDicePool({
        numberOfDice: givenNumberOfDice,
        obstacle: givenObstacle,
        bonusDice: givenBonusDice,
      });
      // Then
      r.should.deepEqual(new DicePoolResult({
        numberOfDice: givenNumberOfDice,
        obstacle: givenObstacle,
        degree: 0,
        positives: [6],
        negatives: [4, 1],
        outcomeType: DiceOutcomeTypes.PARTIAL,
      }));
    });

    it("1 die and 1 bonus die and 0 obstacle yields no result", () => {
      // Given
      const givenNumberOfDice = 1;
      const givenObstacle = 0;
      const givenBonusDice = 1;
      // Setup
      globalThis.Die = function(args = {}) {
        return {
          faces: args.faces,
          number: args.number,
          evaluate: function() {
            return {
              results: [
                { result: 6 },
              ],
            };
          },
        }
      }
      // When
      const r = DiceUtility.rollDicePool({
        numberOfDice: givenNumberOfDice,
        obstacle: givenObstacle,
        bonusDice: givenBonusDice,
      });
      // Then
      r.should.deepEqual(new DicePoolResult({
        numberOfDice: givenNumberOfDice + givenBonusDice,
        obstacle: givenObstacle,
        degree: 0,
        positives: [6],
        negatives: [],
        outcomeType: DiceOutcomeTypes.NONE,
      }));
    });

    it("2 dice and 1 bonus die and 0 obstacle yields success", () => {
      // Given
      const givenNumberOfDice = 2;
      const givenObstacle = 1;
      const givenBonusDice = 1;
      // Setup
      globalThis.Die = function(args = {}) {
        return {
          faces: args.faces,
          number: args.number,
          evaluate: function() {
            return {
              results: [
                { result: 1 },
                { result: 5 },
                { result: 6 },
              ],
            };
          },
        }
      }
      // When
      const r = DiceUtility.rollDicePool({
        numberOfDice: givenNumberOfDice,
        obstacle: givenObstacle,
        bonusDice: givenBonusDice,
      });
      // Then
      r.should.deepEqual(new DicePoolResult({
        numberOfDice: givenNumberOfDice + givenBonusDice,
        obstacle: givenObstacle,
        degree: 1,
        positives: [5, 6],
        negatives: [1],
        outcomeType: DiceOutcomeTypes.SUCCESS,
      }));
    });
  });
});