/**
 * Represents an armor type. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 */
export class ArmorType {
  constructor(args = {}) {
    this.name = args.name;
    this.localizableName = args.localizableName;
  }
}

export const ARMOR_TYPES = {
  light: new ArmorType({
    name: "light",
    localizableName: "ambersteel.character.asset.type.armor.light"
  }),
  medium: new ArmorType({
    name: "medium",
    localizableName: "ambersteel.character.asset.type.armor.medium"
  }),
  heavy: new ArmorType({
    name: "heavy",
    localizableName: "ambersteel.character.asset.type.armor.heavy"
  })
};