import { ATTRIBUTE_GROUPS } from "./attribute-groups.mjs";
import CharacterAttribute from "./character-attribute.mjs";

/**
 * Represents a specific character's specific attribute group. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key for the full name. 
 * @property {String} localizableAbbreviation Localization key for the abbreviated name. 
 * @property {Array<CharacterAttribute>} attributes Attributes contained in the group. 
 */
export default class CharacterAttributeGroup {
  /**
   * @param {AmbersteelBaseCharacterActor} actor The actor for which to gather 
   * attribute group data. 
   * @param {String} name Internal name of the attribute group. 
   * * E. g. `"physical"`
   */
  constructor(actor, name) {
    this._actor = actor;
    this.name = name;

    const groupDef = ATTRIBUTE_GROUPS[name];
    
    if (groupDef === undefined) {
      throw new Error(`Failed to get global attribute group definition '${name}'`);
    }

    this.localizableName = groupDef.localizableName;
    this.localizableAbbreviation = groupDef.localizableAbbreviation;

    this.attributes = [];
    for (const attributeDef in groupDef.attributes) {
      this.attributes.push(new CharacterAttribute(actor, attributeDef.name));
    }
  }
}