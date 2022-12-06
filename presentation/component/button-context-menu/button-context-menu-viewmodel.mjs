import { TEMPLATES } from "../../templatePreloader.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";
import { validateOrThrow } from "../../utils/validation-utility.mjs";

/**
 * --- Inherited from ViewModel
 * 
 * @property {JQuery | HTMLElement} element The button element on the DOM. 
 * @property {String} id Optional. Id used for the HTML element's id and name attributes. 
 * @property {String} TEMPLATE Static. Returns the template this ViewModel is intended for. 
 * 
 * --- Inherited from ButtonViewModel
 * 
 * @property {JQuery | HTMLElement} element The button element on the DOM. 
 * @property {Object} target The target object to affect.  
 * 
 * --- Own properties
 * 
 * @property {Array<ContextMenuItem>} menuItems An array of {ContextMenuItem} instances, 
 * which are used to populate the context menu. 
 * @see https://foundryvtt.com/api/ContextMenu.html
 */
export default class ButtonContextMenuViewModel extends ButtonViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_BUTTON_CONTEXT_MENU; }

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
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * 
   * @param {Function | String | undefined} args.callback Optional. Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {Any | undefined} args.callbackData Optional. Defines any data to pass to the completion callback. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, will be interactible. 
   * @param {String | undefined} args.localizableTitle Optional. The localizable title (tooltip). 
   * 
   * @param {Array<Object> | undefined} menuItems An array of context menu items, 
   * which are used to populate the context menu. 
   * 
   * The items can have the following properties: 
   * 
   * {String} name The displayed item name
   * 
   * {String} icon An icon glyph HTML string
   * 
   * {Function} condition A function which returns a Boolean for whether or not to display the item
   * 
   * {Function} callback A callback function to trigger when the entry of the menu is clicked
   */
  constructor(args = {}) {
    super(args);

    this.menuItems = args.menuItems ?? [];
    this.localizableTitle = args.localizableTitle ?? "ambersteel.general.contextMenu";

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
  activateListeners(html, isOwner, isEditable) {
    super.activateListeners(html, isOwner, isEditable);

    this.html = html;
    this._contextMenu = new ContextMenu(html, this.id, this.menuItems);
  }

  /**
   * @override
   * @see {ButtonViewModel.onClick}
   * @async
   */
  async onClick(html, isOwner, isEditable) {
    if (isEditable !== true) return;

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

    const contextMenuElement = outerHtml.find(`#${this.id} nav#context-menu`);

    if (contextMenuElement === undefined || contextMenuElement === null || contextMenuElement.length === 0) {
      game.ambersteel.logger.logWarn("NullPointerException: ContextMenu: Failed to get context menu element")
    }

    const outerBounds = outerHtml[0].getBoundingClientRect();
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

Handlebars.registerPartial('buttonContextMenu', `{{> "${ButtonContextMenuViewModel.TEMPLATE}"}}`);
