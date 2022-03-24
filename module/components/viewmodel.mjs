import { createUUID } from "../utils/uuid-utility.mjs";
import * as PropertyUtil from "../utils/property-utility.mjs";

/**
 * @summary
 * Represents the base type for view models. 
 * 
 * A view model is a "code-behind" file/class, strictly associated with *one* ui template and whose purpose is 
 * to contain *all* of the ui-logic. Ideally, the ui template only ever queries primitive values from the view model. 
 * 
 * View models, much like ui templates, have a hierarchical (parent-child) relationship. Every view model can contain 
 * none or many child view models, while they may have at most one parent. 
 * 
 * @description
 * For example, in order to determine whether an element in the ui template should be visible, instead of having 
 * if-blocks inside the template which check for many conditions, there is a simple if block that only queries 
 * one boolean value from the view model. E. g.: 
 * 
 * {{#if viewModel.isHpVisible}}<span>viewModel.HP</span>{{/if}}
 * 
 * The advantage of this is to keep ui-logic outside of ui templates, where Handlebars would take over executing 
 * its helper functions. Those helper functions are very difficult to debug, as it is difficult to keep track 
 * of where they're actually being called. With a view model, it is immediately apparent which template 
 * is faulty and the code being run can be easily debugged, too. 
 * 
 * Another advantage of the view models is that one can pass in specific instances to be used in operations. 
 * As an example, a button on an actor sheet is supposed to delete a specific item from the actor, when 
 * it is clicked. Without view models, one would have to store the id of the item to delete on the button 
 * (or any other accessible DOM element) and when the button was clicked, it would have to retrieve that id 
 * from the DOM element, then retrieve the item via that id, which implies knowing where the item is stored, 
 * as well. After all, items could be stored on an actor (embedded), in the world or even in companion packs. 
 * 
 * Since, in order to pass in the id of the item, you have to have that id, it can be assumed you also already 
 * have the item or can fetch it. So instead of passing in the id, you pass in the item itself. The view model can 
 * then work with that instance, directly. A layer of indirection and DOM manipulation/analysis can thus be 
 * omitted, entirely. 
 * 
 * Also a feature of the view models is the ability to have persistent view state. 
 * In order to achieve that, view models can write their current state to an object, which can then be 
 * stored in some global location and later retrieved and applied to the view model. 
 * 
 * Since view models are always disposed when their associated document sheet is closed, 
 * their current state, naturally, gets lost. When a view model is re-instantiated, its stored view state 
 * can be fetched from the global location and applied, thus restoring its previous state. 
 * 
 * IMPORTANT: Persistent state can only be achieved, if the ids of the child view models 
 * always remain the same. This implies that the parent view model must create its child view models and 
 * pass in explicit ids for them to use. 
 * 
 * @property {String} id Id used for the HTML element's id and name attributes. 
 * @property {ViewModel | undefined} parent Optional. Parent ViewModel instance of this instance. 
 * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
 * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
 * @property {Array<ViewModel>} children An array of the child view models of this view model. 
 * @property {String} TEMPLATE Static. Returns the template this ViewModel is intended for. 
 */
export default class ViewModel {
  /**
   * Static. Returns the template this ViewModel is intended for. 
   * @abstract
   * @throws {Error} NotImplementedException - Thrown if not overriden by implementing types. 
   * @readonly
   */
  static get TEMPLATE() { throw new Error("NotImplementedException"); }

  /**
   * The exception to throw when disposed fields and methods are accessed. 
   * @type {Error}
   * @readonly
   */
  static get DISPOSED_ACCESS_VIOLATION_EXCEPTION() { return new Error("DisposedAccessViolation: The object has been disposed and its members can no longer be accessed"); }

  /**
   * @type {String}
   * @private
   */
  _id = undefined;
  /**
   * @summary
   * Unique ID of this view model instance. 
   * 
   * @description
   * This unique ID is used to identify the same instance of this view model. It may also be set on DOM elements that 
   * are associated with this view model. 
   * 
   * The ID also serves as the key to read and write from/to the global view states map. 
   * 
   * **IMPORTANT** This string may not contain any special characters! Alphanumeric symbols, as well as hyphen ('-') and 
   * underscore ('_') are permitted, but no dots, brackets, braces, slashes, equal sign, and so on. Failing to comply to this 
   * naming restriction may result in DOM elements not being properly detected by the 'activateListeners' method. 
   * 
   * @type {String}
   * @readonly
   */
  get id() { return this._id; }
  
  /**
   * Parent ViewModel instance of this instance. 
   * 
   * If undefined, then this ViewModel instance may be regarded as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @type {ViewModel | undefined}
   * @readonly
   */
  parent = undefined;

  /**
   * An array of the child view models of this view model. 
   * @type {Array<ViewModel>}
   * @readonly
   */
  children = [];

  /**
   * An array of property names. These are the properties of *this* view model that will 
   * automatically be written to / restored from view state. 
   * @type {Array<String>}
   * @protected
   */
  viewStateFields = [];

  /**
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * 
   * If no value is provided, a shortened UUID will be generated for it. 
   * 
   * This string may not contain any special characters! Alphanumeric symbols, as well as hyphen ('-') and 
   * underscore ('_') are permitted, but no dots, brackets, braces, slashes, equal sign, and so on. Failing to comply to this 
   * naming restriction may result in DOM elements not being properly detected by the 'activateListeners' method. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   */
  constructor(args = {}) {
    const id = args.id ?? createUUID();

    this._id = args.parent !== undefined ? `${args.parent.id}-${id}` : id;
    this.parent = args.parent;

    if (this.parent !== undefined) {
      this.parent.children.push(this);
    }
  }

