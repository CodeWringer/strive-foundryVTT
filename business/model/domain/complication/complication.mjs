import { common } from "../../../../common/_module.mjs";
import Persistable from "../persistable.mjs";

/**
 * Represents a Complication of a Project or of an Asset. 
 * 
 * @property {String} name
 * @property {String} description Html content. 
 * 
 * @extends DomainDataField
 */
export default class Complication extends Persistable {
  /**
   * @param {Object} dto 
   * @param {String} dto.name 
   * @param {String | undefined} dto.description 
   * 
   * @returns {Complication}
   * 
   * @static
   * @override
   */
  static fromDto(dto) {
    return new Complication({
      name: dto.name,
      description: dto.description ?? "",
    });
  }

  /**
   * @type {String}
   * @private
   */
  #name = "";
  get name() { return this.#name; }
  set name(value) {
    const old = this.#name;
    this.#name = value;
    this.onChange("name", value, old);
  }
  
  /**
   * @type {String}
   * @private
  */
 #description = "";
 get description() { return this.#description; }
 set description(value) {
   const old = this.#description;
   this.#description = value;
   this.onChange("description", value, old);
 }

  /**
   * @param {Object} args 
   * @param {String} args.name
   * @param {String | undefined} args.description Html content. 
   * @param {Function<void> | undefined} args.onChange Invoked when any property value changes. Arguments: 
   * * `fieldName: String` - Name of the field/property on this instance that was changed. 
   * * `newValue: Any` - Value after the change, and the current value. 
   * * `oldValue: Any` - Value prior to the change. 
   */
  constructor(args = {}) {
    super(args);
    
    common.util.validation.validateOrThrow(args, ["name"]);
    this.#name = args.name;
    this.#description = args.description ?? "";
    this.onChange = args.onChange ?? (() => {});
  }

  /** @override */
  toDto() {
    return {
      name: this.name,
      description: this.description,
    };
  }
}
