import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import { MODIFIER_KEY_CODES } from "../../../util/keyboard/key-codes.mjs";
import { KEYBOARD } from "../../../util/keyboard/keyboard.mjs";
import { SheetUtil } from "../../../util/sheet-utility.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ViewModel, { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";
import { DropDownOption } from "./dropdown-option.mjs";

/**
 * A button that allows showing a context menu with specifically defined menu items. 
 * 
 * @extends ViewModel
 * 
 * @property {Array<DropDownItem>} menuItems The items that define the context menu's 
 * entries. 
 * 
 * @method onClick Asynchronous callback that is invoked when the button is clicked. Arguments: 
 * * `event: Event`
 * * `data: undefined`
 */
export default class ButtonDropDownViewModel extends ViewModel {
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
  #buttonElement = undefined;

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
   * 
   * @param {String | undefined} args.content Raw HTML to render as the content 
   * of the button. 
   * @param {Array<DropDownOption> | undefined} args.options An array of context menu items, 
   * which are used to populate the context menu. 
   * @param {Function | undefined} args.onClick Asynchronous callback that is invoked when 
   * the button is clicked. No arguments. 
   * @param {Function | undefined} args.onMenuShown Asynchronous callback that is invoked when 
   * the menu becomes visible. 
   * @param {Function | undefined} args.onMenuHidden Asynchronous callback that is invoked when 
   * the menu becomes hidden. 
   */
  constructor(args = {}) {
    super(args);

    this.content = args.content;
    this.options = args.options ?? [];
    this.onClick = args.onClick ?? (() => { });
    this.onMenuShown = args.onMenuShown ?? (() => { });
    this.onMenuHidden = args.onMenuHidden ?? (() => { });
  }

  /**
   * @override
   * 
   * @throws {Error} UnknownException Thrown if the current option could not be set correctly. 
   */
  async activateListeners(html) {
    await super.activateListeners(html);

    this.#buttonElement = $(this.element).find("a.button");
    this.#menuElement = $(this.element).find(`menu#${this.id}-menu`);

    this.#buttonElement.click(async (event) => {
      event.preventDefault(); // Prevents side-effects from event-bubbling. 

      if (this.isEditable === true) {
        const data = await this._onClick(event);
        await this.onClick(event, data);
      }
    });

    this._globalOnKeyDownAlt = KEYBOARD.onKeyDown({
      modifier: MODIFIER_KEY_CODES.ALT,
      handler: () => {
        this._evaluateConditions({
          altKey: true,
          ctrlKey: false,
        });
        this.#adjustMenuPos();
      },
    });
    this._globalOnKeyDownCtrl = KEYBOARD.onKeyDown({
      modifier: MODIFIER_KEY_CODES.CTRL,
      handler: () => {
        this._evaluateConditions({
          altKey: false,
          ctrlKey: true,
        });
        this.#adjustMenuPos();
      },
    });
    this._globalOnKeyUpAlt = KEYBOARD.onKeyUp({
      modifier: MODIFIER_KEY_CODES.ALT,
      handler: () => {
        this._evaluateConditions({
          altKey: false,
          ctrlKey: false,
        });
        this.#adjustMenuPos();
      },
    });
    this._globalOnKeyUpCtrl = KEYBOARD.onKeyUp({
      modifier: MODIFIER_KEY_CODES.CTRL,
      handler: () => {
        this._evaluateConditions({
          altKey: false,
          ctrlKey: false,
        });
        this.#adjustMenuPos();
      },
    });

    // Find and bind to menu items. 
    const menuItems = this.#menuElement.find("> li");
    for (let i = 0; i < menuItems.length; i++) {
      const menuItem = menuItems[i];
      const menuItemElm = $(menuItem);

      const option = this.options[i];
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

      // Ensure condition is applied initially.
      if (!option.condition()) {
        menuItemElm.addClass("hidden");
      }
    }

    // Ensure clicks anywhere else closes the menu. 
    $("body").click(async (event) => {
      if (event.target != this.#buttonElement[0]) {
        this.closeMenu();
      }
    });
  }

  /** @override */
  dispose() {
    this.closeMenu();
    KEYBOARD.offKeyDown(this._globalOnKeyDownAlt);
    KEYBOARD.offKeyDown(this._globalOnKeyDownCtrl);
    KEYBOARD.offKeyUp(this._globalOnKeyUpAlt);
    KEYBOARD.offKeyUp(this._globalOnKeyUpCtrl);

    super.dispose();
  }

  /**
   * Shows the menu. 
   */
  openMenu() {
    if (this.#isMenuOpen) return;

    this.#menuElement.removeClass("hidden");
    this.#isMenuOpen = true;
    this._evaluateConditions({
      altKey: false,
      ctrlKey: false,
    });
    this.#adjustMenuPos();

    this.onMenuShown();

    if (ValidationUtil.isDefined(this._toolTip)) {
      this._toolTip.hide();
      this._toolTipShowOnHover = this._toolTip.showOnHover;
      this._toolTip.showOnHover = false;
    }
  }

  /**
   * Hides the menu. 
   */
  closeMenu() {
    if (!this.#isMenuOpen) return;

    this.#menuElement.addClass("hidden");
    this.#isMenuOpen = false;

    this.onMenuHidden();

    if (ValidationUtil.isDefined(this._toolTip)) {
      this._toolTip.showOnHover = this._toolTipShowOnHover;
    }
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
   * Internal click handler. 
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
   * Invokes the `condition` method of all `this.options`, and adjusts menu item 
   * visibilities accordingly. 
   * @param {Object} event Simplified event data. 
   * * `event.altKey: Boolean`
   * * `event.ctrlKey: Boolean`
   * 
   * @protected
   */
  _evaluateConditions(event) {
    const menuItems = this.#menuElement.find("> li");
    for (let i = 0; i < menuItems.length; i++) {
      const menuItem = menuItems[i];
      const option = this.options[i];
      if (option.condition(event)) {
        $(menuItem).removeClass("hidden");
      } else {
        $(menuItem).addClass("hidden");
      }
    }
  }

  /**
   * Ensures the context menu isn't being cut off beyond the edges of the 
   * outer (containing) html. 
   * @private
   */
  #adjustMenuPos() {
    let rootContainerElm = this.element.closest("form");
    if (rootContainerElm.length === 0) {
      rootContainerElm = this.element.closest("body");
    }

    const buttonRect = SheetUtil.getElementRect(this.#buttonElement[0]);
    const boundsRect = SheetUtil.getElementRect(rootContainerElm[0]);
    const menuRect = SheetUtil.getElementRect(this.#menuElement[0]);
    let left = 0;
    let top = buttonRect.height;

    const deltaX = boundsRect.right - (buttonRect.left + menuRect.width);
    const deltaY = boundsRect.bottom - (buttonRect.bottom + menuRect.height);

    if (deltaX < 0) { // Clipping right.
      left = buttonRect.width - menuRect.width;
    }
    if (deltaY < 0) { // Clipping bottom.
      top = -menuRect.height;
    }

    this.#menuElement.attr("style", `left: ${left}px; top: ${top}px;`);
  }
}
