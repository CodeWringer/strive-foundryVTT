import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import ChoiceOption from "../../../model/choice-option.mjs";
import { SheetUtil } from "../../../util/sheet-utility.mjs";
import { TEMPLATES } from "../../templates.mjs";
import { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";

/**
 * A button that allows showing a context menu with specifically defined menu items. 
 * 
 * @extends ButtonViewModel
 * 
 * @property {Array<ContextMenuItem>} menuItems The items that define the context menu's 
 * entries. 
 * 
 * @method onClick Asynchronous callback that is invoked when the button is clicked. Arguments: 
 * * `event: Event`
 * * `data: undefined`
 */
export default class ButtonContextMenuViewModel extends ButtonViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.buttonContextMenu; }
  
  /** @override */
  get clazz() { return ButtonContextMenuViewModel; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('buttonContextMenu', `{{> "${ButtonContextMenuViewModel.TEMPLATE}"}}`);
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
   * @returns {Array<ContextMenuOption>} Two button definitions. One for each state of the toggle button. 
   */
  static createToggleButtons(args = {}) {
    ValidationUtil.validateOrThrow(args, ["activeValue"]);
    
    const localizedLabel = game.i18n.localize(args.label);
    return [
      new ContextMenuOption({
        localizedValue: localizedLabel,
        icon: args.activeIcon ?? '<i class="fas fa-check"></i>',
        condition: () => {
          if (!args.isEditable) return false;
          
          const value = args.propertyOwner[args.propertyName];
          if (typeof(value) === "boolean") {
            return value === true;
          } else {
            return ValidationUtil.isDefined(value) === true;
          }
        },
        onClick: () => { args.propertyOwner[args.propertyName] = (args.inactiveValue ?? null); },
      }),
      new ContextMenuOption({
        localizedValue: localizedLabel,
        icon: args.inactiveIcon ?? '',
        condition: () => {
          if (!args.isEditable) return false;

          const value = args.propertyOwner[args.propertyName];
          if (typeof(value) === "boolean") {
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
   * @param {Function | undefined} args.onClick Asynchronous callback that is invoked when 
   * the button is clicked. Arguments: 
   * * `event: Event`
   * * `data: any | undefined` - Returned data of the click callback, if 
   * there is any. 
   * 
   * @param {Array<ContextMenuOption> | undefined} args.options An array of context menu items, 
   * which are used to populate the context menu. 
   */
  constructor(args = {}) {
    super({
      ...args,
      toolTip: args.toolTip ?? new ViewModelToolTipDefinition({
        localized: game.i18n.localize("system.general.contextMenu"),
      }),
    });

    this.options = args.options ?? [];

    // Wrap the callback function to make it also ensure the context menu is properly closed, 
    // when the menu item is clicked. 
    for (const menuItem of this.options) {
      const wrappedFunction = menuItem.callback;
      menuItem.callback = () => {
        this.#isMenuOpen = false;
        wrappedFunction();
      }
    }
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    this.#menuElement = $(this.element).find(`menu#${this.id}-menu`);
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

    this._ensureContextMenuWithin();
    this.#menuElement.removeClass("hidden");

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
  _ensureContextMenuWithin() {
    let containerElm = this.element.closest("form");
    if (!ValidationUtil.isDefined(containerElm) || containerElm.length === 0) {
      containerElm = this.element.closest("body");
    }

    const outerBounds = SheetUtil.getElementRect(containerElm[0]);
    const contextMenuBounds = SheetUtil.getElementRect(this.#menuElement[0]);
    let left = 0;
    let top = 0;

    if (contextMenuBounds.right > outerBounds.right) {
      left = contextMenuBounds.right - outerBounds.right;
    } else if (contextMenuBounds.left < outerBounds.left) {
      left = outerBounds.left - contextMenuBounds.left;
    }

    if (contextMenuBounds.bottom > outerBounds.bottom) {
      top = contextMenuBounds.bottom - outerBounds.bottom;
    } else if (contextMenuBounds.top < outerBounds.top) {
      top = outerBounds.top - contextMenuBounds.top;
    }

    this.#menuElement.attr("style", `left: ${left}px; top: ${top}px;`);
  }
}

/**
 * Represents a `ButtonContextMenuViewModel` entry. 
 * 
 * @extends ChoiceOption
 * 
 * @property {String} value The actual value. 
 * @property {String | undefined} localizedValue The text that represents the value, to display to the user. 
 * @property {String | undefined} iconLightMode A (relative) icon file path or a FontAwesome icon class. 
 * * E.g. `"systems/strive/presentation/image/texture.svg"`
 * * E.g. `"fas fa-plus"`
 * @property {String | undefined} iconDarkMode A (relative) icon file path or a FontAwesome icon class. 
 * * E.g. `"systems/strive/presentation/image/texture.svg"`
 * * E.g. `"fas fa-plus"`
 * @property {String} iconHtml Returns an HTML representing string containing the 
 * light and dark mode icons, neatly wrapped in a div to be easily inserted into the DOM. 
 * * Read-only
 * @property {String | undefined} iconCssClass Additional CSS classes to add to the icon. 
 * @method onClick Invoked when this option is clicked. 
 * @method condition Invoked to determine visibility of the option. Must return `true` to make the 
 * option visible. 
 */
export class ContextMenuOption extends ChoiceOption {
  /**
   * @param {Object} args 
   * @param {String} args.value The actual value. 
   * @param {String | undefined} args.localizedValue The text that represents the value, 
   * to display to the user. 
   * @param {String | undefined} args.icon A theming-agnostic icon. Can be a CSS class or 
   * relative file path. 
   * Takes precedence over `iconLightMode` and `iconDarkMode`.
   * * E.g. `"systems/strive/presentation/image/texture.svg"`
   * * E.g. `"ico ico-skill"`
   * * E.g. `"fas fa-plus"`
   * @param {String | undefined} args.iconCssClass Additional CSS classes to add to the icon. 
   * @param {String | undefined} args.iconLightMode An icon for the light mode.
   * A (relative) icon file path or a FontAwesome icon class. 
   * * E.g. `"systems/strive/presentation/image/texture.svg"`
   * * E.g. `"fas fa-plus"`
   * @param {String | undefined} args.iconDarkMode An icon for the dark mode.
   * A (relative) icon file path or a FontAwesome icon class. 
   * * E.g. `"systems/strive/presentation/image/texture.svg"`
   * * E.g. `"fas fa-plus"`
   * 
   * @param {Function | undefined} args.onClick A callback function to trigger when 
   * the entry of the menu is clicked
   * @param {Function | undefined} args.condition Invoked to determine visibility of the option. 
   * Must return `true` to make the option visible. 
   */
  constructor(args = {}) {
    super(args);

    this.onClick = args.onClick ?? (() => {});
    this.condition = args.condition ?? (() => true);
  }
}
