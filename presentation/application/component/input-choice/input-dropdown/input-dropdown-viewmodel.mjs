import { ValidationUtil } from "../../../../../common/util/validation-utility.mjs";
import { SheetUtil } from "../../../../util/sheet-utility.mjs";
import { TEMPLATES } from "../../../templates.mjs";
import InputChoiceViewModel from "../input-choice-viewmodel.mjs";

/**
 * Represents a drop-down input. The user can select one of a defined list of options. 
 * 
 * @extends InputChoiceViewModel
 * 
 * @property {ChoiceOption} value The currently selected option. 
 * @property {Array<ChoiceOption>} options Gets the options available to the drop-down. 
 * @property {Boolean} showValue If true, will add the value to the content of the 
 * drop-down button. 
 * 
 * @method onChange Callback that is invoked when the value changes. 
 * Receives the following arguments: 
 * * `oldValue: {ChoiceOption}`
 * * `newValue: {ChoiceOption}`
 * @method onInput Callback that is invoked when any input is made (by keyboard or mouse or other input device). 
 * * `event: {Event}`
 * * `viewModel: {ViewModel}`
 * @method onFocus Callback that is invoked when the input element is focused. 
 * * `event: {Event}`
 * * `viewModel: {ViewModel}`
 * @method onFocusLost Callback that is invoked when the input element is unfocused. 
 * * `event: {Event}`
 * * `viewModel: {ViewModel}`
 */
export default class InputDropDownViewModel extends InputChoiceViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.dropDown; }
  /** @override */

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('inputDropDown', `{{> "${InputDropDownViewModel.TEMPLATE}"}}`);
  }

  /** @override */
  get clazz() { return InputDropDownViewModel; }

  /** @override */
  get value() { return super.value; }
  set value(value) {
    super.value = value;

    const element = this.#buttonElement.find(`#${this.id}-button-value`);
    let newContent = value.iconHtml;
    if (this.showValue) {
      newContent = `${newContent}<span>${value.localizedValue}</span>`;
    }

    element.empty();
    element.append(newContent);
  }

  /**
   * Initialized late - in `activateListeners`!
   * @type {JQuery}
   * @readonly
   * @private
   */
  #menuElement = undefined;

  /**
   * Initialized late - in `activateListeners`!
   * @type {JQuery}
   * @readonly
   * @private
   */
  #buttonElement = undefined;

  /**
   * @type {Boolean}
   * @private
   */
  #isMenuOpen = false;

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If `true`, input(s) will 
   * be in edit mode. If `false`, will be in read-only mode.
   * * default `false`. 
   * 
   * @param {String | undefined} args.localizedToolTip A localized text to 
   * display as a tool tip. 
   * 
   * @param {ChoiceOption | undefined} args.value The current value. 
   * * default is the first option given.
   * @param {Array<ChoiceOption>} args.options The options available to the drop-down. 
   * @param {Function | undefined} args.onChange Callback that is invoked 
   * when the value changes. Receives two arguments: 
   * * `oldValue: {ChoiceOption}`
   * * `newValue: {ChoiceOption}`
   * 
   * @param {Boolean | undefined} args.showValue If true, will add the value to the content of the 
   * drop-down button. 
   * * default `true`
   */
  constructor(args = {}) {
    super(args);

    this.showValue = args.showValue ?? true;
  }

  /**
   * @override
   * 
   * @throws {Error} UnknownException Thrown if the current option could not be set correctly. 
   */
  async activateListeners(html) {
    await super.activateListeners(html);

    this.#menuElement = $(this.element).find(`menu#${this.id}-menu`);
    this.#buttonElement = $(this.element).find(`button#${this.id}-button`);

    this.#buttonElement.click((event) => {
      event.preventDefault(); // Prevents side-effects from event-bubbling. 

      if (this.isEditable) {
        this.toggleMenu();
      }
    });
    this.#buttonElement.on("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (this.#isMenuOpen) {
          this.#menuElement.find("li").first().focus();
        } else {
          this.openMenu();
        }
      } else if (event.key === "Escape" || event.key === "Tab") {
        this.closeMenu();
      }
    });

    // Find and bind to menu items. 
    const menuItems = this.element.find("menu > li");
    for (const menuItem of menuItems) {
      const element = $(menuItem);
      const value = menuItem.id;
      const option = this.options.find(it => it.value === value);
      if (ValidationUtil.isDefined(option)) {
        element.click((event) => {
          event.preventDefault();
          this.value = option;
        });

        element.on("keydown", (event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            element.next().focus();
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            element.prev().focus();
          } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            this.value = option;
            this.closeMenu();
          }
        });
      } else {
        game.strive.logger.logWarn("Failed to get drop-down option value");
      }
    }

    $("body").click(async (event) => {
      if (event.target != this.#buttonElement[0]) {
        this.closeMenu();
      }
    });
  }

  /** @override */
  dispose() {
    this.closeMenu();
    super.dispose();
  }

  /**
   * Shows the drop-down menu, by detaching it from `this.element` and 
   * attaching it to the body element, instead. 
   */
  openMenu() {
    if (this.#isMenuOpen) return;

    this.#menuElement.detach();
    $("body").append(this.#menuElement);

    const buttonRect = SheetUtil.getElementRect(this.#buttonElement);
    const left = buttonRect.left;
    const top = buttonRect.bottom;

    this.#menuElement.attr("style", `left: ${left}px; top: ${top}px;`)
    this.#menuElement.removeClass("hidden");

    this.#buttonElement.attr("aria-expanded", true);
    this.#isMenuOpen = true;
  }

  /**
   * Hides the drop-down menu and re-attaches it to `this.element`. 
   */
  closeMenu() {
    if (!this.#isMenuOpen) return;

    this.#menuElement.addClass("hidden");
    this.#menuElement.detach();
    this.element.append(this.#menuElement);
    
    this.#buttonElement.attr("aria-expanded", false);
    this.#buttonElement.focus();
    this.#isMenuOpen = false;
  }

  /**
   * Toggles the current state. 
   */
  toggleMenu() {
    if (this.#isMenuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }
}
