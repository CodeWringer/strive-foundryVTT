/**
* @param attributeName {String} Internal name of an attribute, e.g. 'magicSense'. 
* @returns {Object} With properties 'object', 'name', 'groupName'
*/
export function getAttributeGroupName(attributeName) {
  const attGroups = CONFIG.ambersteel.character.attributeGroups;
  for (const attGroupName in attGroups) {

    for (const attName in attGroups[attGroupName].attributes) {
      if (attName == attributeName) {
        return attGroupName;
      }
    }
  }
}

/**
 * Returns the requirements to the next level of the given level. 
 * @param level The level for which to return the requirements to the next level. 
 * @private
 */
export function getAdvancementRequirements(level = 0) {
  return {
    requiredSuccessses: (level + 1) * (level + 1) * 3,
    requiredFailures: (level + 1) * (level + 1) * 4
  }
}