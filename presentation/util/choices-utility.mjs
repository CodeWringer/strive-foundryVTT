import { ConstantsUtil } from "../../common/util/constants-utility.mjs";
import { StringUtil } from "../../common/util/string-utility.mjs";
import { ValidationUtil } from "../../common/util/validation-utility.mjs";
import ChoiceOption from "../model/choice-option.mjs";

/**
 * @constant
 */
export const ChoicesUtil = {
  /**
   * Names of the properties to skip when invoking "getAsChoices" or 
   * "getAsArray". 
   * 
   * @type {Array<String>}
   * @constant
   */
  _defaultExcludes: ["asChoices", "_asChoices", "asArray", "_asArray"],

  /**
  * Returns an array of `ChoiceOption`s, based on the given constants object. 
  * 
  * @param {Object} constantsObject Any constants object.
  * * **All** not explicitly excluded properties, that aren't part of the prototype, will be turned 
  * into `ChoiceOption`s. 
  * @param {String | undefined} iconCssClass Additional CSS classes to add to the 
  * icon, if it is defined.
  * @param {Array<String> | undefined} exclude An array of property names to exclude. 
  * 
  * @returns {Array<ChoiceOption>}
  */
  getAsChoices: (constantsObject, iconCssClass, exclude = ChoicesUtil._defaultExcludes) => {
    return ConstantsUtil._getAs(constantsObject, exclude, (entry) => {
      const localizedName = ValidationUtil.isDefined(entry.localizableName) ? StringUtil.getLoca(entry.localizableName) : undefined;
      const icon = entry.img ?? entry.icon;
  
      return new ChoiceOption({
        value: entry.name,
        localizedValue: localizedName,
        icon: icon,
        iconCssClass: iconCssClass,
      });
    });
  },
}
