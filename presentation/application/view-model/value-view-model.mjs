import ViewModel from "./view-model.mjs";

/**
 * Represents the basis for all view models that hold a value. 
 * 
 * Offers an `onChange` callback that allows listening for value changes. 
 * 
 * @extends ViewModel
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
 * @property {Boolean} isOwner Returns `true`, if the current user is the owner of the represented document.
 * * Read-only
 * @property {ViewModelToolTipDefinition | undefined} toolTipDefinition A localized text to 
 * display as a tool tip. 
 * @property {Boolean} showReminders Returns `true`, if rule reminders are enabled. 
 * * Read-only
 * @property {JQuery} element Returns a JQuery-wrapped HTMLElement whose id attribute corresponds to `this.id`. 
 * Note: Only available **after** the *first* call to `activateListeners`! 
 * * Read-only
 * @property {Boolean} isDisposed Internal flag for use by inheritors. 
 * * Read-only
 * * Protected
 * 
 * @property {Any | undefined} value The current value. 
 * * Upon change, invokes the `onChange` callback. 
 * 
 * @method onChange Callback that is invoked when the value changes. 
 * Receives the following arguments: 
 * * `newValue: {Any}`
 * * `oldValue: {Any}`
 */
export default class ValueViewModel extends ViewModel {
  /**
   * @type {Any}
   * @private
   */
  #value;
  /**
   * Returns the current value. 
   * 
   * @type {Any}
   */
  get value() { return this.#value; }
  /**
   * Sets the current value. 
   * 
   * @param {Any} newValue
   */
  set value(newValue) {
    if (this.isDisposed) return undefined;

    const oldValue = this.#value;
    this.#value = newValue;
    this._onChange(newValue, oldValue);
  }

  /**
   * @param {Object} args
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
   * @param {Object | undefined} args.document An associated data document. 
   * @param {Boolean | undefined} args.visible
   * * default `true`
   * @param {ViewModelToolTipDefinition | undefined} args.toolTip Creates a tool tip definition.
   * 
   * @param {Any | undefined} args.value Initial value. 
   * @param {Function | undefined} args.onChange Callback that is invoked 
   * when the value changes. Receives two arguments: 
   * * `oldValue: {Any}`
   * * `newValue: {Any}`
   */
  constructor(args = {}) {
    super(args);

    this.#value = args.value;
    this.onChange = args.onChange ?? (() => { });
  }

  /**
   * Internal callback for the value change. 
   * 
   * @param {Any} newValue 
   * @param {Any} oldValue 
   * 
   * @protected
   */
  _onChange(newValue, oldValue) {
    this.onChange(newValue, oldValue);
  }
}
