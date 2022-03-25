/**
 * @property {Number} total
 * @property {Array<RollDataComposition>} composition
 */
export class RollData {
  constructor(total, composition) {
    this.total = total ?? 0;
    this.composition = composition ?? [];
  }
}

/**
 * @property {String} name
 * @property {String} localizableName
 * @property {Number} value
 */
export class RollDataComposition {
  constructor(name, localizableName, value) {
    this.name = name;
    this.localizableName = localizableName;
    this.value = value;
  }
}
