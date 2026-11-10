import { ExtenderUtil } from "../../../common/util/extender-util.mjs";
import { UuidUtil } from "../../../common/util/uuid-utility.mjs";
import { ValidationUtil } from "../../../common/util/validation-utility.mjs";
import VisibilityRule from "../../model/visibility-rule.mjs";
import { SheetUtil } from "../../util/sheet-utility.mjs";
import Tooltip from "../component/tooltip/tooltip.mjs";
import ViewState from "./view-state.mjs";

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
 * one boolean value from the view model. E.g.: 
 * ```HTML
 * {{#if viewModel.isHpVisible}}<span>viewModel.HP</span>{{/if}}
 * ```
 * The advantage of this is to keep ui-logic outside of ui templates, where Handlebars would take over executing 
 * its helper functions. Those helper functions are very difficult to debug, as it is difficult to keep track 
 * of where they're actually being called. With a view model, it is immediately apparent which template 
 * is faulty and the code being run can be easily debugged. 
 * 
 * ## Less Indirection
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
 * ## View State
 * 
 * Also a feature of the view models is the ability to have persistent view state - at least during a session. 
 * In order to achieve that, view models can write their current state to an object, which can then be 
 * stored in some global location and later retrieved and applied to the view model. 
 * 
 * IMPORTANT: Persistent state can only be achieved, if the IDs of the child view models 
 * always remain the same. This implies that the parent view model must create its child view models and 
 * pass in explicit IDs for them to use. E. g.:
 * ```JS
 * constructor() {
 *   this.vmChild = new ViewModel({
 *     id: "myChild",
 *     parent: this,
 *   });
 * }
 * ```
 * 
 * @example
 * Register a view state property for automatic storing and restoring after re-renders. 
 * ```JS
 * _isExpanded = false;
 * 
 * [...]
 * 
 * constructor() {
 *   this.viewState.register("_isExpanded");
 *   this.viewState.read();
 * }
 * 
 * [...]
 * 
 * // Some other code, maybe an event callback.
 * this._isExpanded = true;
 * this.viewState.write(); // Must be called explicitly to persist the view state change. 
 * ```
 * 
 * @abstract Inheritors MUST implement:
 * * `static get TEMPLATE`
 * * `get clazz`
 * 
 * @property {String} id Unique ID of this view model instance. 
 * * Read-only
 * @property {ViewModel | undefined} parent Optional. Parent ViewModel instance of this instance. 
 * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
 * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
 * @property {Array<ViewModel>} children An array of the child view models of this view model. 
 * * Read-only
 * @property {String} TEMPLATE Static. Returns the template this ViewModel is intended for. 
 * * Read-only
 * @property {Boolean} isEditable If true, the view model data is editable.
 * @property {Boolean} isGM Returns `true`, if the current user is a GM. 
 * * Read-only
 * @property {ViewModelToolTipDefinition | undefined} toolTipDefinition A localized text to 
 * display as a tool tip. 
 * @property {Boolean} showReminders Returns `true`, if rule reminders are enabled. 
 * * Read-only
 * @property {Boolean} showSecrets Returns `true`, if GM or user-specific secrets contained by this 
 * view model are to be shown. 
 * * Read-only
 * @property {JQuery} element Returns a JQuery-wrapped HTMLElement whose id attribute corresponds to `this.id`. 
 * Note: Only available **after** the *first* call to `activateListeners`! 
 * * Read-only
 * @property {Boolean} isDisposed Internal flag for use by inheritors. 
 * * Read-only
 * * Protected
 */
export default class ViewModel {
  /**
   * Returns the template this ViewModel is intended for. 
   * @type {String}
   * @abstract
   * @throws {Error} NotImplementedException - Thrown if not overriden by implementing types. 
   * @readonly
   * @static
   */
  static get TEMPLATE() { throw new Error("NotImplementedException"); }
  
  // TODO remove when no longer needed. 
  get isOwner() { throw new Error("Deprecated"); }
  get document() { throw new Error("Deprecated"); }
  
  /**
   * Internal unique ID of this view model instance.
   * 
   * @type {String}
   * @protected
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
  get id() { return (!ValidationUtil.isDefined(this.parent)) ? this._id : `${this.parent.id}_${this._id}`; }

  /**
   * @summary
   * Unique ID of just this view model instance, without its parent's ID. 
   * 
   * @type {String}
   * @readonly
   */
  get independentId() { return this._id; }

