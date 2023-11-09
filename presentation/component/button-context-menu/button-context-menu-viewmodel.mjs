import ButtonViewModel from "../button/button-viewmodel.mjs";

/**
 * A button that allows showing a context menu with specifically defined menu items. 
 * 
 * @extends ButtonViewModel
 * 
 * @property {Array<ContextMenuItem>} menuItems An array of {ContextMenuItem} instances, 
 * which are used to populate the context menu. 
 * 
 * @method onClick Asynchronous callback that is invoked when the button is clicked. 
 * Receives the button's original click-handler as its sole argument. In most cases, it should be called 
 * and awaited before one's own click handling logic. But in case the original logic is unwanted, the method can be ignored.
 * * Returns nothing.
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
   * Returns two button definitions for a button to "toggle" a property value to be 
   * null or non-null. 
   * 
   * @param {String} label The button's localizable label. 
   * @param {Object} propertyOwner Parent object of the property. 
   * @param {String} propertyName Name of the property. 
   * @param {Any} nonNullValue Value to set on the property that is non-null. 
   * 
   * @returns {Array<Object>} Two button definitions. One for each state of the toggle button. 
   */
  static createToggleButtons(label, propertyOwner, propertyName, nonNullValue) {
    const localizedLabel = game.i18n.localize(label);
    return [
      {
        name: localizedLabel,
        icon: '<i class="fas fa-check"></i>',
        condition: () => { return isDefined(propertyOwner[propertyName]) === true; },
        callback: () => { propertyOwner[propertyName] = null; },
      },
      {
        name: localizedLabel,
        icon: '',
        condition: () => { return isDefined(propertyOwner[propertyName]) !== true; },
        callback: () => { propertyOwner[propertyName] = nonNullValue; },
      }
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
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, will be interactible. 
   * @param {String | undefined} args.localizedTooltip Localized tooltip. 
   * 
   * @param {Array<Object> | undefined} menuItems An array of context menu items, 
   * which are used to populate the context menu. The items can have the following properties: 
   * * `{String} name` - The displayed item name
   * * `{String} icon` An icon glyph HTML string
   * * `{Function} condition` A function which returns a Boolean for whether or not to display the item
   * * `{Function} callback` A callback function to trigger when the entry of the menu is clicked
   * 
   * @param {Function | undefined} args.onClick Asynchronous callback that is invoked when the button is clicked. 
   * Receives the button's original click-handler as its sole argument. In most cases, it should be called 
   * and awaited before one's own click handling logic. But in case the original logic is unwanted, the method can be ignored.
   * * Returns nothing. 
   */
  constructor(args = {}) {
    super({
      ...args,
      iconHtml: '<i class="fas fa-bars"></i>',
    });

    this.menuItems = args.menuItems ?? [];
    this.localizedTooltip = args.localizedTooltip ?? game.i18n.localize("ambersteel.general.contextMenu");

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
   * @override
   * @see {ButtonViewModel._onClick}
   * @async
   */
  async _onClick() {
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
