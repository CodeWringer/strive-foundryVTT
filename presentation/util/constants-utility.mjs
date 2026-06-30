import { ValidationUtil } from "../../common/_module.mjs";
import { ChoiceOption } from "../_module.mjs";

/**
 * @constant
 */
export const ConstantsUtil = {
  /**
  * Returns an array of `ChoiceOption`s, based on the given constants object. 
  * 
  * @param {Object} constantsObject Any constants object.
  * * **All** not explicitly excluded properties, that aren't part of the prototype, will be turned 
  * into `ChoiceOption`s. 
  * @param {Array<String> | undefined} exclude An array of property names to exclude. 
  * 
  * @returns {Array<ChoiceOption>}
  */
  getAsChoices: function(constantsObject, exclude) {
    return this._getAs(constantsObject, exclude, (entry) => {
      const localizedName = entry.localizableName !== undefined ? game.i18n.localize(entry.localizableName) : undefined;
      const icon = entry.img ?? entry.icon;
  
      return new ChoiceOption({
        value: entry.name,
        localizedValue: localizedName,
        icon: icon,
        shouldDisplayValue: ValidationUtil.isDefined(localizedName),
        shouldDisplayIcon: ValidationUtil.isDefined(icon),
      });
    });
  },
}
