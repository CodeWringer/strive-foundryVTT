import ChoiceOption from "../../presentation/util/choice-option.mjs";

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
export function getAsChoices(constantsObject, exclude) {
	const result = [];

	for (const entryName in constantsObject) {
		if (constantsObject.hasOwnProperty(entryName) !== true) continue;
		if (exclude.find(it => it === entryName) !== undefined) continue;

		const entry = constantsObject[entryName];
		
		const localizedName = entry.localizableName !== undefined ? game.i18n.localize(entry.localizableName) : undefined;
		const icon = entry.icon;

		result.push(new ChoiceOption({
			value: entry.name,
			localizedValue: localizedName,
			icon: icon,
			shouldDisplayValue: localizedName !== undefined ? true : false,
			shouldDisplayIcon: icon !== undefined ? true : false,
		}));
	}

	return result;
}

/**
 * Returns the object property of the given constants object, whose `name` property matches with the given name. 
 * 
 * @param {Object} constantsObject Any constants object. 
 * @param {String} internalName internal name of the object property to get. 
 * 
 * @returns {Object | undefined}
 */
export function getConstantByName(constantsObject, internalName) {
	for (const propertyName in constantsObject) {
		const obj = constantsObject[propertyName];

		if (obj.name === internalName) {
			return obj;
		}
	}

	return undefined;
}