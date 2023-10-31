import { Layoutable } from "../../presentation/layout/layout.mjs";
import ViewModel from "../../presentation/view-model/view-model.mjs";
import { getNestedPropertyValue, setNestedPropertyValue } from "../util/property-utility.mjs";
import { validateOrThrow } from "../util/validation-utility.mjs";
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
 * @property {String} template Template path. 
 * @property {Function} viewModelFunc Must return a new view 
 * model instance. Receives the following arguments: 
 * * `parent: {ViewModel}`
 * @property {LayoutSize} layoutSize 
 * @property {String | undefined} cssClass A css class.  
 * 
 * @property {TransientDocument} document The document whose 
 * system data field this object represents. 
 * @property {String} dataPath A property path that identifies 
 * the underlying data field. 
 * E. g. `"system.health.injuries[0].name"`
 * @property {DataFieldAdapter} adapter Adapts the 
 * underlying data field's value to and from a value for use in a 
 * view model instance. 
 */
export class DataField extends Layoutable {
  /**
   * @param {Object} args 
   * 
   * @param {String} args.template Template path. 
   * @param {Function} args.viewModelFunc Must return a new view 
   * model instance. Receives the following arguments: 
   * * `parent: {ViewModel}`
   * @param {LayoutSize | undefined} args.layoutSize 
   * @param {String | undefined} args.cssClass A css class.  
   * 
   * @param {TransientDocument} args.document The document whose 
   * system data field this object represents. 
   * @param {String} args.dataPath A property path that identifies 
   * the underlying data field. 
   * E. g. `"system.health.injuries[0].name"`
   * @param {DataFieldAdapter | undefined} args.adapter Adapts the 
   * underlying data field's value to and from a value for use in a 
   * view model instance. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document", "dataPath"]);

    this.document = args.document;
    this.dataPath = args.dataPath;
    this.adapter = args.adapter ?? new DataFieldAdapter();
  }

  /**
   * Returns the current value. 
   * 
   * @returns {Any}
   */
  get() {
    return getNestedPropertyValue(this.document, this.dataPath);
  }

  /**
   * Sets and persists the given value. 
   * 
   * @param {Any} value The value to set. 
   * 
   * @async
   */
  async set(value) {
    setNestedPropertyValue(this.document, this.dataPath, value);
    await this.document.updateByPath(this.dataPath, value);
  }

  /**
   * Returns a new view model instance that can present this data field. 
   * 
   * Automatically hooks up listening for when the value is changed 
   * via the view model, transforms that value to a data field compliant 
   * value and then persists it. 
   * 
   * @param {ViewModel} parent The parent view model. 
   * @param {Boolean} isOwner
   * @param {Boolean} isGM
   * 
   * @returns {ViewModel} A new view model instance. 
   * 
   * @override
   */
  getViewModel(parent, isOwner, isGM) {
    const vm = super.getViewModel(parent);

    // The initial value must be set **before** the onChange listener 
    // is hooked up, to prevent premature callback invocations. 
    vm.value = this.adapter.toViewModelValue(this.get());
    vm.onChange = (_, newValue) => {
      const value = this.adapter.fromViewModelValue(newValue);
      this.set(value);
    };
    return vm;
  }
}

/**
 * Adapts the value of a `DataField` to and from the value for use 
 * in one of its view model instances. 
 * 
 * For example, when a view model's value is of type `ChoiceOption`, 
 * but the underlying data field's value is of type `String`, then 
 * this adapter will be used transform the `String` value to a 
 * `ChoiceOption` and back again. 
 * 
 * @method toViewModelValue Transforms the value to 
 * something the view model can use. Receives the value as its 
 * sole argument and must return the transformed value. 
 * @method fromViewModelValue Transforms the value  
 * from the view model value to something the underlying data field 
 * can use. Receives the value as its sole argument and must return 
 * the transformed value. 
 */
export class DataFieldAdapter {
  /**
   * @param {Object} args 
   * @param {Function} args.toViewModelValue Transforms the value to 
   * something the view model can use. Receives the value as its 
   * sole argument and must return the transformed value. 
   * @param {Function} args.fromViewModelValue Transforms the value  
   * from the view model value to something the underlying data field 
   * can use. Receives the value as its sole argument and must return 
   * the transformed value. 
   */
  constructor(args = {}) {
    this.toViewModelValue = args.toViewModelValue ?? ((value) => { return value; });
    this.fromViewModelValue = args.fromViewModelValue ?? ((value) => { return value; });
  }
}