  /**
   * Returns the class reference of this instance. Required for extending this object. 
   * 
   * @virtual
   * @readonly
   */
  get clazz() { return ViewModel; }

  /**
   * @type {ViewModel | undefined}
   * @private
   */
  _parent = undefined;
  /**
   * Parent ViewModel instance of this instance. 
   * 
   * If undefined, then this ViewModel instance may be regarded as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @type {ViewModel | undefined}
   */
  get parent() { return this._parent; }
  /**
   * Parent ViewModel instance of this instance. 
   * 
   * If undefined, then this ViewModel instance may be regarded as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {ViewModel | undefined} value
   * 
   * @throws InvalidArgumentException - Thrown, if a view model instance is assigned as its own parent. 
   */
  set parent(value) {
    if (value == this) {
      throw new Error("InvalidArgumentException: Recursion! A view model cannot be assigned as its own parent");
    } else if (this.#isParentOf(value) === true) {
      throw new Error("InvalidArgumentException: Recursion! A child or indirect child view model cannot be assigned as the parent of one of its parents");
    }

    // Remove from previous parent. 
    if (ValidationUtil.isDefined(this._parent) && ValidationUtil.isDefined(this._parent.children)) {
      const index = this._parent.children.indexOf(this);
      this._parent.children.splice(index, 1);
    }

    // Add to new parent. 
    this._parent = value;
    if (ValidationUtil.isDefined(this._parent) && ValidationUtil.isDefined(this._parent.children)) {
      this._parent.children.push(this);
    }
  }

  /**
   * An array of the child view models of this view model. 
   * 
   * @type {Array<ViewModel>}
   * @readonly
   */
  children = [];

  /**
   * @type {Boolean}
   * @protected
   */
  _isEditable = false;
  /**
   * If true, the view model data is editable. 
   * 
   * Propagates changes to this property to all children. 
   * 
   * @type {Boolean}
   * @default `false`
   */
  get isEditable() { return this._isEditable; }
  set isEditable(value) {
    this._isEditable = value;

    for (const child of this.children) {
      child.isEditable = value;
    }

    this.#evaluateVisibilityRules();
  }
  
  /**
   * If true, the current user is a GM. 
   * @type {Boolean}
   * @readonly
   */
  get isGM() { return game.user.isGM; }
  
  /**
   * @type {ViewModelToolTipDefinition | undefined}
   */
  get toolTipDefinition() {
    return this._toolTipDefinition;
  }
  /**
   * @param {ViewModelToolTipDefinition | undefined} value 
   */
  set toolTipDefinition(value) {
    this._toolTipDefinition = value;

    let toolTipVisible = false;

    if (ValidationUtil.isDefined(this._toolTip)) {
      toolTipVisible = this._toolTip.visible;
      this._toolTip.deactivateListeners();
      this._toolTip.hide();
      this._toolTip = null;
    }

    if (ValidationUtil.isDefined(value)) {
      this._toolTip = new Tooltip({
        id: `${this.id}-tooltip`,
        content: this._toolTipDefinition.localized,
        style: this._toolTipDefinition.style,
      });
      this._toolTip.activateListeners(this._element);
      if (toolTipVisible) {
        this._toolTip.show();
      }
    }
  }

  /**
   * Returns true, if rule reminders are enabled. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get showReminders() { return game.strive.enableReminders; }

  /**
   * Returns a JQuery-wrapped HTMLElement whose id attribute corresponds to `this.id`. 
   * Note: Only available **after** the *first* call to `activateListeners`! 
   * 
   * @type {JQuery}
   * @readonly
   */
  get element() { return this._element; }

  get visible() { return this._visible; }
  set visible(value) {
    this._visible = value;
    if (value) {
      this.element.removeClass("hidden");
    } else {
      this.element.addClass("hidden");
    }
  }

  /**
   * @type {Boolean}
   * @readonly
   */
  get showSecrets() { return this._showSecrets; }
  set showSecrets(value) { this._showSecrets = value; }

  /**
   * @type {Boolean}
   * @readonly
   * @protected
   */
  get isDisposed() { return this._isDisposed; }

