import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
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
 * 
 * @see https://foundryvtt.com/api/ContextMenu.html
 */
export default class ButtonContextMenuViewModel extends ButtonViewModel {
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
   * @returns {Array<ContextMenuItem>} Two button definitions. One for each state of the toggle button. 
   */
  static createToggleButtons(args = {}) {
    ValidationUtil.validateOrThrow(args, ["activeValue"]);
    
    const localizedLabel = game.i18n.localize(args.label);
    return [
      new ContextMenuItem({
        name: localizedLabel,
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
        callback: () => { args.propertyOwner[args.propertyName] = (args.inactiveValue ?? null); },
      }),
      new ContextMenuItem({
        name: localizedLabel,
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
        callback: () => { args.propertyOwner[args.propertyName] = args.activeValue; },
      }),
    ];
  }

  /**
   * @type {ContextMenu}
   * @private
   */
  _contextMenu = undefined;

  /**
   * @private
   */
  _isShown = false;
  /**
   * @type {Boolean}
   */
  get isShown() { return this._isShown; }
  /**
   * @param {Boolean} value
   */
  set isShown(value) {
    this._isShown = value;
    if (value === true) {
      this._contextMenu.render(this.element);
      this._ensureContextMenuWithin(this.html);
    } else {
      this._contextMenu.close({ animate: true });
    }
  }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {ViewModel | undefined} args.parent Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, will be interactible. 
   * @param {String | undefined} args.localizedToolTip A localized text to 
   * display as a tool tip. 
   * @param {String | undefined} args.localizedLabel A localized text to 
   * display as a button label. 
   * @param {String | undefined} args.iconHtml Raw HTML to render as 
   * an associated icon. E. g. `'<i class="fas fa-scroll"></i>'`
   * * default `'<i class="fas fa-bars"></i>'`
   * @param {Boolean | undefined} args.showFancyFont If `true`, will render 
   * the `localizedLabel` using the "fancy font". 
   * @param {Function | undefined} args.onClick Asynchronous callback that is invoked when 
   * the button is clicked. Arguments: 
   * * `event: Event`
   * * `data: any | undefined` - Returned data of the click callback, if 
   * there is any. 
   * 
   * @param {Array<ContextMenuItem> | undefined} args.menuItems An array of context menu items, 
   * which are used to populate the context menu. 
   */
  constructor(args = {}) {
    super({
      ...args,
      iconHtml: args.iconHtml ?? '<i class="fas fa-bars"></i>',
      localizedToolTip: args.localizedToolTip ?? game.i18n.localize("system.general.contextMenu"),
    });

    this.menuItems = args.menuItems ?? [];

    // Wrap the callback function to make it also ensure the context menu is properly closed, 
    // when the menu item is clicked. 
    const thiz = this;
    for (const menuItem of this.menuItems) {
      const wrappedFunction = menuItem.callback;
      menuItem.callback = () => {
        thiz.isShown = false;
        wrappedFunction();
      }
    }
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    this.html = html;
    this._contextMenu = new ContextMenu(html, this.id, this.menuItems);
  }

  /**
   * @param {Event} event
   * 
   * @async
   * @protected
   * @override
   */
  async _onClick(event) {
    if (this.isEditable !== true) return;

    // Show context menu below button. 
    this.isShown = !this.isShown;
  }

  /**
   * Ensures the context menu isn't being cut off beyond the edges of the 
   * passed outer (containing) html. 
   * @param {JQuery} outerHtml 
   * @private
   */
  _ensureContextMenuWithin(outerHtml) {
    if (this.isShown !== true) return;

    const wrappedOuterHtml = $(outerHtml);
    const contextMenuElement = wrappedOuterHtml.find(`#${this.id} nav#context-menu`);

    if (contextMenuElement === undefined || contextMenuElement === null || contextMenuElement.length === 0) {
      game.strive.logger.logWarn("NullPointerException: ContextMenu: Failed to get context menu element")
      return;
    }

    const outerBounds = wrappedOuterHtml[0].getBoundingClientRect();
    const contextMenuBounds = contextMenuElement[0].getBoundingClientRect();

    if (contextMenuBounds.right > outerBounds.right) {
      const delta = contextMenuBounds.right - outerBounds.right;
      contextMenuElement[0].style.left = `-${delta}px`;
    } else if (contextMenuBounds.left < outerBounds.left) {
      const delta = outerBounds.left - contextMenuBounds.left;
      contextMenuElement[0].style.left = `${delta}px`;
    }

    if (contextMenuBounds.bottom > outerBounds.bottom) {
      const delta = contextMenuBounds.bottom - outerBounds.bottom;
      contextMenuElement[0].style.top = `-${delta}px`;
    } else if (contextMenuBounds.top < outerBounds.top) {
      const delta = outerBounds.top - contextMenuBounds.top;
      contextMenuElement[0].style.top = `${delta}px`;
    }
  }
}

/**
 * Represents a `ButtonContextMenuViewModel` entry. 
 * 
 * @property {String} name The displayed item name
 * @property {String | undefined} icon An icon glyph HTML string
 * @property {Function | undefined} condition A function which returns a Boolean 
 * for whether or not to display the item
 * @property {Function | undefined} callback A callback function to trigger when 
 * the entry of the menu is clicked
*/
export class ContextMenuItem {
  /**
   * @param {Object} args 
   * @param {String} args.name The displayed item name
   * @param {String | undefined} args.icon An icon glyph HTML string
   * @param {Function | undefined} args.condition A function which returns a Boolean 
   * for whether or not to display the item
   * @param {Function | undefined} args.callback A callback function to trigger when 
   * the entry of the menu is clicked
  */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["name"]);

    this.name = args.name;
    this.icon = args.icon;
    this.condition = args.condition;
    this.callback = args.callback;
  }
}
