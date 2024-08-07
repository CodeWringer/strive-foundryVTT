import { GameSystemActor } from "../../document/actor/actor.mjs";
import TransientBaseCharacterActor from "../../document/actor/transient-base-character-actor.mjs";
import { validateOrThrow } from "../../util/validation-utility.mjs";
import Ruleset from "../ruleset.mjs";
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
 * @property {Number} owningActor The owning character actor. 
 * * Read-only. 
 * @property {Boolean} advanced If `true`, then this attribute is considered advanced 
 * this session. 
 */
export default class CharacterAttribute {
  /**
   * @type {Number}
   */
  get level() { return parseInt((this._actor.system.attributes[this.name] ?? {}).level ?? 0); }
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
  get levelModifier() { return parseInt((this._actor.system.attributes[this.name] ?? {}).levelModifier ?? 0); }
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
  get advancementProgress() { return parseInt((this._actor.system.attributes[this.name] ?? {}).progress ?? 0); }
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
   * @type {Boolean}
   */
  get advanced() { return (this._actor.system.attributes[this.name] ?? {}).advanced ?? false; }
  set advanced(value) {
    this._actor.update({
      system: {
        attributes: {
          [this.name]: {
            advanced: value
          }
        }
      }
    }); 
  }
  
  /**
   * The current progress towards advancing the attribute. 
   * 
   * @type {Number}
   * @readonly
   */
  get advancementRequirements() { return new Ruleset().getAttributeAdvancementRequirements(this.level); }
  
  /**
   * The owning character actor. 
   * 
   * @type {TransientBaseCharacterActor}
   * @readonly
   */
  get owningActor() { return this._actor.getTransientObject(); }

  /**
   * @param {GameSystemActor} actor The actor for which to gather 
   * attribute data. 
   * @param {String} name Internal name of the attribute. 
   * * E. g. `"strength"`
   */
  constructor(actor, name) {
    validateOrThrow({ a: actor, n: name}, ["a", "n"]);

    this._actor = actor;
    this.name = name;

    const attributeDef = ATTRIBUTES[name];

    if (attributeDef === undefined) {
      throw new Error(`Failed to get global attribute definition for '${name}'`);
    }

    this.localizableName = attributeDef.localizableName;
    this.localizableAbbreviation = attributeDef.localizableAbbreviation;
  }
}