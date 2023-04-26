import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import Ruleset from '../../../business/ruleset/ruleset.mjs';
import { ATTRIBUTE_TIERS } from '../../../business/ruleset/attribute/attribute-tier.mjs';

describe("Ruleset", () => {
  describe("getAssetSlotBonus", () => {
    it("Returns 0 for level 2", () => {
      // Given
      const given = new Ruleset();
      const givenLevel = 2;
      const expected = 0;
      const givenActor = {
        system: {
          attributes: {
            physical: {
              strength: {
                moddedLevel: givenLevel,
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
        system: {
          attributes: {
            physical: {
              strength: {
                moddedLevel: givenLevel,
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
        system: {
          attributes: {
            physical: {
              strength: {
                moddedLevel: givenLevel,
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
        system: {
          attributes: {
            physical: {
              strength: {
                moddedLevel: givenLevel,
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
});
