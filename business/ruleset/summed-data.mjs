/**
 * Represents the sum of one or more numeric data components. 
 * 
 * @property {Number} total The summed total of the components. 
 * * read-only
 * @property {Array<SumComponent>} components The composition of this sum. 
 */
export class Sum {
  /**
   * @type {Number}
   * @readonly
   */
  get total() {
    let sum = 0;

    this.components.forEach(component => {
      sum += component.value;
    });

    return sum;
  }

  /**
   * @param {Array<SumComponent> | undefined} components The composition of this sum. 
   */
  constructor(components) {
    this.components = components ?? [];
  }
}

/**
 * Represents a numeric data component. 
 * 
 * @property {String} name Internal name of the component. 
 * @property {String} localizableName Localizable name of the component. 
 * @property {Number} value The value of the component. 
 */
export class SumComponent {
  constructor(name, localizableName, value) {
    this.name = name;
    this.localizableName = localizableName;
    this.value = value;
  }
}
