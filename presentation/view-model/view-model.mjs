import GameSystemUserSettings from "../../business/setting/game-system-user-settings.mjs";
import GetShowFancyFontUseCase from "../../business/use-case/get-show-fancy-font-use-case.mjs";
import { PropertyUtil } from "../../business/util/property-utility.mjs";
import { UuidUtil } from "../../business/util/uuid-utility.mjs";
import { ValidationUtil } from "../../business/util/validation-utility.mjs";
import Tooltip, { TOOLTIP_PLACEMENTS, TooltipPlacementConstraint } from "../component/tooltip/tooltip.mjs";

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
 * ```HTML
 * {{#if viewModel.isHpVisible}}<span>viewModel.HP</span>{{/if}}
 * ```
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
 *   this.registerViewStateProperty("_isExpanded");
 * }
 * 
 * [...]
 * 
 * // Some other code, maybe an event callback.
 * this._isExpanded = true;
 * this.writeViewState(); // Must be called explicitly to persist the view state change. 
 * ```
 * 
 * @property {String} id Unique ID of this view model instance. 
 * * Read-only. 
 * @property {ViewModel | undefined} parent Optional. Parent ViewModel instance of this instance. 
 * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
 * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
 * * Read-only. 
 * @property {Array<ViewModel>} children An array of the child view models of this view model. 
 * * Read-only. 
 * @property {String} TEMPLATE Static. Returns the template this ViewModel is intended for. 
 * * Read-only. 
 * @property {Boolean} isGM If true, the current user is a GM. 
 * * Read-only. 
 * @property {Boolean} isEditable If true, the view model data is editable.
 * @property {Boolean} isSendable If true, the document represented by the sheet can be sent to chat.
 * @property {Boolean} isOwner If true, the current user is the owner of the represented document.
 * @property {String | undefined} contextTemplate Name or path of a contextual template, 
 * which will be displayed in exception log entries, to aid debugging.
 * * Read-only. 
 * @property {String | undefined} localizedToolTip A localized text to 
 * display as a tool tip. 
 * @property {TooltipPlacementConstraint | undefined} toolTipConstraint Sets a constraint that determines 
 * where the tool tip will be placed, around the element. 
 * * default `TOOLTIP_PLACEMENTS.TOP` with offset `0`. 
 */
export default class ViewModel {
  /**
   * Static. Returns the template this ViewModel is intended for. 
   * 
   * @abstract
   * @throws {Error} NotImplementedException - Thrown if not overriden by implementing types. 
   * @readonly
   */
  static get TEMPLATE() { throw new Error("NotImplementedException"); }

  /**
   * @type {String}
   * @static
   * @readonly
   * @protected
   */
  static CSS_CLASS_HIGHLIGHT = "highlight";

  /**
   * The data source for view state objects. 
   * 
   * @type {Map<String, Object>}
   * @private
   */
  _viewStateSource = undefined;

  /**
   * Internal unique ID of this view model instance.
   * 
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
  get id() { return (this.parent === undefined) ? this._id : `${this.parent.id}-${this._id}`; }
  
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
    } else if (this.isParentOf(value) === true) {
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
   * An array of property names. These are the properties of *this* view model that will 
   * automatically be written to / restored from view state. 
   * 
   * @type {Array<String>}
   * @protected
   */
  viewStateFields = [];

  /**
   * Returns the id of the associated entity (e. g. an actor document), or undefined, 
   * if this view model is not associated with any identifiable entity. 
   * 
   * @type {String | undefined}
   * @readonly
   * @virtual
   */
  get entityId() { return undefined; }

  /**
   * If true, the view model data is editable. 
   * 
   * @type {Boolean}
   * @default `false`
   */
  isEditable = false;
  
  /**
   * If true, the document represented by the sheet can be sent to chat. 
   * 
   * @type {Boolean}
   * @default `false`
   */
  isSendable = false;

  /**
   * If true, the current user is the owner of the represented document. 
   * 
   * @type {Boolean}
   * @default `false`
   */
  isOwner = false;
  
  /**
   * If true, the current user is a GM. 
   * 
   * @type {Boolean}
   */
  get isGM() { return game.user.isGM; }
  
  /**
   * An internal override of the `showFancyFont` field. 
   * 
   * If undefined, `showFancyFont` will return the global setting, otherwise, 
   * returns this value. 
   * 
   * @type {Boolean | undefined}
   * @private
   */
  _showFancyFont = undefined;
  /**
   * If true, use the 'fancy' font. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get showFancyFont() {
    if (this._showFancyFont === undefined) {
      return new GetShowFancyFontUseCase().invoke();
    } else {
      return this._showFancyFont;
    }
  };
  /**
   * Sets or unsets the `fancy font` override. 
   * 
   * @param {Boolean | undefined}
   */
  set showFancyFont(value) {
    this._showFancyFont = value;
  }

  /**
   * @type {String | undefined}
   */
  get localizedToolTip() {
    return this._localizedToolTip;
  }
  /**
   * @param {String | undefined} value 
   */
  set localizedToolTip(value) {
    this._localizedToolTip = value;

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
        content: this.localizedToolTip,
        enableArrow: true,
        style: this.toolTipStyle,
        constraint: this.toolTipConstraint,
        onShown: () => {
          this.element.addClass(ViewModel.CSS_CLASS_HIGHLIGHT);
        },
        onHidden: () => {
          this.element.removeClass(ViewModel.CSS_CLASS_HIGHLIGHT);
        },
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
  get showReminders() { return new GameSystemUserSettings().get(GameSystemUserSettings.KEY_TOGGLE_REMINDERS); }

  /**
   * Name or path of a contextual template, which will be displayed in exception log entries, to aid debugging. 
   * 
   * @type {String | undefined}
   * @readonly
   */
  contextTemplate = undefined;

  /**
   * Returns the element. 
   * 
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
   * * Default `false`. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat.
   * * Default `false`. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document.
   * * Default `false`. 
   * @param {String | undefined} args.contextTemplate Name or path of a contextual template, 
   * which will be displayed in exception log entries, to aid debugging.
   * @param {Map<String, Object>} args.viewStateSource The data source for view state objects. 
   * * Default `game.strive.viewStates`. 
   * @param {Object | undefined} args.document An associated data document. 
   * @param {Boolean | undefined} args.showFancyFont If `true`, will render any text, where 
   * appropriate, with the "fancy" font. 
   * * Default is the globally configured setting. 
   * @param {String | undefined} args.localizedToolTip A localized text to 
   * display as a tool tip. 
   * @param {String | undefined} args.toolTipStyle A style override to attach to the tool tip's DOM element. 
   * E. g. `text-align: center`
   * @param {TooltipPlacementConstraint | undefined} args.toolTipConstraint Sets a constraint that determines 
   * where the tool tip will be placed, around the element. 
   * * default `TOOLTIP_PLACEMENTS.TOP` with offset `0`. 
   * @param {Boolean | undefined} args.visible
   * * default `true`
   */
  constructor(args = {}) {
    this._id = UuidUtil.sanitizeId(args.id ?? UuidUtil.createUUID());
    
    this.parent = args.parent;
    this.document = args.document;
    this._showFancyFont = args.showFancyFont;
    this._localizedToolTip = args.localizedToolTip;
    this.toolTipStyle = args.toolTipStyle;
    this.toolTipConstraint = args.toolTipConstraint ?? new TooltipPlacementConstraint({
      placement: TOOLTIP_PLACEMENTS.TOP,
      offset: 0,
    });
    this._visible = args.visible ?? true;

    this.contextTemplate = args.contextTemplate;
    this._viewStateSource = args.viewStateSource ?? game.strive.viewStates;

    // Even though this may seem redundant at first (see `update` method), 
    // this is more efficient than calling `update` here. 
    this.isEditable = args.isEditable ?? (args.parent !== undefined ? args.parent.isEditable : false);
    this.isSendable = args.isSendable ?? (args.parent !== undefined ? args.parent.isSendable : false);
    this.isOwner = args.isOwner ?? (args.parent !== undefined ? args.parent.isOwner : false);

    const extenders = this.getExtenders();
    extenders.forEach(extender => {
      extender.extend(this);
    });

    if (ValidationUtil.isDefined(this.localizedToolTip)) {
      this._toolTip = new Tooltip({
        id: `${this.id}-tooltip`,
        content: this.localizedToolTip,
        enableArrow: true,
        style: this.toolTipStyle,
        constraint: this.toolTipConstraint,
        onShown: () => {
          this.element.addClass(ViewModel.CSS_CLASS_HIGHLIGHT);
        },
        onHidden: () => {
          this.element.removeClass(ViewModel.CSS_CLASS_HIGHLIGHT);
        },
      });
    }
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
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat.
   * * Default `false`. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document.
   * * Default `false`. 
   * 
   * @virtual
   */
  update(args = {}) {
    this.isEditable = args.isEditable ?? false;
    this.isSendable = args.isSendable ?? false;
    this.isOwner = args.isOwner ?? false;

    const childUpdates = this._getChildUpdates();
    for (const childViewModel of this.children) {
      const childUpdate = childUpdates.get(childViewModel);
      childViewModel.update(childUpdate);
    }
  }

  /**
   * Returns a map of view models and their respective 
   * update arguments. 
   * 
   * By default, all child view models will have their `isEditable`, 
   * `isSendable` and `isOwner` properties updated. 
   * 
   * **IMPORTANT** You only need to override this if a child view model requires 
   * more/other arguments than the default as described above. 
   * 
   * @example
   * ```JS
   * _getChildUpdates() {
   *   const updates = super._getChildUpdates();
   *   updates.set(myViewModel, {
   *     ...updates.get(myViewModel),
   *     a: 42,
   *   });
   *   return updates;
   * }
   * ```
   * 
   * @returns {Map<ViewModel, Object>} A map of view models and their 
   * update arguments. 
   * 
   * @virtual
   */
  _getChildUpdates() {
    const result = new Map();

    for (const childViewModel of this.children) {
      result.set(childViewModel, {
        isEditable: this.isEditable,
        isSendable: this.isSendable,
        isOwner: this.isOwner,
      });
    }

    return result;
  }

  /**
   * Registers events on elements of the given DOM. 
   * 
   * @param {Object} html DOM of the sheet for which to register listeners. 
   * 
   * @virtual
   * @async
   */
  async activateListeners(html) {
    if ($(html).attr("id") == this.id) {
      this._element = $(html);
    } else {
      this._element = html.find(`#${this.id}`);
    }

    if (this._element === undefined || this._element === null || this._element.length === 0) {
      game.strive.logger.logWarn(`Failed to get element with id '${this.id}'`);
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
        game.strive.logger.logWarn(`${error.message}; ${error.stack}`);
      }
    }
  }

  /**
   * Disposes of any working data. 
   * 
   * This is a clean-up operation that should only be called when the instance of this class is no longer needed!
   * 
   * @virtual
   */
  dispose() {
    this.parent = undefined;

    if (ValidationUtil.isDefined(this._toolTip)) {
      this._toolTip.deactivateListeners();
    }

    // Dispose of children. 
    if (this.children !== undefined && this.children !== null) {
      for (const child of this.children) {
        try {
          child.dispose();
        } catch (error) {
          game.strive.logger.logWarn(error);
        }
      }
    }
    this.children = undefined;
  }

  /**
   * @summary
   * Registers a property of *this* view model as view state storeable/restorable. 
   * 
   * @description
   * Silently prevents adding the same property name multiple times. 
   * 
   * Does not verify that a property with the given name exists on this view model instance. 
   * 
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
   * @virtual
   */
  getViewState() {
    if ((this.viewStateFields ?? []).length < 1) {
      return undefined;
    }

    const viewState = Object.create(null);
    for (const propertyName of this.viewStateFields) {
      viewState[propertyName] = this[propertyName];
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
   * @virtual
   */
  applyViewState(viewState) {
    // If the view state is undefined, it cannot be applied. 
    if (viewState === undefined || viewState === null) return;

    for (const propertyName of this.viewStateFields) {
      // Skip any potential "mistakes" - for example from old versions of the code. 
      if (PropertyUtil.hasProperty(viewState, propertyName) !== true) continue;
      // Override the matching property's value. 
      this[propertyName] = viewState[propertyName];
    }
  }
  
  /**
   * Retrieves and applies the view state of _this_ view model, if possible. 
   * 
   * In order for this operation to succeed, view state properties must have been 
   * registered and the view state written out, beforehand. 
   */
  readViewState() {
    const viewState = this._viewStateSource.get(this.id);
    if (viewState !== undefined) {
      this.applyViewState(viewState);
    }
  }

  /**
   * Retrieves and applies the view state of _this_ view model **and** of all 
   * its children, if possible. 
   * 
   * In order for this operation to succeed, view state properties must have been 
   * registered and the view state written out, beforehand. 
   */
  readAllViewState() {
    this.readViewState();

    for (const child of this.children) {
      child.readAllViewState();
    }
  }

  /**
   * Stores the current view state of **only** _this_ view model. 
   */
  writeViewState() {
    const viewState = this.getViewState()
    if (ValidationUtil.isDefined(viewState) === true) {
      this._viewStateSource.set(this.id, viewState);
    }
  }

  /**
   * Stores the current view state of _this_ view model **and** all its children. 
   */
  writeAllViewState() {
    this.writeViewState();
    
    for (const child of this.children) {
      child.writeAllViewState();
    }
  }
  
  /**
   * Returns true, if this view model is a direct or indirect parent of 
   * the given view model instance. 
   * 
   * @param {ViewModel | undefined} viewModel A view model instance to check on whether it is 
   * a direct or indirect child of this view model. 
   * 
   * @returns {Boolean} True, if this view model is a direct or indirect parent of 
   * the given view model instance. 
   */
  isParentOf(viewModel) {
    if (viewModel === undefined) {
      return false;
    } else if (viewModel.parent === undefined) {
      return false;
    } else if (viewModel.parent == this) {
      return true;
    } else {
      return this.isParentOf(viewModel.parent);
    }
  }

  /**
   * Returns extenders. 
   * 
   * @returns {Array<Object>}
   * 
   * @protected
   */
  getExtenders() {
    return [];
  }
  
  /**
   * Returns an array of view model instances that have either been fetched 
   * from the `currentList` or newly instantiated, using the `factoryFunc`. 
   * 
   * This internal method is meant for use when updating an array of child 
   * view models, to fetch or create the needed child view models. 
   * 
   * @param {Array<TransientDocument>} documents An array of source documents. 
   * These represent the current data state and will be compared against. 
   * @param {Array<ViewModel>} currentList An array of "current" view model 
   * instances. 
   * @param {Function} factoryFunc A factory function that receives the default 
   * instantiation arguments (`id`, `document`, `isEditable`, `isSendable` and `isOwner`) 
   * and which must return a new instance of a view model of the expected type. 
   * 
   * @returns {Array<ViewModel>}
   * 
   * @protected
   */
  _getViewModels(documents, currentList, factoryFunc) {
    const result = [];
    
    for (const document of documents) {
      let vm = (currentList ?? []).find(it => it._id === document.id);
      if (vm === undefined) {
        vm = factoryFunc({
          id: document.id,
          document: document,
          parent: this,
          isEditable: this.isEditable,
          isSendable: this.isSendable,
          isOwner: this.isOwner,
        });
      }
      result.push(vm);
    }

    return result;
  }

  /**
   * Removes the parent from all view models of the given `list` array, which 
   * are **not** also present on the `compare` array. 
   * 
   * This internal method is meant for use when updating an array of child 
   * view models, to ensure obsolete children aren't kept. 
   * 
   * @param {Array<ViewModel>} list An array of view models "to cull". 
   * @param {Array<ViewModel>} compare An array of view models to compare against. 
   * 
   * @protected
   */
  _cullObsolete(list, compare) {
    for (const viewModel of list) {
      const cull = compare.find(it => it._id === viewModel._id) === undefined;
      if (cull === true) {
        viewModel.parent = undefined;
      }
    }
  }
}