  /**
   * Defines the rules to hide elements after the template is rendered. 
   * @type {Array<VisibilityRule>}
   * @readonly
   * @virtual
   */
  get visibilityRules() { return []; }

  /**
   * @type {ViewState}
   * @private
   */
  #viewState;
  /**
   * @type {ViewState}
   * @readonly
   */
  get viewState() { return this.#viewState; }

  /**
   * @param {Object} args The arguments object. 
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * 
   * If no value is provided, a shortened UUID will be generated for it. 
   * 
   * This string may not contain any special characters! Alphanumeric symbols, as well as hyphen ('-') and 
   * underscore ('_') are permitted, but no dots, brackets, braces, slashes, equal sign, and so on. Failing to comply to this 
   * naming restriction may result in DOM elements not being properly detected by the `activateListeners` method. 
   * @param {ViewModel | undefined} args.parent Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the view model data is editable.
   * * default `parent.isEditable` or `false`. 
   * @param {Boolean | undefined} args.visible
   * * default `true`
   * @param {ViewModelToolTipDefinition | undefined} args.toolTip Creates a tool tip definition.
   * @param {Boolean | undefined} args.showSecrets `true`, if GM or user-specific secrets contained by this 
   * view model are to be shown. 
   * * default `parent.showSecrets` or `false`
   */
  constructor(args = {}) {
    this._id = UuidUtil.sanitizeId(args.id ?? UuidUtil.createUuid());
    
    this.parent = args.parent;
    this._visible = args.visible ?? true;
    this._toolTipDefinition = args.toolTip;
    this._isDisposed = false;
    this._showSecrets = args.showSecrets ?? (ValidationUtil.isDefined(args.parent) ? args.parent.showSecrets : false);

    // Even though this may seem redundant at first (see `update` method), 
    // this is more efficient than calling `update` here. 
    this._isEditable = args.isEditable ?? (ValidationUtil.isDefined(args.parent) ? args.parent.isEditable : false);

    if (ValidationUtil.isDefined(this._toolTipDefinition)) {
      this._toolTip = new Tooltip({
        id: `${this.id}-tooltip`,
        content: this._toolTipDefinition.localized,
        additionalContent: this._toolTipDefinition.additionalLocalized,
        style: this._toolTipDefinition.style,
      });
    }

    this.#viewState = new ViewState({
      viewModel: this,
    });

