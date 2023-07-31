import Ruleset from "../ruleset.mjs";
import { SummedDataComponent } from "../summed-data.mjs";
import { SummedData } from "../summed-data.mjs";
import { ATTRIBUTE_GROUPS } from "./attribute-groups.mjs";
import { ATTRIBUTES } from "./attributes.mjs";

/**
 * Represents a specific character's specific attribute. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key for the full name. 
 * @property {String} localizableAbbreviation Localization key for the abbreviated name. 
 * @property {Number} advancementRequirements The number of tests required to advance the attribute. 
 * * Read-only. 
 * @property {Number} advancementProgress The current progress towards 
 * advancing the attribute. 
 * @property {Number} level The current raw level of the attribute. 
 * @property {Number} modifiedLevel The current modified level of the attribute. 
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
   * @type {Number}
   */
  get modifiedLevel() { return parseInt(this._actor.system.attributes[this._attributeGroupName][this.name].modifiedLevel ?? "0"); }
  set modifiedLevel(value) {
    this._actor.update({
      system: {
        attributes: {
          [this._attributeGroupName]: {
            [this.name]: {
              modifiedLevel: value
            }
          }
        }
      }
    }); 
  }

  /**
   * @type {Number}
   */
  get advancementProgress() { return parseInt(this._actor.system.attributes[this._attributeGroupName][this.name].progress ?? "0"); }
  set advancementProgress(value) {
    this._actor.update({
      system: {
        attributes: {
          [this._attributeGroupName]: {
            [this.name]: {
              progress: value
            }
          }
        }
      }
    }); 
  }

  /**
   * @type {Number}
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
    return new SummedData(this.modifiedLevel, [
      new SummedDataComponent(this.name, this.localizableName, this.modifiedLevel)
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