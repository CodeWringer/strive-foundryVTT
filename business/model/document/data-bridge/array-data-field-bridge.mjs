import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import Document from "../document.mjs";
import DataFieldBridge from "./data-field-bridge.mjs";

/**
 * For use in `Document`s, provides access to a document's 
 * data, with regard for data mappings. 
 * 
 * The `fromDto` and `toDto` methods are called implicitly. A user of this class 
 * doesn't call them explicitly. The `fromDto` method's args object gets the index 
 * passed through, as well as the `fromDtoArgs`, which is flattened into the args 
 * object. 
 * 
 * @property {Any} value 
 * @property {Document} document
 * @property {String} dataPath Identifies the data field on 
 * the document instance itself. E. g. `"system.bulk"`
 * * Read-only
 * * private
 * @property {Array<Any>} default A default value to 
 * use in case the data base field's value is undefined.
 * 
 * @method onChange Adds a handler that is invoked when the value changes. Arguments: 
 * * `newValue: Any`
 * * `oldValue: Any`
 */
export default class ArrayDataFieldBridge extends DataFieldBridge {
  /**
   * @param {Object} args 
   * @param {Document} args.document Document instance that will be read from 
   * and written to. The `dataPath` must be relative to this object. 
   * @param {String} args.dataPath Identifies the data field on 
   * the document instance itself. E. g. `"system.bulk"`
   * @param {Any | undefined} args.default A default value to 
   * use in case the data base field's value is undefined.
   * @param {Object | undefined} args.fromDtoArgs Additional arguments to be passed to the 
   * `fromDto` function. 
   * @param {Function | undefined} args.onChange Invoked when the value changes. Arguments: 
   * * `newValue: Any`
   * * `oldValue: Any`
   * 
   * @param {Any} args.dataClass Class reference of the type this represents. 
   */
  constructor(args = {}) {
    super({
      ...args,
      default: args.default ?? [],
      fromDto: (dtos) => {
        let index = 0;
        return dtos.map(dto => args.dataClass.fromDto(dto, {
          index: index++,
          ...(args.fromDtoArgs ?? {}),
        }));
      },
      toDto: (value) => value.map(domainObjects => domainObjects.toDto()),
    });
    ValidationUtil.validateOrThrow(args, ["document", "dataPath", "dataClass"]);

    this.dataClass = args.dataClass;
  }
}