    ExtenderUtil.extend(this, this.clazz);
  }

  /**
   * Updates the data of this view model. 
   * 
   * **IMPORTANT** Also automatically updates any child view models. 
   * If there are any updates that must be made **before** child view models 
   * are updated, call `super.update()` only **after** those updates are made 
   * in the overridden implementation of the method! 
   * 
   * @example
   * ```JS
   * update(args) {
   *   // First do updates that child updates rely on. 
   *   this.importantData = this.getImportantData();
   *   // Then call super implementation. 
   *   super.update(args);
   * }
   * ```
   * 
   * @param {Object} args 
   * @param {Boolean | undefined} args.isEditable If true, the view model data is editable.
   * * Default `false`. 
   * 
   * @virtual
   */
  update(args = {}) {
    this._isEditable = args.isEditable ?? false;

    const childUpdates = this._getChildUpdates();
    for (const childViewModel of this.children) {
      const childUpdate = childUpdates.get(childViewModel);
      childViewModel.update(childUpdate);
    }
  }

  /**
   * Registers events on elements of the given DOM. 
   * 
   * @param {JQuery | String} html DOM of the sheet for which to register listeners. 
   * 
   * @virtual
   * @async
   */
  async activateListeners(html) {
    if ($(html).attr("id") == this.id) {
      this._element = $(html);
    } else {
      this._element = $(html).find(`#${this.id}`);
    }

    if (this._element === undefined || this._element === null || this._element.length === 0) {
      game.strive.logger.warning(`Failed to get element with id '${this.id}'`);
    }

    if (this.visible !== true) {
      this.element.addClass("hidden");
    }

    if (ValidationUtil.isDefined(this._toolTip)) {
      this._toolTip.activateListeners(this._element);
    }

    for (const child of this.children) {
      try {
        await child.activateListeners(html);
      } catch (error) {
        game.strive.logger.warning(`${error.message}; ${error.stack}`);
      }
    }

    this.#evaluateVisibilityRules();
  }

  /**
   * Disposes of any working data. 
   * 
   * This is a clean-up operation that should only be called when the instance of this class is no longer needed!
   * 
   * @virtual
   */
  dispose() {
    this._isDisposed = true;

    if (ValidationUtil.isDefined(this._toolTip)) {
      this._toolTip.deactivateListeners();
    }

    this.parent = null;
    this.viewState.write();

    // Dispose of children. 
    if (ValidationUtil.isDefined(this.children)) {
      for (const child of this.children) {
        try {
          child.dispose();
        } catch (error) {
          game.strive.logger.warning(error);
        }
      }
    }
    
    this.children = undefined;
  }

  /**
   * Sets the given `newContent` as the tool tip's content, if it is defined. 
   * @param {String} newContent New HTML content to display in the tool tip, if it is defined. 
   */
  setToolTipContent(newContent) {
    if (ValidationUtil.isDefined(this._toolTip)) {
      this._toolTipDefinition.localized = newContent;
      this._toolTip.content = newContent;
      if (this._toolTip.visible) {
        this._toolTip.hide();
        this._toolTip.show();
      }
    }
  }

  /**
   * Recurses through children and returns the one whose ID matches the given `id`. 
   * @param {String} id 
   * @returns {ViewModel | undefined}
   */
  find(id) {
    if (this.id === id || this.independentId === id) {
      return this;
    } else {
      for (const child of this.children) {
        const foundViewModel = child.find(id);
        if (ValidationUtil.isDefined(foundViewModel)) {
          return foundViewModel;
        }
      }
    }
    return undefined;
  }

  /**
   * Evaluates all the `VisibilityRule`s and applies them. 
   * @private
   */
  #evaluateVisibilityRules() {
    for (const rule of this.visibilityRules) {
      const elements = this.element.find(rule.selector);
      const isHoverEnabled = ValidationUtil.isDefined(rule.hoverTriggerElementSelector);

      if (rule.shouldBeHidden()) {
        elements.addClass("hidden");
        elements.addClass("suppress-hover");
      } else {
        elements.removeClass("hidden");
        elements.removeClass("suppress-hover");
      }

      if (isHoverEnabled) {
        if (rule.hoverTriggerElementSelector === `#${this.id}`) {
          SheetUtil.setHover(this.element, elements);
        } else {
          const triggerElement = this.element.find(rule.hoverTriggerElementSelector);
          SheetUtil.setHover(triggerElement, elements);
        }
        // Ensures hoverable elements are hidden inititally. 
        elements.addClass("hidden");
      }
    }
  }

  /**
   * Returns true, if this view model is a direct or indirect parent of 
   * the given view model instance. 
   * @param {ViewModel | undefined} viewModel A view model instance to check on whether it is 
   * a direct or indirect child of this view model. 
   * @returns {Boolean} True, if this view model is a direct or indirect parent of 
   * the given view model instance. 
   * 
   * @private
   */
  #isParentOf(viewModel) {
    if (!ValidationUtil.isDefined(viewModel)) {
      return false;
    } else if (!ValidationUtil.isDefined(viewModel.parent)) {
      return false;
    } else if (viewModel.parent == this) {
      return true;
    } else {
      return this.#isParentOf(viewModel.parent);
    }
  }
}

/**
 * @param {String} localized A localized text to 
 * display as a tool tip. 
 * @param {String | undefined} additionalLocalized Additional localized text to 
 * display in the tool tip, if the user presses the modifier key (such as 'Alt'). 
 * @param {String | undefined} style A style override to attach to the tool tip's DOM element. 
 * E. g. `text-align: center`
 */
export class ViewModelToolTipDefinition {
  /**
   * @param {Object} args 
   * @param {String} args.localized A localized text to 
   * display as a tool tip. 
   * @param {String | undefined} args.additionalLocalized Additional localized text to 
   * display in the tool tip, if the user presses the modifier key (such as 'Alt'). 
   * @param {String | undefined} args.style A style override to attach to the tool tip's DOM element. 
   * E. g. `text-align: center`
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["localized"]);

    this.localized = args.localized;
    this.additionalLocalized = args.additionalLocalized;
    this.style = args.style;
  }
}
