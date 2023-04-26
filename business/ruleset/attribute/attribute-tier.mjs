import { getAsArray, getAsChoices } from "../../util/constants-utility.mjs";
import { validateOrThrow } from "../../util/validation-utility.mjs";

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
    validateOrThrow(args, ["name"]);

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
 * @property {Array<ChoiceOption>} asChoices The constants of this type, as an array 
 * of `ChoiceOption`s. 
 * @property {Array<AttributeTier>} asArray The constants of this type, as an array. 
 * 
 * @constant
 */
export const ATTRIBUTE_TIERS = {
  underdeveloped: new AttributeTier({
    name: "underdeveloped",
    localizableName: "ambersteel.character.attribute.tier.underdeveloped",
  }),
  average: new AttributeTier({
    name: "average",
    localizableName: "ambersteel.character.attribute.tier.average",
  }),
  exceptional: new AttributeTier({
    name: "exceptional",
    localizableName: "ambersteel.character.attribute.tier.exceptional",
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
