import { common } from "../../../common/_module.mjs";
// Do not import TransientDocument

/**
 * For use in `TransientDocument`s, provides access to a document's 
 * data, with regard for data mappings. 
 * 
 * @property {Any} value The current value, as cached on the document. 
 * @property {TransientDocument} document
 * @property {String} dataPath Identifies the data field on 
 * the document instance itself. E. g. `"system.bulk"`
 * * Read-only
 * @property {Any | undefined} default A default value to 
 * use in case the data base field's value is undefined.
 * 
 * @method fromDto Maps the data coming from the data base to a 
 * domain object. 
 * Accepts a dto and must return a domain object. Arguments: 
 * * `dto: Object`
 * @method toDto Maps the current value to data that can be safely 
 * persisted to data base. Arguments: 
 * * `value: Any`
 */
export default class DataFieldBridge {
  /**
   * Returns the mapped value obtained through `this.fromDto`, if possible. Otherwise, returns `null`. 
   * @type {Any | null}
   */
  get value() { 
    // Fetch and transform value. 
    const dto = common.util.property.getNestedPropertyValue(this.document, this.#dataPath);
    if (!common.util.validation.isDefined(dto)) {
      if (common.util.validation.isDefined(this.default)) {
        return this.default;
      } else {
        return null;
      }
    } else {
      return this.fromDto(dto);
    }
  }
  /**
   * Sets the new value, after mapping it through `this.toDto`. 
   */
  set value(value) {
    const mapped = this.toDto(value);
    this.document.updateByPath(this.#dataPath, mapped);
  }

  /**
   * @type {String}
   * @private
   * @readonly
   */
  #dataPath;
  /**
   * @type {String}
   * @readonly
   */
  get dataPath() { return this.#dataPath; }

  /**
   * @param {Object} args 
   * @param {TransientDocument} args.document 
   * @param {String} args.dataPath Identifies the data field on 
   * the document instance itself. E. g. `"system.bulk"`
   * @param {Any | undefined} args.default A default value to 
   * use in case the data base field's value is undefined.
   * @param {Function | undefined} args.fromDto Maps the data 
   * coming from the data base to a domain object. 
   * Accepts a dto and must return a domain object. 
   * @param {Function | undefined} args.toDto Maps the current 
   * value to data that can be safely persisted to data base. 
   */
  constructor(args = {}) {
    common.util.validation.validateOrThrow(args, ["document", "dataPath"]);

    this.document = args.document;
    this.#dataPath = args.dataPath;
    this.default = args.default;
    this.fromDto = args.fromDto ?? ((dto) => dto);
    this.toDto = args.toDto ?? ((value) => value);
  }
}
