/**
 * @property {Number} total The summed total of the components. 
 * @property {Array<SummedDataComponent>} components
 */
export class SummedData {
  constructor(total, components) {
    this.total = total ?? 0;
    this.components = components ?? [];
  }
}

/**
 * @property {String} name Internal name of the component. 
 * @property {String} localizableName Localizable name of the component. 
 * @property {Number} value The value of the component. 
 */
export class SummedDataComponent {
  constructor(name, localizableName, value) {
    this.name = name;
    this.localizableName = localizableName;
    this.value = value;
  }
}
