import LevelAdvancement from "../level-advancement.mjs";
import Ruleset from "../ruleset.mjs";
import { SummedDataComponent } from "../skill/summed-data.mjs";
import { SummedData } from "../skill/summed-data.mjs";
import { ATTRIBUTE_GROUPS } from "./attribute-groups.mjs";
import { ATTRIBUTES } from "./attributes.mjs";

/**
 * Represents a specific character's specific attribute. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key for the full name. 
 * @property {String} localizableAbbreviation Localization key for the abbreviated name. 
 * @property {LevelAdvancement} advancementRequirements The current requirements 
 * to advance the attribute. 
 * * Read-only. 
 * @property {Number} advancementRequirements.successes
 * * Read-only. 
 * @property {Number} advancementRequirements.failures
 * * Read-only. 
 * @property {LevelAdvancement} advancementProgress The current progress towards 
 * advancing the attribute. 
 * * Read-only. 
 * @property {Number} advancementProgress.successes
 * @property {Number} advancementProgress.failures
 * @property {Number} level The current level of the attribute. 
 */
export default class CharacterAttribute {
  /**
   * @type {Number}
   */
  get level() { return parseInt(this._actor.system.attributes[this._attributeGroupName][this.name].level); }
  set level(value) {
    this._actor.update({
      system: {
        attributes: {
          [this._attributeGroupName]: {
            [this.name]: {
              level: value
            }
          }
        }
      }
    }); 
  }

  /**
   * @type {LevelAdvancement}
   */
  get advancementProgress() {
    const thiz = this;
    return {
      get successes() { return parseInt(thiz._actor.system.attributes[thiz._attributeGroupName][thiz.name].successes); },
      set successes(value) {
        thiz._actor.update({
          system: {
            attributes: {
              [thiz._attributeGroupName]: {
                [thiz.name]: {
                  successes: value
                }
              }
            }
          }
        }); 
      },
      get failures() { return parseInt(thiz._actor.system.attributes[thiz._attributeGroupName][thiz.name].failures); },
      set failures(value) {
        thiz._actor.update({
          system: {
            attributes: {
              [thiz._attributeGroupName]: {
                [thiz.name]: {
                  failures: value
                }
              }
            }
          }
        }); 
      },
    };
  }

  /**
   * @type {LevelAdvancement}
   * @readonly
   */
  get advancementRequirements() { return new Ruleset().getAttributeAdvancementRequirements(this.level); }

  /**
   * @param {AmbersteelActor} actor The actor for which to gather 
   * attribute data. 
   * @param {String} name Internal name of the attribute. 
   * * E. g. `"strength"`
   */
  constructor(actor, name) {
    this._actor = actor;
    this.name = name;

    const attributeDef = ATTRIBUTES[name];

    if (attributeDef === undefined) {
      throw new Error(`Failed to get global attribute definition for '${name}'`);
    }

    this.localizableName = attributeDef.localizableName;
    this.localizableAbbreviation = attributeDef.localizableAbbreviation;

    this._attributeGroupName = CharacterAttribute.getAttributeGroupName(name);

    if (this._attributeGroupName === undefined) {
      throw new Error(`Failed to get global attribute group name for '${name}'`);
    }
  }

  /**
   * Returns the component(s) to do a roll using this attribute. 
   * 
   * @returns {SummedData}
   */
  getRollData() {
    return new SummedData(this.level, [
      new SummedDataComponent(this.name, this.localizableName, this.level)
    ]);
  }

  /**
   * Advances the represented attribute on the owning actor, based on the given 
   * roll's outcome. 
   * 
   * @param {DicePoolResult | undefined} diceResult A dice roll result. 
   * 
   * @async
   */
  async advanceByRollResult(diceResult) {
    if (diceResult !== undefined) {
      await this._actor.getTransientObject().addAttributeProgress(diceResult.outcomeType, this.name);
    }
  }

  /**
   * Returns the name of the containing attribute group. 
   * 
   * @param {String} name Internal name of the attribute. 
   * * E. g. `"strength"`
   * 
   * @returns {String | undefined}
   * 
   * @private
   */
  static getAttributeGroupName(name) {
    for (const groupDefName in ATTRIBUTE_GROUPS) {
      const groupDef = ATTRIBUTE_GROUPS[groupDefName];
      // Skip any convenience members, such as `asChoices`.
      if (groupDef.name === undefined) continue;
      
      for (const attributeDefName in groupDef.attributes) {
        const attributeDef = groupDef.attributes[attributeDefName];
        if (attributeDef.name === name) {
          return groupDef.name;
        }
      }
    }
    return undefined;
  }
}