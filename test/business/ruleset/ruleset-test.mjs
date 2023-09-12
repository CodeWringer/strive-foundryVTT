import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import Ruleset from '../../../business/ruleset/ruleset.mjs';
import { ATTRIBUTE_TIERS } from '../../../business/ruleset/attribute/attribute-tier.mjs';
import { DICE_POOL_RESULT_TYPES } from '../../../business/dice/dice-pool.mjs';

describe("Ruleset", () => {
  /*
  These tests cannot work, because they require the getTransientObject method to be implemented on the given actor. 
  But mocking the method is not an option, because the actual implementation logic is required for a representative 
  test. And the actual implementation cannot be used, because that would imply using TransientBaseCharacterActor. 
  But the dependency tree of TransientBaseCharacterActor, at some point, leads to some type that extends FormApplication. 
  FormApplication is defined at run time, in FoundryVTT, by FoundryVTT. But for unit-tests, this class is undefined. 
  It cannot be mocked, because that must happen **before** MochaJs is even started. Since ESModule imports are static and 
  happen before the execution of any code, no run-time mocking can work. And providing a fake implementation of FormApplication 
  for use in mocking works, but then fails as a duplicate class definition at run-time in FoundryVTT, because the class is 
  already defined there. 

  The proper solution would require modifiyng the source code before it is passed to MochaJs, adding the mocked class 
  definition only when the test task is run, but without modifiyng the code that will run in FoundryVTT, at all. 

  describe("getAssetSlotBonus", () => {
    it("Returns 0 for level 2", () => {
      // Given
      const given = new Ruleset();
      const givenLevel = 2;
      const expected = 0;
      const givenActor = {
        type: "npc",
        system: {
          attributes: {
            physical: {
              strength: {
                modifiedLevel: givenLevel,
              }
            }
          }
        }
      }
      // When
      const r = given.getAssetSlotBonus(givenActor);
      // Then
      r.should.be.eql(expected);
    });

    it("Returns 1 for level 4", () => {
      // Given
      const given = new Ruleset();
      const givenLevel = 4;
      const expected = 1;
      const givenActor = {
        type: "npc",
        system: {
          attributes: {
            physical: {
              strength: {
                modifiedLevel: givenLevel,
              }
            }
          }
        }
      }
      // When
      const r = given.getAssetSlotBonus(givenActor);
      // Then
      r.should.be.eql(expected);
    });

    it("Returns 2 for level 7", () => {
      // Given
      const given = new Ruleset();
      const givenLevel = 7;
      const expected = 2;
      const givenActor = {
        type: "npc",
        system: {
          attributes: {
            physical: {
              strength: {
                modifiedLevel: givenLevel,
              }
            }
          }
        }
      }
      // When
      const r = given.getAssetSlotBonus(givenActor);
      // Then
      r.should.be.eql(expected);
    });

    it("Returns 2 for level 8", () => {
      // Given
      const given = new Ruleset();
      const givenLevel = 8;
      const expected = 2;
      const givenActor = {
        type: "npc",
        system: {
          attributes: {
            physical: {
              strength: {
                modifiedLevel: givenLevel,
              }
            }
          }
        }
      }
      // When
      const r = given.getAssetSlotBonus(givenActor);
      // Then
      r.should.be.eql(expected);
    });
  });
  */

  describe("getAttributeLevelTier", () => {
    it("returns underdeveloped for level 0", () => {
      // Given
      const givenLevel = 0;
      // When
      const r = new Ruleset().getAttributeLevelTier(givenLevel);
      // Then
      r.should.be.eql(ATTRIBUTE_TIERS.underdeveloped);
    });

    it("returns average for level 3", () => {
      // Given
      const givenLevel = 3;
      // When
      const r = new Ruleset().getAttributeLevelTier(givenLevel);
      // Then
      r.should.be.eql(ATTRIBUTE_TIERS.average);
    });

    it("returns exceptional for level 6", () => {
      // Given
      const givenLevel = 6;
      // When
      const r = new Ruleset().getAttributeLevelTier(givenLevel);
      // Then
      r.should.be.eql(ATTRIBUTE_TIERS.exceptional);
    });
  });

  describe("getAttributeAdvancementRequirements", () => {
    it("returns 15 for level 0", () => {
      // Given
      const givenLevel = 0;
      // When
      const r = new Ruleset().getAttributeAdvancementRequirements(givenLevel);
      // Then
      r.should.be.eql(15);
    });

    it("returns 19 for level 1", () => {
      // Given
      const givenLevel = 1;
      // When
      const r = new Ruleset().getAttributeAdvancementRequirements(givenLevel);
      // Then
      r.should.be.eql(19);
    });

    it("returns 30 for level 3", () => {
      // Given
      const givenLevel = 3;
      // When
      const r = new Ruleset().getAttributeAdvancementRequirements(givenLevel);
      // Then
      r.should.be.eql(30);
    });

    it("returns 42 for level 4", () => {
      // Given
      const givenLevel = 4;
      // When
      const r = new Ruleset().getAttributeAdvancementRequirements(givenLevel);
      // Then
      r.should.be.eql(42);
    });

    it("returns 90 for level 6", () => {
      // Given
      const givenLevel = 6;
      // When
      const r = new Ruleset().getAttributeAdvancementRequirements(givenLevel);
      // Then
      r.should.be.eql(90);
    });

    it("returns 132 for level 8", () => {
      // Given
      const givenLevel = 8;
      // When
      const r = new Ruleset().getAttributeAdvancementRequirements(givenLevel);
      // Then
      r.should.be.eql(132);
    });
  });

  describe("rollCausesBackfire", () => {
    it("Returns true on dice roll failure", () => {
      // Given
      const given = {
        outcomeType: DICE_POOL_RESULT_TYPES.FAILURE,
      };
      // When
      const r = new Ruleset().rollCausesBackfire(given);
      // Then
      r.should.be.eql(true);
    });

    it("Returns false on dice roll success", () => {
      // Given
      const given = {
        outcomeType: DICE_POOL_RESULT_TYPES.SUCCESS,
      };
      // When
      const r = new Ruleset().rollCausesBackfire(given);
      // Then
      r.should.be.eql(false);
    });

    it("Returns false on dice roll partial", () => {
      // Given
      const given = {
        outcomeType: DICE_POOL_RESULT_TYPES.PARTIAL,
      };
      // When
      const r = new Ruleset().rollCausesBackfire(given);
      // Then
      r.should.be.eql(false);
    });

    it("Returns false on dice roll none", () => {
      // Given
      const given = {
        outcomeType: DICE_POOL_RESULT_TYPES.NONE,
      };
      // When
      const r = new Ruleset().rollCausesBackfire(given);
      // Then
      r.should.be.eql(false);
    });
  });
});
