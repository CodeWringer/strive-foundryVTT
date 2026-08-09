import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import { SheetUtil } from "../../../util/sheet-utility.mjs";
import { TEMPLATES } from "../../templates.mjs";
import { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";
import { DropDownOption } from "./dropdown-option.mjs";

/**
 * A button that allows showing a context menu with specifically defined menu items. 
 * 
 * @extends ButtonViewModel
 * 
 * @property {Array<DropDownItem>} menuItems The items that define the context menu's 
 * entries. 
 * 
 * @method onClick Asynchronous callback that is invoked when the button is clicked. Arguments: 
 * * `event: Event`
 * * `data: undefined`
 */
export default class ButtonDropDownViewModel extends ButtonViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.buttonDropDown; }

  /** @override */
  get clazz() { return ButtonDropDownViewModel; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('buttonDropDown', `{{> "${ButtonDropDownViewModel.TEMPLATE}"}}`);
  }

  /**
   * Returns two button definitions for a button to "toggle" a property value. 
   * 
   * @param {Object} args
   * @param {String} args.label The button's localizable label. 
   * @param {Object} args.propertyOwner Parent object of the property. 
   * @param {String} args.propertyName Name of the property. 
   * @param {Any} args.activeValue Value to set on the property that is set when 
   * the toggle is active. 
   * @param {Any | undefined} args.inactiveValue Value to set on the property that is set when 
   * the toggle is inactive. 
   * * default `null`
   * @param {Boolean | undefined} args.isEditable If `true`, will show the toggle buttons. If `false`, 
   * the buttons will not be shown. Intended to hide buttons in read-only mode of a sheet. 
   * * default `true`
   * @param {String | undefined} args.activeIcon The icon to show alongside an active 
   * value. If left `undefined`, will show a checkmark. 
   * @param {String | undefined} args.inactiveIcon The icon to show alongside an inactive 
   * value. If left `undefined`, will show no icon. 
   * 
   * @returns {Array<DropDownOption>} Two button definitions. One for each state of the toggle button. 
   */
  static createToggleButtons(args = {}) {
    ValidationUtil.validateOrThrow(args, ["activeValue"]);

    const localizedLabel = game.i18n.localize(args.label);
    return [
      new DropDownOption({
        localizedValue: localizedLabel,
        icon: args.activeIcon ?? '<i class="fas fa-check"></i>',
        condition: () => {
          if (!args.isEditable) return false;

          const value = args.propertyOwner[args.propertyName];
          if (typeof (value) === "boolean") {
            return value === true;
          } else {
            return ValidationUtil.isDefined(value) === true;
          }
        },
        onClick: () => { args.propertyOwner[args.propertyName] = (args.inactiveValue ?? null); },
      }),
      new DropDownOption({
        localizedValue: localizedLabel,
        icon: args.inactiveIcon ?? '',
        condition: () => {
          if (!args.isEditable) return false;

          const value = args.propertyOwner[args.propertyName];
          if (typeof (value) === "boolean") {
            return value === false;
          } else {
            return ValidationUtil.isDefined(value) === false;
          }
        },
        onClick: () => { args.propertyOwner[args.propertyName] = args.activeValue; },
      }),
    ];
  }

  /**
   * @type {Boolean}
   * @private
   */
  #isMenuOpen = false;

  /**
   * Initialized late - in `activateListeners`!
   * @type {JQuery}
   * @readonly
   * @private
   */
  #menuElement = undefined;

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {ViewModel | undefined} args.parent Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, will be interactible. 
   * @param {ViewModelToolTipDefinition | undefined} args.toolTip Creates a tool tip definition.
   * @param {String | undefined} args.content Raw HTML to render as the content 
   * of the button. 
   * @param {Function | undefined} args.onClick Asynchronous callback that is invoked when 
   * the button is clicked. Arguments: 
   * * `event: Event`
   * * `data: any | undefined` - Returned data of the click callback, if 
   * there is any. 
   * 
   * @param {Array<DropDownOption> | undefined} args.options An array of context menu items, 
   * which are used to populate the context menu. 
   */
  constructor(args = {}) {
    super(args);

    this.options = args.options ?? [];
  }

  /**
   * @override
   * 
   * @throws {Error} UnknownException Thrown if the current option could not be set correctly. 
   */
  async activateListeners(html) {
    await super.activateListeners(html);

    this.#menuElement = $(this.element).find(`menu#${this.id}-menu`);

    this.element.on("keydown", (event) => {
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
    const menuItems = this.#menuElement.find("> li");
    for (const menuItem of menuItems) {
      const menuItemElm = $(menuItem);
      const value = menuItemElm.attr("data-value");
      const option = this.options.find(it => it.value === value);
      if (ValidationUtil.isDefined(option)) {
        menuItemElm.click((event) => {
          event.preventDefault();
          this.closeMenu();
          option.onClick();
        });

        menuItemElm.on("keydown", (event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            menuItemElm.next().focus();
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            menuItemElm.prev().focus();
          } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            option.onClick();
            this.closeMenu();
          }
        });
      } else {
        game.strive.logger.logWarn("Failed to get drop-down option value");
      }
    }

    // Ensure clicks anywhere else closes the menu. 
    $("body").click(async (event) => {
      if (event.target != this.element[0]) {
        this.closeMenu();
      }
    });

    // Ensure the menu scrolls with the parent form, if there is one. 
    const formElm = this.element.closest("form");
    if (ValidationUtil.isDefined(formElm) && formElm.length > 0) {
      formElm.on("mousewheel", (event) => {
        this.#adjustMenuPos();
      });
    }
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

    this.#menuElement.removeClass("hidden");
    this.#isMenuOpen = true;
    this.#adjustMenuPos();
  }

  /**
   * Hides the drop-down menu and re-attaches it to `this.element`. 
   */
  closeMenu() {
    if (!this.#isMenuOpen) return;

    this.#menuElement.addClass("hidden");
    this.#menuElement.detach();
    this.element.append(this.#menuElement);

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

  /**
   * @param {Event} event
   * 
   * @async
   * @protected
   * @override
   */
  async _onClick(event) {
    if (!this.isEditable) return;

    this.toggleMenu();
  }

  /**
   * Ensures the context menu isn't being cut off beyond the edges of the 
   * outer (containing) html. 
   * @private
   */
  #adjustMenuPos() {
    const thisElementRect = SheetUtil.getElementRect(this.element[0]);
    const boundsRect = SheetUtil.getElementRect($("body")[0]);
    const menuRect = SheetUtil.getElementRect(this.#menuElement[0]);
    let left = thisElementRect.left;
    let top = thisElementRect.bottom;

    const deltaX = boundsRect.right - (left + menuRect.width);
    const deltaY = boundsRect.bottom - (top + menuRect.height);

    if (deltaX < 0) {
      left += deltaX;
    }
    if (deltaY < 0) {
      top += deltaY;
    }

    this.#menuElement.attr("style", `left: ${left}px; top: ${top}px;`);
  }
}
