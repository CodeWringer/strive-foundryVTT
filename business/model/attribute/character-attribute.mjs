import { ValidationUtil } from "../../../common/util/validation-utility.mjs"
import { GameSystemActor } from "../../model/document/actor/actor.mjs"
import TransientBaseCharacterActor from "../../model/document/actor/transient-base-character-actor.mjs"
import { ATTRIBUTE_TYPES } from "../../model/const/attribute-types.mjs"
import { ATTRIBUTES } from "../../model/const/attributes.mjs"

/**
 * Represents a specific Attribute of a character. 
 * 
 * @property {GameSystemActor} _actor Private actor reference. 
 * * Private
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key for the full name. 
 * @property {String} localizableAbbreviation Localization key for the abbreviated name. 
 * @property {Number} level The current raw level. 
 * @property {Number} levelModifier The current level modifier. This number can be negative. 
 * @property {Number} modifiedLevel The current modified level. 
 * * Read-only. 
 * @property {Number} owningActor The owning character actor. 
 * * Read-only. 
 * @property {AttributeType} type Advancement classification.
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
   * The owning character actor. 
   * 
   * @type {TransientBaseCharacterActor}
   * @readonly
   */
  get owningActor() { return this._actor.getTransientObject(); }

  /**
   * @type {AttributeType}
   */
  get type() {
    const attributeName = ((this._actor.system.attributes[this.name] ?? {}).type ?? ATTRIBUTE_TYPES.SECONDARY.name);
    return ATTRIBUTE_TYPES.asArray().find(it => it.name === attributeName);
  }
  set type(value) {
    this._actor.update({
      system: {
        attributes: {
          [this.name]: {
            type: value.name
          }
        }
      }
    }); 
  }

  /**
   * @type {String}
   * @readonly
   */
  get icon() { return ATTRIBUTES[this.name].icon; }

  /**
   * @param {GameSystemActor} actor The actor for which to gather 
   * attribute data. 
   * @param {String} name Internal name of the attribute. 
   * * E. g. `"strength"`
   */
  constructor(actor, name) {
    ValidationUtil.validateOrThrow({ a: actor, n: name}, ["a", "n"]);

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