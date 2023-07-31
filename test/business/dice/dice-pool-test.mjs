import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import { SumComponent } from '../../../business/ruleset/summed-data.mjs';
import DicePool, { DICE_POOL_RESULT_TYPES, DicePoolRollResult } from '../../../business/dice/dice-pool.mjs';
import { ROLL_DICE_MODIFIER_TYPES } from '../../../business/dice/roll-dice-modifier-types.mjs';

/**
 * Mocks the global `Die` definition. 
 * 
 * @param {Array<Number>} mockedResults The numbers to return, in order of the 
 * `Die.evaluate` method being called. Cycles the result list. 
 */
function mockDie(mockedResults) {
  globalThis.Die = function(args = {}) {
    return {
      faces: args.faces,
      number: args.number,
      _results: mockedResults,
      evaluate: function() {
        const arr = [];

        for (let i = 0; i < this.number; i++) {
          const faceResult = this._results[i];
          arr.push({ result: faceResult });
        }

        return {
          results: arr,
        };
      },
    }
  }
}

describe("DicePool", () => {
  after(() => {
    globalThis.Die = undefined;
  });

  describe("roll", () => {
    it("rolls with 3 dice from one component, no bonus and no modifier as expected", () => {
      // Given
      const givenDice = [
        new SumComponent("a1", "a2", 3)
      ];
      const givenObstacle = 0;
      const givenBonus = [];
      const givenModifer = ROLL_DICE_MODIFIER_TYPES.NONE;
      const given = new DicePool({
        dice: givenDice,
        bonus: givenBonus,
        obstacle: givenObstacle,
        modifier: givenModifer,
      });
      // Setup
      mockDie([5, 3, 1]);
      // When
      const r = given.roll();
      // Then
      r.should.deepEqual(new DicePoolRollResult({
        unmodifiedDice: 3,
        unmodifiedBonus: 0,
        unmodifiedTotal: 3,
        modifiedDice: 3,
        modifiedBonus: 0,
        modifiedTotal: 3,
        dice: givenDice,
        bonus: givenBonus,
        obstacle: givenObstacle,
        modifier: givenModifer,
        positives: [5],
        negatives: [3, 1],
        outcomeType: DICE_POOL_RESULT_TYPES.NONE,
        degree: 0,
      }));
    });
  });
});