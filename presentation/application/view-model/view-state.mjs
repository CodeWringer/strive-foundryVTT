import { PropertyUtil } from "../../../common/util/property-utility.mjs";
import { ValidationUtil } from "../../../common/util/validation-utility.mjs";

/**
 * Handles a `ViewModel`'s view state, which you need to persist between instantiations of the `ViewModel` instance. 
 * 
 * Example use cases would be: list item expansion state, a toggle to show additional tooltip details, by default. 
 * 
 * The expected flow is thus:
 * 1. Inside the `ViewModel`'s `constructor`, call `register` to ensure the properties you want persisted are known 
 * as view state. 
 * 2. At the end of the `constructor`, call `read` to get and apply the view state. 
 * 3. Whenever a relevant value is changed, call `write`, OR, call during `dispose`. 
 */
export default class ViewState {
  /**
   * The data source for view state objects. 
   * 
   * By default, they are stored on a global singleton object within the STRIVE game system object. 
   * This date will only persist for a session, but not beyond. Meaning, if a user reloads the 
   * web page, all view state data is lost. In order to preserve beyond site reloads, write the 
   * view state to DB. 
   * 
   * @type {Map<String, Object>}
   * @private
   */
  #source = game.strive.viewStates;

  /**
   * An array of property names. These are the properties of the view model that will 
   * automatically be written to / restored from view state. 
   * 
   * @type {Array<String>}
   * @protected
   */
  #propertyNames = [];

  /**
   * @param {Object} args 
   * @param {ViewModel} args.viewModel 
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["viewModel"]);

    this.viewModel = args.viewModel;
  }

  /**
   * @summary
   * Registers a property of *this* view model as view state storeable/restorable. 
   * 
   * Call this inside the view model's `constructor`. 
   * 
   * @description
   * Silently prevents adding the same property name multiple times. 
   * 
   * Does not verify that a property with the given name exists on this view model instance. 
   * 
   * @param {String} propertyName Name of a property to register as view state writeable/restorable. 
   */
  register(propertyName) {
    const existingEntry = this.#propertyNames.find(it => it === propertyName);
    if (!ValidationUtil.isDefined(existingEntry)) {
      this.#propertyNames.push(propertyName);
    }
  }

  /**
   * Unregisters a property with the given `propertyName`. 
   * @param {String} propertyName Name of the property to unregister. 
   */
  unregister(propertyName) {
    const index = this.#propertyNames.findIndex(it => it === propertyName);
    if (index < 0) return;

    this.#propertyNames.splice(index, 1);
  }

  /**
   * Retrieves and applies the view state. 
   * 
   * In order for this operation to succeed, view state properties must have been 
   * registered and the view state written out, beforehand. 
   */
  read() {
    const viewState = this.#source.get(this.id);
    if (viewState !== undefined) {
      this.#apply(viewState);
    }

    for (const child of this.viewModel.children) {
      child.viewState.read();
    }
  }

  /**
   * Stores the current view state. 
   */
  write() {
    const viewState = this.#get()
    if (ValidationUtil.isDefined(viewState) === true) {
      this.#source.set(this.id, viewState);
    }
    for (const child of this.viewModel.children) {
      child.viewState.write();
    }
  }

  /**
   * @summary
   * Returns the current view state. 
   * 
   * @description
   * Creates an object that represents the view state, if there is any view state to store. 
   * 
   * Keep in mind that **only** _this_ view model's state is returned. **No** child view model states 
   * will be included! 
   * 
   * Whether there is any view state to store, is determined by whether any properties have been registered 
   * and if any of the child view models return view state to store. 
   * 
   * This method should only have to be overridden, if specific data transformations need to be applied to values 
   * to store on the view state. 
   * 
   * @returns {Object | undefined} An object that represents the current view state, 
   * or undefined, if there is no view state to save. 
   * 
   * @private
   */
  #get() {
    if ((this.#propertyNames ?? []).length < 1) {
      return undefined;
    }

    const viewState = Object.create(null);
    for (const propertyName of this.#propertyNames) {
      viewState[propertyName] = this.viewModel[propertyName];
    }

    return viewState;
  }
  
  /**
   * @summary
   * Applies the given view state, overriding any current values. 
   * 
   * @description
   * This method applies any properties from the given view state to _this_ view model instance, whose names are contained 
   * by the array of registered properties. 
   * 
   * Keep in mind that **only** _this_ view model's state is affected. **No** child view model states 
   * will be affected! 
   * 
   * This method should only have to be overridden, if specific data transformations need to be applied to values 
   * to apply from the view state. 
   * 
   * @param {Object | undefined} viewState The view state to apply, or undefined. 
   * * It can be undefined, if there is no view state to store. This can be the case, if no properties are registered 
   * as storeable. 
   * 
   * @private
   */
  #apply(viewState) {
    // If the view state is undefined, it cannot be applied. 
    if (viewState === undefined || viewState === null) return;

    for (const propertyName of this.#propertyNames) {
      // Skip any potential "mistakes" - for example from old versions of the code. 
      if (PropertyUtil.hasProperty(viewState, propertyName) !== true) continue;
      // Override the matching property's value. 
      this.viewModel[propertyName] = viewState[propertyName];
    }
  }
}
