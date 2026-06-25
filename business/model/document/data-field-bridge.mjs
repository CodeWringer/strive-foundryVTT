import { common } from "../../../common/_module.mjs";
import TransientDocument from "./transient-document.mjs";

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
   * @type {Any}
   */
  get value() { return this._value; }
  set value(value) {
    const mapped = this.toDto(value);
    this._value = mapped;
    common.util.property.setNestedPropertyValue(this.document, this._dataPath, mapped);
    this.document.updateByPath(this._dataPath, mapped);
  }

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
    this._dataPath = args.dataPath;
    this.default = args.default;
    this.fromDto = args.fromDto ?? ((dto) => dto);
    this.toDto = args.toDto ?? ((value) => value);

    // Fetch and transform value. 
    const dto = common.util.property.getNestedPropertyValue(this.document, this._dataPath);
    if (!common.util.validation.isDefined(dto) && common.util.validation.isDefined(this.default)) {
      this._value = this.default;
    } else {
      this._value = this.fromDto(dto);
    }
  }
}
