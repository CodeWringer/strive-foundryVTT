import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import { SumComponent } from '../../../business/ruleset/summed-data.mjs';
import DicePool, { DICE_POOL_RESULT_TYPES, DicePoolRollResult } from '../../../business/dice/dice-pool.mjs';
import { ROLL_DICE_MODIFIER_TYPES } from '../../../business/dice/roll-dice-modifier-types.mjs';
import { VISIBILITY_MODES } from '../../../presentation/chat/visibility-modes.mjs';
import { EvaluatedRollFormula } from '../../../business/dice/roll-formula-resolver.mjs';

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

/**
 * Mocks the global `Roll` definition. 
 * 
 * @param {Array<Object>} mockedResult Mocked terms to return. Each must expose the 
 * following properties:
 * * `total: {Number}`
 * * `terms: {Array<Number>}`
 */
function mockRoll(input, mockedResult) {
  if (globalThis.RollMocks === undefined) {
    globalThis.RollMocks = new Map();
  }
  let total = 0;
  for (const term of mockedResult) {
    total += term.total;
  }
  globalThis.RollMocks.set(input, {
    terms: mockedResult,
    total: total,
  });

  if (globalThis.Roll === undefined) {
    globalThis.Roll = function(input) {
      return {
        evaluate: function() {
          return globalThis.RollMocks.get(input);
        },
      };
    };
  }
}

