import ChoiceOption from "../../presentation/component/input-choice/choice-option.mjs";

/**
 * @constant
 */
export const ConstantsUtil = {
  /**
   * Names of the properties to skip when invoking "getAsChoices" or 
   * "getAsArray". 
   * 
   * @type {Array<String>}
   * @constant
   */
  excludes: ["asChoices", "_asChoices", "asArray", "_asArray"],
  
  /**
   * Enriches the given constants object, by adding a "asChoices" and 
   * a "asArray" method to it. 
   * 
   * @param {Object} constantsObject Any constants object.
   */
  enrichConstant: function(constantsObject) {
    constantsObject.asChoices = function() {
      return ConstantsUtil.getAsChoices(constantsObject, ConstantsUtil.excludes);
    };
    constantsObject.asArray = function() {
      return ConstantsUtil.getAsArray(constantsObject, ConstantsUtil.excludes);
    };
  },
  
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
      const icon = entry.icon;
  
      return new ChoiceOption({
        value: entry.name,
        localizedValue: localizedName,
        icon: icon,
        shouldDisplayValue: localizedName !== undefined ? true : false,
        shouldDisplayIcon: icon !== undefined ? true : false,
      });
    });
  },
  
  /**
  * Returns an array elements, based on the given constants object. 
  * 
  * @param {Object} constantsObject Any constants object.
  * * **All** not explicitly excluded properties, that aren't part of the prototype, will be returned. 
  * @param {Array<String> | undefined} exclude An array of property names to exclude. 
  * 
  * @returns {Array<Any>}
  */
  getAsArray: function(constantsObject, exclude) {
    return this._getAs(constantsObject, exclude, (entry) => {
      return entry
    });
  },
  
  /**
   * 
   * @param {Object} constantsObject Any constants object.
   * * **All** not explicitly excluded properties, that aren't part of the prototype, will be returned. 
   * @param {Array<String> | undefined} exclude An array of property names to exclude. 
   * @param {Function} func A function that receives a constant's object's entry 
   * and is expected to return an instance of something to be returned by 
   * the `getAsChoices`, `getAsStatefulChoices` or `getAsArray` functions. 
   * 
   * @returns {Array<Object>}
   */
  _getAs: function(constantsObject, exclude, func) {
    const result = [];
  
    for (const entryName in constantsObject) {
      if (constantsObject.hasOwnProperty(entryName) !== true) continue;
      if ((exclude ?? []).find(it => it === entryName) !== undefined) continue;
  
      const entry = constantsObject[entryName];
      result.push(func(entry));
    }
  
    return result;
  },
}
