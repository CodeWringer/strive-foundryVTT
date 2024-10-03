import { ConstantsUtil } from "../../util/constants-utility.mjs";
import { ValidationUtil } from "../../util/validation-utility.mjs";

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
    ValidationUtil.validateOrThrow(args, ["name"]);

    this.name = args.name;
    this.localizableName = args.localizableName;
    this.icon = args.icon;
  }
}

/**
 * Represents the defined skill tiers.
 * 
 * @property {SkillTier} dabbling 
 * @property {SkillTier} apprentice 
 * @property {SkillTier} master 
 * 
 * @constant
 */
export const SKILL_TIERS = {
  dabbling: new SkillTier({
    name: "dabbling",
    localizableName: "system.character.skill.tier.dabbling",
  }),
  apprentice: new SkillTier({
    name: "apprentice",
    localizableName: "system.character.skill.tier.apprentice",
  }),
  master: new SkillTier({
    name: "master",
    localizableName: "system.character.skill.tier.master",
  }),
};
ConstantsUtil.enrichConstant(SKILL_TIERS);
