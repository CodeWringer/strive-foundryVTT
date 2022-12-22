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
 * @property {LevelAdvancement} advancementProgress The current progress towards 
 * advancing the attribute. 
 * @property {Number} level The current level of the attribute. 
 */
export default class CharacterAttribute {
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
      throw new Error(`Failed to get global attribute definition '${name}'`);
    }

    this.localizableName = attributeDef.localizableName;
    this.localizableAbbreviation = attributeDef.localizableAbbreviation;

    const characterAttribute = CharacterAttribute.getAttributeFromCharacter(actor, name);

    if (characterAttribute === undefined) {
      throw new Error(`Failed to get attribute '${name}' from character '${actor.name}'`);
    }

    this.level = parseInt(characterAttribute.level);
    this.advancementRequirements = new Ruleset().getAttributeAdvancementRequirements(this.level);
    this.advancementProgress = new LevelAdvancement({
      successes: parseInt(characterAttribute.successes),
      failures: parseInt(characterAttribute.failures),
    });
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
   * @param {DicePoolResult} diceResult A dice roll result. 
   * 
   * @async
   */
  async advanceByRollResult(diceResult) {
    await this._actor.addAttributeProgress(diceResult.outcomeType, this.name);
  }

  /**
   * Returns the attribute data from the given actor for an attribute of the 
   * given name.
   * 
   * @param {AmbersteelBaseCharacterActor} actor 
   * @param {String} name Internal name of the attribute. 
   * * E. g. `"strength"`
   * 
   * @returns {Object | undefined}
   * 
   * @private
   */
  static getAttributeFromCharacter(actor, name) {
    for (const groupDefName in ATTRIBUTE_GROUPS) {
      const groupDef = ATTRIBUTE_GROUPS[groupDefName];
      // Skip any convenience members, such as `asChoices`.
      if (groupDef.name === undefined) continue;
      
      for (const attributeDefName in groupDef.attributes) {
        const attributeDef = groupDef.attributes[attributeDefName];
        // Skip any convenience members, such as `asChoices`.
        if (attributeDef.name === undefined) continue;
        
        if (attributeDef.name === name) {
          return actor.data.data.attributes[groupDefName][attributeDefName];
        }
      }
    }
    return undefined;
  }
}