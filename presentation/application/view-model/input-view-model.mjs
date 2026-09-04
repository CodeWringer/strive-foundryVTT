import { Callbacks } from "../../../common/callbacks.mjs";
import { ValidationUtil } from "../../../common/util/validation-utility.mjs";
import { SlideDisplaceAnim } from "../../animation/slide-displace-anim.mjs";
import { SheetUtil } from "../../util/sheet-utility.mjs";
import ValueViewModel from "./value-view-model.mjs";
import ViewModel from "./view-model.mjs";

/**
 * Represents the basis for all input type view models. 
 * 
 * @extends ValueViewModel
 * 
 * @abstract Inheritors MUST implement:
 * * `static get TEMPLATE`
 * * `get clazz`
 * 
 * Inheritors _may_ override:
 * * `get inputElement`
 * 
 * @property {String} id Unique ID of this view model instance. 
 * @property {Boolean} isEditable If `true`, input(s) will 
 * be in edit mode. If `false`, will be in read-only mode.
 * @property {JQuery | HTMLElement} element The DOM element that is 
 * associated with this view model. 
 * * Read-only
 * @property {String | undefined} localizedToolTip A localized text to 
 * display as a tool tip. 
 * 
 * @property {Any | undefined} value The current value. 
 * * Upon change, invokes the `onChange` callback. 
 * @property {Callbacks} onChange Invoked when the value changes. 
 * Listeners receive the following arguments: 
 * * `newValue: {Any}`
 * * `oldValue: {Any}`
 * 
 * @property {Callbacks} onInput Invoked when any input is made (by keyboard or mouse or other input device). 
 * * `event: {Event}`
 * * `viewModel: {ViewModel}`
 * @property {Callbacks} onFocus Invoked when the input element is focused. 
 * * `event: {Event}`
 * * `viewModel: {ViewModel}`
 * @property {Callbacks} onFocusLost Invoked when the input element is unfocused. 
 * * `event: {Event}`
 * * `viewModel: {ViewModel}`
 */
export default class InputViewModel extends ValueViewModel {
  /**
   * Gets or sets the edit-mode of the control. 
   * 
   * When setting, it will also toggle between edit-mode and read-mode, in the DOM. 
   * @type {Boolean}
   * @override
   */
  get isEditable() { return super.isEditable; }
  set isEditable(value) {
    super.isEditable = value;

    const editElement = this.element.find("> .edit-mode");
    const readElement = this.element.find("> .read-mode");
    if (!this._suppressAnims && editElement.length > 0 && readElement.length > 0) {
      if (value) {
        new SlideDisplaceAnim({
          displacingElement: editElement,
          displacedElement: readElement,
        }).execute();
      } else {
        new SlideDisplaceAnim({
          displacingElement: readElement,
          displacedElement: editElement,
        }).execute();
      }
    } else {
      if (value) {
        editElement.removeClass("hidden");
        readElement.addClass("hidden");
      } else {
        editElement.addClass("hidden");
        readElement.removeClass("hidden");
      }
    }
  }

  /**
   * Returns the current value. 
   * 
   * @type {Any}
   */
  get value() { return super.value; }
  /**
   * Sets the current value. 
   * 
   * @param {Any} newValue
   */
  set value(newValue) {
    if (this.isDisposed) return;

    super.value = newValue;

    // Update the read-mode value. The edit-mode value is usually already up-to-date as that is 
    // what the user interacted with to make the value change. 
    if (ValidationUtil.isDefined(this.inputElement) && this.inputElement.length > 0) {
      const readElement = this.element.find("> .read-mode");
      readElement.html(newValue);
    }
  }

  /**
   * Returns the actual input element, which may be nested within `this.element`. 
   * @type {JQuery | HTMLElement}
   * @readonly
   * @virtual
   */
  get inputElement() { return this.element.find("input"); }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {ViewModel | undefined} args.parent Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If `true`, input(s) will 
   * be in edit mode. If `false`, will be in read-only mode.
   * * default `false`. 
   * @param {ViewModelToolTipDefinition | undefined} args.toolTip Creates a tool tip definition.
   * 
   * @param {Any | undefined} args.value The current value. 
   * @param {Function | undefined} args.onChange Callback that is invoked 
   * when the value changes. Receives two arguments: 
   * * `newValue: {Any}`
   * * `oldValue: {Any}`
   * 
   * @param {Boolean | undefined} args.autoHandleEvents If `true`, will automatically attach 
   * event listeners for the input element. This behavior may be undesirable by some inheritors, 
   * which can disable it by setting this to `false`. 
   * * default `true`
   * @param {Boolean | undefined} args.suppressAnims If `true`, suppresses animations that would play when 
   * `isEditable` is changed at run-time. Useful for when this component is child to another, which 
   * instead handles the animations. 
   * @param {Function | undefined} args.onInput Callback that is invoked when any input is made (by keyboard or mouse or other input device). 
   * * `event: {Event}`
   * * `viewModel: {ViewModel}`
   * @param {Function | undefined} args.onFocus Callback that is invoked when the input element is focused. 
   * * `event: {Event}`
   * * `viewModel: {ViewModel}`
   * @param {Function | undefined} args.onFocusLost Callback that is invoked when the input element is unfocused. 
   * * `event: {Event}`
   * * `viewModel: {ViewModel}`
   */
  constructor(args = {}) {
    super(args);

    this._autoHandleEvents = args.autoHandleEvents ?? true;
    this._suppressAnims = args.suppressAnims ?? false;

    this.onInput = new Callbacks();
    this.onInput.add(args.onInput);

    this.onFocus = new Callbacks();
    this.onFocus.add(args.onFocus);

    this.onFocusLost = new Callbacks();
    this.onFocusLost.add(args.onFocusLost);
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    const editModeElm = this.element.find("> .edit-mode");
    const readModeElm = this.element.find("> .read-mode");
    if (this.isEditable) {
      editModeElm.removeClass("hidden");
      readModeElm.addClass("hidden");
    } else {
      editModeElm.addClass("hidden");
      readModeElm.removeClass("hidden");
    }

    if (!this._autoHandleEvents) return;

    if (ValidationUtil.isDefined(this.inputElement) && this.inputElement.length > 0) {
      $(this.inputElement).change(this._onChange.bind(this));
      $(this.inputElement).on("input", (event) => {
        this.onInput.invoke(event, this);
      });
      $(this.inputElement).on("focus", (event) => {
        this.onFocus.invoke(event, this);
      });
      $(this.inputElement).on("focusout", (event) => {
        this.onFocusLost.invoke(event, this);
      });
    }
  }

  /**
   * Internal callback for the value change, triggered by the input element itself. 
   * 
   * @param {Event} event 
   * 
   * @protected
   */
  _onChange(event) {
    const newValue = SheetUtil.getElementValue(event.currentTarget);

    if (ValidationUtil.isDefined(newValue) !== true) {
      game.strive.logger.logWarn(`Failed to get element's value - is '${newValue}' valid?`);
    }

    this.value = newValue;
  }
}
