/**
 * Represents a shield type. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 */
export class ShieldType {
  constructor(args = {}) {
    this.name = args.name;
    this.localizableName = args.localizableName;
  }
}

export const SHIELD_TYPES = {
  buckler: new ShieldType({
    name: "buckler",
    localizableName: "ambersteel.character.asset.type.shield.buckler"
  }),
  roundShield: new ShieldType({
    name: "roundShield",
    localizableName: "ambersteel.character.asset.type.shield.roundShield"
  }),
  heaterShield: new ShieldType({
    name: "heaterShield",
    localizableName: "ambersteel.character.asset.type.shield.heaterShield"
  }),
  kiteShield: new ShieldType({
    name: "kiteShield",
    localizableName: "ambersteel.character.asset.type.shield.kiteShield"
  })
};