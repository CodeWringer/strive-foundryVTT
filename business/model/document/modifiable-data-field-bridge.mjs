import DataFieldBridge from "./data-field-bridge.mjs";

/**
 * For use in `TransientDocument`s, provides access to a document's 
 * data, with regard for data mappings. 
 * 
 * @property {Any} value The current value. Note that this is only 
 * a cached value - if you bypass this `DataFieldBridge` instance 
 * and update the value directly in the document's system reference, 
 * that change will not be reflected here!
 * @property {TransientDocument} document
 * @property {String} dataPath Identifies the data field on 
 * the document instance itself. E. g. `"system.bulk"`
 * * Read-only
 * * private
 * @property {Any | undefined} default A default value to 
 * use in case the data base field's value is undefined.
 * 
 * @property {Any} modified The current value, with applied modifiers. 
 * 
 * @method fromDto Maps the data coming from the data base to a 
 * domain object. 
 * Accepts a dto and must return a domain object. Arguments: 
 * * `dto: Object`
 * @method toDto Maps the current value to data that can be safely 
 * persisted to data base. Arguments: 
 * * `value: Any`
 */
export default class ModifiableDataFieldBridge extends DataFieldBridge {
  /**
   * @type {Any}
   */
  get modified() { return this._value; }
  set modified(value) {
    const applicableModifiers = this.document.modifiers.find(it => it.dataPath == this._dataPath);
    // TODO
  }
}
