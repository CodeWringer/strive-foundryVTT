import { createUUID } from "../utils/uuid-utility.mjs";
import * as PropertyUtil from "../utils/property-utility.mjs";

export const DisposedAccessViolation = new Error("DisposedAccessViolation: The object has been disposed and its members can no longer be accessed");

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
   * 
   * The id of this view model serves as the key to read/write from/to the global view states map. 
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
    // First of all, dispose of children. 
    if (this.children !== undefined && this.children !== null) {
      while (this.children.length > 0) {
        const child = this.children[0];
        child.dispose();
        this.children.splice(0, 1);
      }
    }
    this.children = null; // *Should* be unnecessary, but better safe than sorry...

    // Remove from parent, if possible. 
    if (this.parent !== undefined && this.parent !== null) {
      const index = this.parent.children.indexOf(this);
      if (index >= 0) {
        this.parent.children.splice(index, 1);
      }
    }
    this.parent = null; // *Should* be unnecessary, but better safe than sorry...

    // Set properties of this view model to null. 
    for (const propertyName in this) {
      // Call dispose on any property that supports it. 
      if (this.isObject(this[propertyName]) && this[propertyName].dispose !== undefined) {
        this[propertyName].dispose();
      }
      // Set property to null, thus 'hopefully' freeing its referenced value up for garbage collection. 
      this[propertyName] = null;
    }
    // Ensure methods cannot be called again. 
    this.dispose = () => { throw DisposedAccessViolation };
    this.toViewState = () => { throw DisposedAccessViolation; };
    this.applyViewState = () => { throw DisposedAccessViolation; };
    this.isObject = () => { throw DisposedAccessViolation; };
    this.activateListeners = () => { throw DisposedAccessViolation; };
  }

  /**
   * @summary
   * Returns an object that represents the current view state. 
   * 
   * @description
   * By default, the returned object will *only* contain the view states of the child view models. 
   * 
   * This means that types which extend {ViewModel} *must* override this method, if they mean to store 
   * any variables which should be retrievable. 
   * 
   * Making the storing of variables an explicit task avoids cluttering up the view state objects with 
   * unnecessary data and also makes debugging easier, as view state objects become more manageable, 
   * the fewer properties they contain. 
   * @returns {Object} An object that represents the current view state. 
   * @virtual
   */
  toViewState() {
    const viewState = Object.create(null);

    for (const child of this.children) {
      viewState[child.id] = child.toViewState();
    }
    
    return viewState;
  }
  
  /**
   * @summary
   * Applies the given view state, overriding any current values. 
   * 
   * @description
   * This method looks for any properties whose names match in the given view state object and this current 
   * view state instance. It will then apply the value from the property on the view state to this property 
   * with the same name on this view model instance. 
   * 
   * This means that types which extend {ViewModel} needn't override this method, unless if they have specific 
   * functionality that they need. 
   * @param {Object | undefined} viewState The view state to apply. 
   * @virtual
   */
  applyViewState(viewState) {
    // There may be cases where a parent's state is at least partially stored, but not fully. 
    // *This* instance of a ViewModel right here might not yet have been stored. Therefore, 
    // the outdated state may be fetched and applied. To avoid null reference exceptions, 
    // we can safely skip *this* method here. 

    // A more concrete example: 
    // * User opens character sheet.
    // * User closes character sheet. View state is written. 
    // * User re-opens the character sheet and adds one skill item. 
    // * The sheet is re-rendered, thus re-instantiating view models and re-applying their view states. 
    // * At this point, no state for the newly added skill item has been written, yet, as the 
    // sheet hasn't been closed, yet. 
    // * Without the if check here, the invocation of this method for the view model of the 
    // newly added skill item would throw an error, as logically, its state could not yet be retrieved. 
    if (viewState === undefined) return;

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
}
