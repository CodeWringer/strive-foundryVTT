import { GameSystemActor } from "../../document/actor/actor.mjs";
import Ruleset from "../ruleset.mjs";
import { Sum, SumComponent } from "../summed-data.mjs";
import { ATTRIBUTES } from "./attributes.mjs";

/**
 * Represents a specific character's specific attribute. 
 * 
 * @property {GameSystemActor} _actor Private actor reference. 
 * * Private
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key for the full name. 
 * @property {String} localizableAbbreviation Localization key for the abbreviated name. 
 * @property {Number} advancementRequirements The number of tests required to advance the attribute. 
 * * Read-only. 
 * @property {Number} advancementProgress The current progress towards 
 * advancing the attribute. 
 * @property {Number} level The current raw level. 
 * @property {Number} levelModifier The current level modifier. This number can be negative. 
 * @property {Number} modifiedLevel The current modified level. 
 * * Read-only. 
 */
export default class CharacterAttribute {
  /**
   * @type {Number}
   */
  get level() { return parseInt(this._actor.system.attributes[this.name].level); }
  set level(value) {
    this._actor.update({
      system: {
        attributes: {
          [this.name]: {
            level: value
          }
        }
      }
    }); 
  }

  /**
   * @type {Number}
   */
  get levelModifier() { return parseInt(this._actor.system.attributes[this.name].levelModifier ?? "0"); }
  set levelModifier(value) {
    this._actor.update({
      system: {
        attributes: {
          [this.name]: {
            levelModifier: value
          }
        }
      }
    }); 
  }

  /**
   * @type {Number}
   * @readonly
   */
  get modifiedLevel() {
    if (this.level > 0) {
      return Math.max(this.level + this.levelModifier, 1);
    } else {
      return Math.max(this.level + this.levelModifier, 0)
    }
  }

  /**
   * @type {Number}
   */
  get advancementProgress() { return parseInt(this._actor.system.attributes[this.name].progress ?? "0"); }
  set advancementProgress(value) {
    this._actor.update({
      system: {
        attributes: {
          [this.name]: {
            progress: value
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
   * @param {GameSystemActor} actor The actor for which to gather 
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
  }

  /**
   * Returns the component(s) to do a roll using this attribute. 
   * 
   * @returns {Sum}
   */
  getRollData() {
    return new Sum([
      new SumComponent(this.name, this.localizableName, this.modifiedLevel)
    ]);
  }
}