describe("DicePool", () => {
  before((done) => {
    globalThis.game = {
      i18n: sinon.fake(),
      ambersteel: {
        logger: sinon.fake(),
      },
    };

    done();
  });

  after((done) => {
    globalThis.Die = undefined;
    globalThis.game = undefined;
    globalThis.ChatMessage = undefined;

    done();
  });
  
  describe("roll", () => {
    it("rolls with 3 dice from one component, no bonus and no modifier as expected", async () => {
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
        obstacle: "0",
        modifier: givenModifer,
      });
      // Setup
      mockDie([5, 3, 1]);
      mockRoll(givenObstacle + "", [{ values: [givenObstacle], total: givenObstacle }]);
      // When
      const r = await given.roll();
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
        obstacle: 0,
        evaluatedObstacle: new EvaluatedRollFormula({
          formula: givenObstacle + "",
          terms: [givenObstacle],
          rawTotal: givenObstacle,
          positiveTotal: givenObstacle,
        }),
        modifier: givenModifer,
        positives: [5],
        negatives: [3, 1],
        outcomeType: DICE_POOL_RESULT_TYPES.NONE,
        degree: 0,
      }));
    });

    it("rolls with 3 dice from one component, no bonus and modifier half rounded down as expected", async () => {
      // Given
      const givenDice = [
        new SumComponent("a1", "a2", 3)
      ];
      const givenObstacle = 0;
      const givenBonus = [];
      const givenModifer = ROLL_DICE_MODIFIER_TYPES.HALF_ROUNDED_DOWN;
      const given = new DicePool({
        dice: givenDice,
        bonus: givenBonus,
        obstacle: givenObstacle,
        modifier: givenModifer,
      });
      // Setup
      mockDie([5, 3, 1]);
      mockRoll(givenObstacle + "", [{ values: [givenObstacle], total: givenObstacle }]);
      // When
      const r = await given.roll();
      // Then
      r.should.deepEqual(new DicePoolRollResult({
        unmodifiedDice: 3,
        unmodifiedBonus: 0,
        unmodifiedTotal: 3,
        modifiedDice: 1,
        modifiedBonus: 0,
        modifiedTotal: 1,
        dice: givenDice,
        bonus: givenBonus,
        obstacle: givenObstacle,
        evaluatedObstacle: new EvaluatedRollFormula({
          formula: givenObstacle + "",
          terms: [givenObstacle],
          rawTotal: givenObstacle,
          positiveTotal: givenObstacle,
        }),
        modifier: givenModifer,
        positives: [5],
        negatives: [],
        outcomeType: DICE_POOL_RESULT_TYPES.NONE,
        degree: 0,
      }));
    });

    it("rolls with 3 dice from one component, with bonus and no modifier as expected", async () => {
      // Given
      const givenDice = [
        new SumComponent("a1", "a2", 3)
      ];
      const givenObstacle = 0;
      const givenBonus = [
        new SumComponent("b1", "b2", 2)
      ];
      const givenModifer = ROLL_DICE_MODIFIER_TYPES.NONE;
      const given = new DicePool({
        dice: givenDice,
        bonus: givenBonus,
        obstacle: givenObstacle,
        modifier: givenModifer,
      });
      // Setup
      mockDie([5, 3, 1, 2, 6]);
      mockRoll(givenObstacle + "", [{ values: [givenObstacle], total: givenObstacle }]);
      // When
      const r = await given.roll();
      // Then
      r.should.deepEqual(new DicePoolRollResult({
        unmodifiedDice: 3,
        unmodifiedBonus: 2,
        unmodifiedTotal: 5,
        modifiedDice: 3,
        modifiedBonus: 2,
        modifiedTotal: 5,
        dice: givenDice,
        bonus: givenBonus,
        obstacle: givenObstacle,
        evaluatedObstacle: new EvaluatedRollFormula({
          formula: givenObstacle + "",
          terms: [givenObstacle],
          rawTotal: givenObstacle,
          positiveTotal: givenObstacle,
        }),
        modifier: givenModifer,
        positives: [5, 6],
        negatives: [3, 1, 2],
        outcomeType: DICE_POOL_RESULT_TYPES.NONE,
        degree: 0,
      }));
    });

    it("rolls failure as expected", async () => {
      // Given
      const givenDice = [
        new SumComponent("a1", "a2", 3)
      ];
      const givenObstacle = 2;
      const givenBonus = [
        new SumComponent("b1", "b2", 2)
      ];
      const givenModifer = ROLL_DICE_MODIFIER_TYPES.NONE;
      const given = new DicePool({
        dice: givenDice,
        bonus: givenBonus,
        obstacle: givenObstacle,
        modifier: givenModifer,
      });
      // Setup
      mockDie([1, 3, 1, 2, 4]);
      mockRoll(givenObstacle + "", [{ values: [givenObstacle], total: givenObstacle }]);
      // When
      const r = await given.roll();
      // Then
      r.should.deepEqual(new DicePoolRollResult({
        unmodifiedDice: 3,
        unmodifiedBonus: 2,
        unmodifiedTotal: 5,
        modifiedDice: 3,
        modifiedBonus: 2,
        modifiedTotal: 5,
        dice: givenDice,
        bonus: givenBonus,
        obstacle: givenObstacle,
        evaluatedObstacle: new EvaluatedRollFormula({
          formula: givenObstacle + "",
          terms: [givenObstacle],
          rawTotal: givenObstacle,
          positiveTotal: givenObstacle,
        }),
        modifier: givenModifer,
        positives: [],
        negatives: [1, 3, 1, 2, 4],
        outcomeType: DICE_POOL_RESULT_TYPES.FAILURE,
        degree: 0,
      }));
    });

    it("rolls partial as expected", async () => {
      // Given
      const givenDice = [
        new SumComponent("a1", "a2", 3)
      ];
      const givenObstacle = 2;
      const givenBonus = [
        new SumComponent("b1", "b2", 2)
      ];
      const givenModifer = ROLL_DICE_MODIFIER_TYPES.NONE;
      const given = new DicePool({
        dice: givenDice,
        bonus: givenBonus,
        obstacle: givenObstacle,
        modifier: givenModifer,
      });
      // Setup
      mockDie([5, 3, 1, 2, 4]);
      mockRoll(givenObstacle + "", [{ values: [givenObstacle], total: givenObstacle }]);
      // When
      const r = await given.roll();
      // Then
      r.should.deepEqual(new DicePoolRollResult({
        unmodifiedDice: 3,
        unmodifiedBonus: 2,
        unmodifiedTotal: 5,
        modifiedDice: 3,
        modifiedBonus: 2,
        modifiedTotal: 5,
        dice: givenDice,
        bonus: givenBonus,
        obstacle: givenObstacle,
        evaluatedObstacle: new EvaluatedRollFormula({
          formula: givenObstacle + "",
          terms: [givenObstacle],
          rawTotal: givenObstacle,
          positiveTotal: givenObstacle,
        }),
        modifier: givenModifer,
        positives: [5],
        negatives: [3, 1, 2, 4],
        outcomeType: DICE_POOL_RESULT_TYPES.PARTIAL,
        degree: 1,
      }));
    });

    it("rolls success as expected", async () => {
      // Given
      const givenDice = [
        new SumComponent("a1", "a2", 3)
      ];
      const givenObstacle = 1;
      const givenBonus = [
        new SumComponent("b1", "b2", 2)
      ];
      const givenModifer = ROLL_DICE_MODIFIER_TYPES.NONE;
      const given = new DicePool({
        dice: givenDice,
        bonus: givenBonus,
        obstacle: givenObstacle,
        modifier: givenModifer,
      });
      // Setup
      mockDie([5, 3, 1, 2, 6]);
      mockRoll(givenObstacle + "", [{ values: [givenObstacle], total: givenObstacle }]);
      // When
      const r = await given.roll();
      // Then
      r.should.deepEqual(new DicePoolRollResult({
        unmodifiedDice: 3,
        unmodifiedBonus: 2,
        unmodifiedTotal: 5,
        modifiedDice: 3,
        modifiedBonus: 2,
        modifiedTotal: 5,
        dice: givenDice,
        bonus: givenBonus,
        obstacle: givenObstacle,
        evaluatedObstacle: new EvaluatedRollFormula({
          formula: givenObstacle + "",
          terms: [givenObstacle],
          rawTotal: givenObstacle,
          positiveTotal: givenObstacle,
        }),
        modifier: givenModifer,
        positives: [5, 6],
        negatives: [3, 1, 2],
        outcomeType: DICE_POOL_RESULT_TYPES.SUCCESS,
        degree: 1,
      }));
    });
  });

  describe("sendToChat", () => {
    it("sends the given DicePoolRollResult to chat", () => {
      // Given
      const givenDice = [
        new SumComponent("a1", "a2", 3)
      ];
      const givenObstacle = 1;
      const givenBonus = [
        new SumComponent("b1", "b2", 2)
      ];
      const givenModifer = ROLL_DICE_MODIFIER_TYPES.NONE;
      const given = new DicePoolRollResult({
        unmodifiedDice: 3,
        unmodifiedBonus: 2,
        unmodifiedTotal: 5,
        modifiedDice: 3,
        modifiedBonus: 2,
        modifiedTotal: 5,
        dice: givenDice,
        bonus: givenBonus,
        obstacle: givenObstacle,
        evaluatedObstacle: new EvaluatedRollFormula({
          formula: givenObstacle + "",
          terms: [givenObstacle],
          rawTotal: givenObstacle,
          positiveTotal: givenObstacle,
        }),
        modifier: givenModifer,
        positives: [5, 6],
        negatives: [3, 1, 2],
        outcomeType: DICE_POOL_RESULT_TYPES.SUCCESS,
        degree: 1,
      });
      const givenChatArgs = {
        visibilityMode: VISIBILITY_MODES.self,
        showBackFire: true,
      };
      // Then
      given.sendToChat(givenChatArgs);
    });
  });
});