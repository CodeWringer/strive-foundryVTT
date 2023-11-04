import Layoutable from "../../presentation/layout/layoutable.mjs";
import ViewModel from "../../presentation/view-model/view-model.mjs";
import { getNestedPropertyValue, setNestedPropertyValue } from "../util/property-utility.mjs";
import { validateOrThrow } from "../util/validation-utility.mjs";
import ValueAdapter from "../util/value-adapter.mjs";
import TransientDocument from "./transient-document.mjs";

/**
 * Represents a single data field of a document. 
 * 
 * This is a field which is linked to the underlying "system" 
 * data, wraps access and provides a means of presenting 
 * the field in the UI. 
 * 
 * Thus, both data access and data presentation need be 
 * defined only once, in a central location (on an owning 
 * `TransientDocument`). 
 * 
 * When using a `DataField`, keep in mind that the `viewModelFunc`, 
 * which instantiates the view model does **not** have to provide 
 * any `onChange` or `value` arguments, as this is implicitly 
 * handled by the `DataField`. 
 * 
 * @property {String | undefined} template Template path. 
 * @property {LayoutSize} layoutSize This element's preferred size 
 * in its parent layout. 
 * @property {String | undefined} cssClass A css class.  
 * 
 * @property {TransientDocument} document The document whose 
 * system data field this object represents. 
 * @property {Array<String>} dataPaths Property paths that identify 
 * the underlying data field. Iterates each path in succession, 
 * until one of them returns a non-undefined value. Useful to 
 * support legacy data paths. Note that the order in which they 
 * are listed in this array, is their priority. The first path is also 
 * used for writing the data to the server. 
 * E. g. `["system.health.injuries[0].name"]`
 * @property {Any} defaultValue A value that is returned when 
 * none of the `dataPaths` return a non-undefined value. 
 * @property {Function | undefined} viewModelFunc Must return a new view 
 * model instance. Receives the following arguments: 
 * * `parent: {ViewModel}` - Is a parent view model instance. 
 * This is expected to be the root view model instance of a 
 * dedicated sheet, list item or chat message. 
 * * `isOwner: {Boolean}` - Is `true`, if the current user is 
 * the owner of the document. 
 * * `isGM: {Boolean}` - Is `true`, if the current user is a GM. 
 * @property {ValueAdapter} viewModelAdapter Adapts the 
 * underlying data field's value to and from a value for use in a 
 * view model instance. 
 * @property {ValueAdapter} dtoAdapter Converts between server-side 
 * and business data. 
 */
export class DataField extends Layoutable {
  /**
   * @param {Object} args 
   * 
   * @param {String | undefined} args.template Template path. 
   * @param {LayoutSize | undefined} args.layoutSize This element's 
   * preferred size in its parent layout. 
   * @param {String | undefined} args.cssClass A css class.  
   * 
   * @param {TransientDocument} args.document The document whose 
   * system data field this object represents. 
   * @param {Array<String>} args.dataPaths Property paths that identify 
   * the underlying data field. Iterates each path in succession, 
   * until one of them returns a non-undefined value. Useful to 
   * support legacy data paths. Note that the order in which they 
   * are listed in this array, is their priority. The first path is also 
   * used for writing the data to the server. 
   * E. g. `["system.health.injuries[0].name"]`
   * @param {Any | undefined} args.defaultValue A value that is returned when 
   * none of the `dataPaths` return a non-undefined value. 
   * @param {Function | undefined} args.viewModelFunc Must return a new view 
   * model instance. Receives the following arguments: 
   * * `parent: {ViewModel}` - Is a parent view model instance. 
   * This is expected to be the root view model instance of a 
   * dedicated sheet, list item or chat message. 
   * * `isOwner: {Boolean}` - Is `true`, if the current user is 
   * the owner of the document. 
   * * `isGM: {Boolean}` - Is `true`, if the current user is a GM. 
   * @param {ValueAdapter | undefined} args.viewModelAdapter Adapts the 
   * underlying data field's value to and from a value for use in a 
   * view model instance. 
   * @param {ValueAdapter | undefined} args.dtoAdapter Adapts the 
   * underlying data field's value to and from the server persisted data. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document", "dataPaths"]);
    if (this.dataPaths.length < 1) {
      throw new Error("dataPaths must not be empty");
    }

    this.document = args.document;
    this.dataPaths = args.dataPaths;
    this.defaultValue = args.defaultValue;
    this.viewModelFunc = args.viewModelFunc;
    this.viewModelAdapter = args.viewModelAdapter ?? new ValueAdapter();
    this.dtoAdapter = args.dtoAdapter ?? new ValueAdapter();
  }

  /**
   * Returns the current value. 
   * 
   * @returns {Any}
   */
  get() {
    let dto;
    for (const dataPath of this.dataPaths) {
      dto = getNestedPropertyValue(this.document, dataPath);
      if (dto !== undefined) break;
    }
    // Set default value, in case none of the data paths returned a value. 
    if (dto === undefined) {
      dto = this.defaultValue;
    }

    return this.dtoAdapter.from(dto);
  }

  /**
   * Sets and persists the given value. 
   * 
   * @param {Any} value The value to set. 
   * 
   * @async
   */
  async set(value) {
    const transformedValue = this.dtoAdapter.to(value);
    const dataPath = this.dataPaths[0];

    setNestedPropertyValue(this.document, dataPath, transformedValue);
    await this.document.updateByPath(dataPath, transformedValue);
  }

  /**
   * Returns a new view model instance that can present this data field. 
   * 
   * Automatically hooks up listening for when the value is changed 
   * via the view model, transforms that value to a data field compliant 
   * value and then persists it. 
   * 
   * @param {ViewModel} parent Is a parent view model instance. 
   * This is expected to be the root view model instance of a 
   * dedicated sheet, list item or chat message. 
   * 
   * @returns {ViewModel} A new view model instance. 
   * 
   * @override
   */
  getViewModel(parent) {
    if (this.viewModelFunc === undefined) {
      throw new Error("No view model factory function");
    }

    const vm = this.viewModelFunc(parent, parent.isOwner, parent.isGM);

    // The initial value must be set **before** the onChange listener 
    // is hooked up, to prevent premature callback invocations. 
    vm.value = this.viewModelAdapter.to(this.get());
    vm.onChange = (_, newValue) => {
      const value = this.viewModelAdapter.from(newValue);
      this.set(value);
    };
    return vm;
  }
}
