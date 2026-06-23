import { common } from "../../../common/_module.mjs";
import DataFieldBridge from "./data-field-bridge.mjs";
import TransientDocument from "./transient-document.mjs";

/**
 * For use in `TransientDocument`s, provides access to a document's 
 * data, with regard for data mappings. 
 * 
 * @property {Any} value 
 * @property {TransientDocument} document
 * @property {String} dataPath Identifies the data field on 
 * the document instance itself. E. g. `"system.bulk"`
 * * Read-only
 * * private
 * @property {Array<Any>} default A default value to 
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
export default class ArrayDataFieldBridge extends DataFieldBridge {
  /**
   * @param {Object} args 
   * @param {TransientDocument} args.document 
   * @param {String} args.dataPath Identifies the data field on 
   * the document instance itself. E. g. `"system.bulk"`
   * @param {Any} args.dataClass Class reference of the type this represents. 
   */
  constructor(args = {}) {
    super({
      ...args,
      default: [],
      fromDto: this.fromDto,
      toDto: this.toDto,
    });
    common.util.validation.validateOrThrow(args, ["document", "dataPath", "dataClass"]);

    this.dataClass = args.dataClass;
  }
  
  /**
   * 
   * @param {Array<Object>} value 
   * @returns {Array<Any>}
   */
  fromDto(dto) {
    return dto.map(it => this.dataClass.fromDto(it));
  }
  
  /**
   * 
   * @param {Array<Any>} value 
   * @returns {Array<Object>}
   */
  toDto(value) {
    return value.map(it => it.toDto());
  }
}
