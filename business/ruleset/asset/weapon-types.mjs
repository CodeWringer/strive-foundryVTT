/**
 * Represents a weapon type. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 */
export class WeaponType {
  constructor(args = {}) {
    this.name = args.name;
    this.localizableName = args.localizableName;
  }
}

export const WEAPON_TYPES = {
  unarmed: new WeaponType({
    name: "unarmed",
    localizableName: "ambersteel.character.asset.type.weapon.unarmed"
  }),
  shortBlade: new WeaponType({
    name: "shortBlade",
    localizableName: "ambersteel.character.asset.type.weapon.shortBlade"
  }),
  longBlade: new WeaponType({
    name: "longBlade",
    localizableName: "ambersteel.character.asset.type.weapon.longBlade"
  }),
  greatBlade: new WeaponType({
    name: "greatBlade",
    localizableName: "ambersteel.character.asset.type.weapon.greatBlade"
  }),
  axe: new WeaponType({
    name: "axe",
    localizableName: "ambersteel.character.asset.type.weapon.axe"
  }),
  greatAxe: new WeaponType({
    name: "greatAxe",
    localizableName: "ambersteel.character.asset.type.weapon.greatAxe"
  }),
  spear: new WeaponType({
    name: "spear",
    localizableName: "ambersteel.character.asset.type.weapon.spear"
  }),
  lance: new WeaponType({
    name: "lance",
    localizableName: "ambersteel.character.asset.type.weapon.lance"
  }),
  polearm: new WeaponType({
    name: "polearm",
    localizableName: "ambersteel.character.asset.type.weapon.polearm"
  }),
  club: new WeaponType({
    name: "club",
    localizableName: "ambersteel.character.asset.type.weapon.club"
  }),
  smallCrusher: new WeaponType({
    name: "smallCrusher",
    localizableName: "ambersteel.character.asset.type.weapon.smallCrusher"
  }),
  largeCrusher: new WeaponType({
    name: "largeCrusher",
    localizableName: "ambersteel.character.asset.type.weapon.largeCrusher"
  }),
  shortBow: new WeaponType({
    name: "shortBow",
    localizableName: "ambersteel.character.asset.type.weapon.shortBow"
  }),
  longBow: new WeaponType({
    name: "longBow",
    localizableName: "ambersteel.character.asset.type.weapon.longBow"
  }),
  warBow: new WeaponType({
    name: "warBow",
    localizableName: "ambersteel.character.asset.type.weapon.warBow"
  }),
  crossbow: new WeaponType({
    name: "crossbow",
    localizableName: "ambersteel.character.asset.type.weapon.crossbow"
  }),
  firearm: new WeaponType({
    name: "firearm",
    localizableName: "ambersteel.character.asset.type.weapon.firearm"
  })
};