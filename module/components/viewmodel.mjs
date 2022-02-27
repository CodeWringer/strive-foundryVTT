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
   */
  static get TEMPLATE() { throw new Error("NotImplementedException"); }

  /**
   * @type {String}
   * @private
   */
  _id = undefined;
  /**
   * Id used for the HTML element's id and name attributes. 
   * @type {String}
   * @readonly
   * @throws {Error} DisposedAccessViolation Thrown if the object has been disposed. 
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
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   */
  constructor(args = {}) {
    this._id = args.id ?? createUUID();
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
    const errorToThrowOnAccess = new Error("DisposedAccessViolation: The object has been disposed. Its members can no longer be accessed!");

    for (const propertyName in this) {
      // First call a potentially defined dispose method on the property to be disposed. 
      if (this.isObject(this[propertyName]) && this[propertyName].dispose !== undefined) {
        this[propertyName].dispose();
      }

      if (propertyName.startsWith("_") === true) {
        // Private variable values are set to null. 
        this[propertyName] = null;
      } else {
        // Accessors and methods are all overriden to throw an error. 
        this[propertyName] = () => { throw errorToThrowOnAccess; };
      }
    }
  }

  /**
   * Returns an object that represents the current view state. 
   * 
   * This will also contain the view states of any child view models. These sub-view-states 
   * are stored hierarchically. 
   * 
   * Only stores internal values! E. g. "_isVisible" instead of "isVisible". 
   * @returns {Object} An object that represents the current view state. 
   * @virtual
   */
  toViewState() {
    const viewState = Object.create(null);

    for(const propertyName in this) {
      if (propertyName.startsWith("_") !== true) continue;

      viewState[propertyName] = this[propertyName];
    }

    for (const child of this.children) {
      viewState[child.id] = child.toViewState();
    }
    
    return viewState;
  }
  
  /**
   * Applies the given view state, overriding any current values. 
   * @param {Object} viewState The view state to apply. 
   * @virtual
   */
  applyViewState(viewState) {
    for (const propertyName in viewState) {
      if (PropertyUtil.hasProperty(this, propertyName) !== true) continue;

      this[propertyName] = viewState[propertyName];
    }

    for (const child of this.children) {
      child.applyViewState(viewState[child.id]);
    }
  }
  
  /**
   * Returns true, if the given parameter is of type object. 
   * @param {Any} obj 
   * @returns {Boolean} True, if the given parameter is of type object. 
   * @private
   */
  isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  };

  /**
   * Registers events on elements of the given DOM. 
   * @param {Object} html DOM of the sheet for which to register listeners. 
   * @param {Boolean} isOwner If true, registers events that require owner permission. 
   * @param {Boolean} isEditable If true, registers events that require editing permission. 
   * @throws {Error} NullPointerException - Thrown if the input element could not be found. 
   */
  activateListeners(html, isOwner, isEditable) {
    for (const child of this.children) {
      child.activateListeners(html, isOwner, isEditable);
    }
  }
}
