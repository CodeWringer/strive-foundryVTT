import DocumentProperty from "../document-property.mjs";

/**
 * Property constants of "item/asset" type documents. 
 * 
 * @constant
 * 
 * @property {DocumentProperty} AMBERSTEEL_FORGED
 * @property {DocumentProperty} AMBERSTEEL_LINED
 * @property {DocumentProperty} AMBERSTEEL_PLATED
 * @property {DocumentProperty} ARMOR
 * @property {DocumentProperty} CLOTHING
 * @property {DocumentProperty} EXHAUSTING_TO_WIELD
 * @property {DocumentProperty} HOLDABLE
 * @property {DocumentProperty} LONG_REACH
 * @property {DocumentProperty} MELEE
 * @property {DocumentProperty} MELEE_ONLY
 * @property {DocumentProperty} PREFER_MELEE
 * @property {DocumentProperty} PREFER_RANGE
 * @property {DocumentProperty} RANGE
 * @property {DocumentProperty} RANGE_ONLY
 * @property {DocumentProperty} VERY_LONG_REACH
 * @property {DocumentProperty} WEAPON
 * @property {Array<DocumentProperty>} asArray
 */
export const ASSET_PROPERTIES = {
  LONG_REACH: new DocumentProperty({
    id: "LONG_REACH",
    localizableName: "ambersteel.character.asset.properties.longReach"
  }),
  VERY_LONG_REACH: new DocumentProperty({
    id: "VERY_LONG_REACH",
    localizableName: "ambersteel.character.asset.properties.veryLongReach"
  }),
  RANGE: new DocumentProperty({
    id: "RANGE",
    localizableName: "ambersteel.character.asset.properties.range"
  }),
  RANGE_ONLY: new DocumentProperty({
    id: "RANGE_ONLY",
    localizableName: "ambersteel.character.asset.properties.rangeOnly"
  }),
  PREFER_RANGE: new DocumentProperty({
    id: "PREFER_RANGE",
    localizableName: "ambersteel.character.asset.properties.preferRange"
  }),
  MELEE: new DocumentProperty({
    id: "MELEE",
    localizableName: "ambersteel.character.asset.properties.melee"
  }),
  MELEE_ONLY: new DocumentProperty({
    id: "MELEE_ONLY",
    localizableName: "ambersteel.character.asset.properties.meleeOnly"
  }),
  PREFER_MELEE: new DocumentProperty({
    id: "PREFER_MELEE",
    localizableName: "ambersteel.character.asset.properties.preferMelee"
  }),
  AMBERSTEEL_LINED: new DocumentProperty({
    id: "AMBERSTEEL_LINED",
    localizableName: "ambersteel.character.asset.properties.ambersteelLined"
  }),
  AMBERSTEEL_PLATED: new DocumentProperty({
    id: "AMBERSTEEL_PLATED",
    localizableName: "ambersteel.character.asset.properties.ambersteelPlated"
  }),
  AMBERSTEEL_FORGED: new DocumentProperty({
    id: "AMBERSTEEL_FORGED",
    localizableName: "ambersteel.character.asset.properties.ambersteelForged"
  }),
  EXHAUSTING_TO_WIELD: new DocumentProperty({
    id: "EXHAUSTING_TO_WIELD",
    localizableName: "ambersteel.character.asset.properties.exhaustingToWield"
  }),
  HOLDABLE: new DocumentProperty({
    id: "HOLDABLE",
    localizableName: "ambersteel.character.asset.properties.holdable"
  }),
  ARMOR: new DocumentProperty({
    id: "ARMOR",
    localizableName: "ambersteel.character.asset.properties.armor"
  }),
  CLOTHING: new DocumentProperty({
    id: "CLOTHING",
    localizableName: "ambersteel.character.asset.properties.clothing"
  }),
  WEAPON: new DocumentProperty({
    id: "WEAPON",
    localizableName: "ambersteel.character.asset.properties.weapon"
  }),
  get asArray() { return getAsArray(this); }
}

/**
 * Property constants of "skill" type documents. 
 * 
 * @constant
 * 
 * @property {DocumentProperty} MAGIC_SCHOOL
 * @property {DocumentProperty} INNATE
 * @property {Array<DocumentProperty>} asArray
 */
export const SKILL_PROPERTIES = {
  MAGIC_SCHOOL: new DocumentProperty({
    id: "MAGIC_SCHOOL",
    localizableName: "ambersteel.character.skill.property.magicSchool"
  }),
  INNATE: new DocumentProperty({
    id: "INNATE",
    localizableName: "ambersteel.character.skill.property.innate"
  }),
  get asArray() { return getAsArray(this); }
}

/**
 * Returns the values of a constants object as an array. 
 * 
 * @param {Object} obj 
 * 
 * @returns {Array<DocumentProperty>}
 */
function getAsArray(obj) {
  const result = [];

  for (const propertyName in obj) {
    if (obj.hasOwnProperty(propertyName) !== true) continue;
    if (propertyName === "asArray") continue;

    const documentProperty = obj[propertyName];

    if (documentProperty.id === undefined) continue;

    result.push(documentProperty);
  }

  return result;
}