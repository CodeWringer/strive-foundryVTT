import { ConstantsUtil } from "../../util/constants-utility.mjs";
import { ValidationUtil } from "../../util/validation-utility.mjs";

/**
 * Represents an attribute tier. 
 * 
 * @property {String} name Internal name. 
 * @property {String | undefined} localizableName Localization key. 
 * @property {String | undefined} icon CSS class of an icon. 
 * * E. g. `"fas fa-virus"`
*/
export class AttributeTier {
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
 * Represents the defined attribute tiers.
 * 
 * @property {AttributeTier} underdeveloped
 * @property {AttributeTier} average
 * @property {AttributeTier} exceptional
 * 
 * @constant
 */
export const ATTRIBUTE_TIERS = {
  underdeveloped: new AttributeTier({
    name: "underdeveloped",
    localizableName: "system.character.attribute.tier.underdeveloped",
  }),
  average: new AttributeTier({
    name: "average",
    localizableName: "system.character.attribute.tier.average",
  }),
  exceptional: new AttributeTier({
    name: "exceptional",
    localizableName: "system.character.attribute.tier.exceptional",
  }),
};
ConstantsUtil.enrichConstant(ATTRIBUTE_TIERS);
