import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import Ruleset from '../../../business/ruleset/ruleset.mjs';

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
});