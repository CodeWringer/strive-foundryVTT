import { Callbacks } from "../../../../common/callbacks.mjs";
import { PropertyUtil } from "../../../../common/util/property-utility.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
// Do not import Document - circuar dependency risk!

/**
 * For use in `Document`s, provides access to a document's 
 * data, with regard for data mappings. 
 * 
 * @property {Any} value The current value, as cached on the document. 
 * @property {Document} document
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
 * @method onChange Adds a handler that is invoked when the value changes. Arguments: 
 * * `newValue: Any`
 * * `oldValue: Any`
 */
export default class DataFieldBridge {
  /**
   * @summary
   * Contains a cached version of the domain value. 
   * 
   * @description
   * Specifically targets `Document` instances, which should preserve state, instead of being 
   * re-created on every access. Since `Document` instance data is always up-to-date anyway, there is 
   * no need to re-create such instances. 
   * 
   * @type {Any}
   * @private
   */
  #cache;

  /**
   * Returns the mapped value obtained through `this.fromDto`, if possible. Otherwise, returns `null`. 
   * @type {Any | null}
   */
  get value() {
    // Fetch and transform value. 
    const dto = PropertyUtil.getByPath(this.document, this.#dataPath);
    if (ValidationUtil.isDefined(dto)) {
      const converted = this.fromDto(dto, this.fromDtoArgs);

      if (!ValidationUtil.isDefined(this.#cache)) {
        this.#cache = converted;
      } else {
        if (ValidationUtil.isObject(converted) && ValidationUtil.isDefined(converted.id)) {
          if (this.#cache.id === converted.id) {
            return this.#cache;
          }
        } else if (ValidationUtil.isArray(converted)) {
          const arr = this.#getCongruatedArray(converted);
          this.#cache = arr;
          return arr;
        }
      }
      // Only reach this point in case the cache cannot be used. 
      // This will be the case for any object whose identity cannot be congruated. 
      // In practice, this targets Document instances, whose identity can be checked. 
      return converted;
    } else {
      if (ValidationUtil.isDefined(this.default)) {
        return this.default;
      } else {
        return null;
      }
    }
  }
  /**
   * Sets the new value, after mapping it through `this.toDto`. 
   * @param {Any | null} value The new, yet untransformed value to set. 
   */
  set value(value) {
    const mappedNewValue = this.toDto(value);
    const oldValue = this.value;
    this.document.updateByPath(this.#dataPath, mappedNewValue);
    this.#onChangeCallbacks.invoke(value, oldValue);
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
   * @type {Callbacks}
   * @private
   */
  #onChangeCallbacks;

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
   * @param {Function | undefined} args.fromDto Maps the data 
   * coming from the data base to a domain object. 
   * Accepts a dto and must return a domain object. Arguments: 
   * * `dto: Any`
   * * `args: Object | undefined` - additional arguments 
   * @param {Function | undefined} args.toDto Maps the current 
   * value to data that can be safely persisted to data base. Arguments: 
   * * `value: Any`
   * @param {Function | undefined} args.onChange Invoked when the value changes. Arguments: 
   * * `newValue: Any`
   * * `oldValue: Any`
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["document", "dataPath"]);

    this.document = args.document;
    this.#dataPath = args.dataPath;
    this.default = args.default;
    this.fromDtoArgs = args.fromDtoArgs ?? {};
    this.fromDto = args.fromDto ?? ((dto) => dto);
    this.toDto = args.toDto ?? ((value) => value);
    
    this.#onChangeCallbacks = new Callbacks();
    if (ValidationUtil.isDefined(args.onChange)) {
      this.#onChangeCallbacks.add(args.onChange);
    }
  }
  
  /**
   * Adds the given `handler` to invoke when the value changes. 
   * @param {Function} handler Invoked when the value changes. Arguments: 
   * * `newValue: Any`
   * * `oldValue: Any`
   * @returns {String} Handler ID. Can be used to `remove` the handler. 
   */
  onChange(handler) {
    return this.#onChangeCallbacks.add(handler);
  }

  /**
   * @param {Array<Object>} converted 
   * @returns {Array<Object>}
   * @private
   */
  #getCongruatedArray(converted) {
    const result = [];
    for (const element of converted) {
      if (ValidationUtil.isDefined(element.id)) {
        const cachedElement = this.#cache.find(it => it.id === element.id);
        if (ValidationUtil.isDefined(cachedElement)) {
          result.push(cachedElement);
        } else {
          result.push(element);
        }
      } else {
        result.push(element);
      }
    }
    return result;
  }
}
