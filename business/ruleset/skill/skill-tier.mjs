import { getAsArray, getAsChoices } from "../../util/constants-utility.mjs";
import { validateOrThrow } from "../../util/validation-utility.mjs";

/**
 * Represents a skill tier. 
 * 
 * @property {String} name Internal name. 
 * @property {String | undefined} localizableName Localization key. 
 * @property {String | undefined} icon CSS class of an icon. 
 * * E. g. `"fas fa-virus"`
*/
export class SkillTier {
  /**
   * @param {Object} args
   * @param {String} args.name Internal name. 
   * @param {String | undefined} args.localizableName Localization key. 
   * @param {String | undefined} args.icon CSS class of an icon. 
   * * E. g. `"fas fa-virus"`
   */
  constructor(args = {}) {
    validateOrThrow(args, ["name"]);

    this.name = args.name;
    this.localizableName = args.localizableName;
    this.icon = args.icon;
  }
}

/**
 * Represents the defined general health states.
 * 
 * @property {HealthState} berserk 
 * @property {HealthState} burning 
 * @property {HealthState} bleeding 
 * @property {HealthState} dazed 
 * @property {HealthState} deathsDoor 
 * @property {HealthState} dissolving 
 * @property {HealthState} electrified 
 * @property {HealthState} frostbitten 
 * @property {HealthState} grappled 
 * @property {HealthState} hasted 
 * @property {HealthState} jealous 
 * @property {HealthState} pacified 
 * @property {HealthState} poisoned 
 * @property {HealthState} prone 
 * @property {HealthState} rooted 
 * @property {HealthState} terrified 
 * @property {HealthState} unconscious 
 * 
 * @property {Array<ChoiceOption>} asChoices The constants of this type, as an array 
 * of `ChoiceOption`s. 
 * @property {Array<HealthState>} asArray The constants of this type, as an array. 
 * 
 * @constant
 */
export const SKILL_TIERS = {
  dabbling: new SkillTier({
    name: "dabbling",
    localizableName: "ambersteel.character.skill.tier.dabbling",
  }),
  apprentice: new SkillTier({
    name: "apprentice",
    localizableName: "ambersteel.character.skill.tier.apprentice",
  }),
  master: new SkillTier({
    name: "master",
    localizableName: "ambersteel.character.skill.tier.master",
  }),
  get asChoices() {
    if (this._asChoices === undefined) {
      this._asChoices = getAsChoices(this, ["asChoices", "_asChoices", "asArray", "_asArray"]);
    }
    return this._asChoices;
  },
  get asArray() {
    if (this._asArray === undefined) {
      this._asArray = getAsArray(this, ["asChoices", "_asChoices", "asArray", "_asArray"]);
    }
    return this._asArray;
  }
};