  /**
   * Disposes of any working data. 
   * 
   * This is a clean-up operation that should only be called when the instance of this class is no longer needed!
   * @virtual
   */
  dispose() {
    // First of all, dispose of children. 
    if (this.children !== undefined && this.children !== null) {
      for (const child of this.children) {
        try {
          child.dispose();
          child.parent = null;
        } catch (error) {
          game.ambersteel.logger.logWarn(error);
        }
      }
    }
    this.children = null;

    // Set properties of this view model to null. 
    for (const propertyName in this) {
      // Call dispose on any property that supports it. 
      if (PropertyUtil.isObject(this[propertyName]) 
        && this[propertyName].dispose !== undefined
        && propertyName !== "parent") {
        this[propertyName].dispose();
      }
      // Set property to null, thus 'hopefully' freeing its referenced value up for garbage collection. 
      this[propertyName] = null;
    }
    // Ensure methods cannot be called again. 
    this.dispose = () => { /** Do nothing. */ };
    this.toViewState = () => { throw ViewModel.DISPOSED_ACCESS_VIOLATION_EXCEPTION; };
    this.applyViewState = () => { throw ViewModel.DISPOSED_ACCESS_VIOLATION_EXCEPTION; };
    this.activateListeners = () => { throw ViewModel.DISPOSED_ACCESS_VIOLATION_EXCEPTION; };
  }

  /**
   * @summary
   * Registers a property of *this* view model as view state storeable/restorable. 
   * 
   * @description
   * Silently prevents adding the same property name multiple times. 
   * 
   * Does not verify that a property with the given name exists on this view model instance. 
   * @param {String} propertyName Name of a property to register as view state writeable/restorable. 
   */
  registerViewStateProperty(propertyName) {
    const existingEntry = this.viewStateFields.find(it => { return it === propertyName });
    if (existingEntry === undefined) {
      this.viewStateFields.push(propertyName);
    }
  }

  /**
   * @summary
   * Returns the current view state. 
   * 
   * @description
   * Creates an object that represents the view state, if there is any view state to store. 
   * 
   * Whether there is any view state to store, is determined by whether any propertys have been registered 
   * and if any of the child view models return view state to store. 
   * 
   * This method should only have to be overridden, if specific data transformations need to be applied to values 
   * to store on the view state. 
   * 
   * @returns {Object | undefined} An object that represents the current view state, 
   * or undefined, if there is no view state to save. 
   * @virtual
   */
  toViewState() {
    let viewState = undefined;

    for (const propertyName of this.viewStateFields) {
      if (viewState === undefined) {
        viewState = Object.create(null);
      }
      viewState[propertyName] = this[propertyName];
    }

    for (const child of this.children) {
      const childViewState = child.toViewState();
      if (childViewState === undefined) continue;
      
      if (viewState === undefined) {
        viewState = Object.create(null);
      }
      viewState[child.id] = childViewState;
    }
    
    return viewState;
  }
  
  /**
   * @summary
   * Applies the given view state, overriding any current values. 
   * 
   * @description
   * This method applies any properties from the given view state to this view model instance, whose names are contained 
   * by the array of registered properties. 
   * 
   * This method should only have to be overridden, if specific data transformations need to be applied to values 
   * to apply from the view state. 
   * 
   * @param {Object | undefined} viewState The view state to apply, or undefined. 
   * It can be undefined, if there is no view state to store. This can be the case, if no properties are registered 
   * as storeable, either in this view model instance or in all of its children. 
   * @virtual
   */
  applyViewState(viewState) {
    // If the view state is undefined, it cannot be applied. 
    if (viewState === undefined || viewState === null) return;

    for (const propertyName of this.viewStateFields) {
      if (PropertyUtil.hasProperty(viewState, propertyName) !== true) continue;

      this[propertyName] = viewState[propertyName];
    }

    for (const child of this.children) {
      if (PropertyUtil.hasProperty(viewState, child.id) !== true) continue;

      child.applyViewState(viewState[child.id]);
    }
  }
  
  /**
   * Registers events on elements of the given DOM. 
   * @param {Object} html DOM of the sheet for which to register listeners. 
   * @param {Boolean} isOwner If true, registers events that require owner permission. 
   * @param {Boolean} isEditable If true, registers events that require editing permission. 
   * @throws {Error} NullPointerException - Thrown if the input element could not be found. 
   */
  activateListeners(html, isOwner, isEditable) {
    for (const child of this.children) {
      try {
        child.activateListeners(html, isOwner, isEditable);
      } catch (error) {
        game.ambersteel.logger.logWarn(error);
      }
    }
  }

  /**
   * Retrieves and applies the view state. 
   * @param {Map<String, Object>} globalViewStates 
   */
  readViewState(globalViewStates = game.ambersteel.viewStates) {
    const viewState = globalViewStates.get(this.id);
    if (viewState !== undefined) {
      this.applyViewState(viewState);
    }
  }

  /**
   * Stores the current view state of this view model. 
   * @param {Map<String, Object>} globalViewStates 
   */
  writeViewState(globalViewStates = game.ambersteel.viewStates) {
    const viewState = this.toViewState()
    globalViewStates.set(this.id, viewState);
  }

  /**
   * @summary
   * Stores the current view state of the entire view model hierarchy this view model is a part of. 
   * 
   * @description
   * The top-most parent in the hierarchy of parents writes out its state. 
   * 
   * To that end, the hierarchy is traversed upwards, starting with the parent of this view model instance. 
   * @param {Map<String, Object>} globalViewStates 
   */
  writeAllViewState(globalViewStates = game.ambersteel.viewStates) {
    if (this.parent !== undefined && this.parent !== null) {
      this.parent.writeAllViewState(globalViewStates);
    } else {
      this.writeViewState(globalViewStates);
    }
  }
}
