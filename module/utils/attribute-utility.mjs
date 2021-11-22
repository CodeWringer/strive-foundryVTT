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