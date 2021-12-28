import AmbersteelItemItem from "../../documents/subtypes/item/ambersteel-item-item.mjs";
import InventoryIndex from "../../dto/inventory-index.mjs";
import CenterLayoutContainer from "../../pixi/center-layout-container.mjs";
import Containable from "../../pixi/containable.mjs";
import DisplayObjectWrap from "../../pixi/display-object-wrap.mjs";
import HorizontalLayoutContainer from "../../pixi/horizontal-layout-container.mjs";
import MarginLayoutContainer from "../../pixi/margin-layout-container.mjs";
import VerticalLayoutContainer from "../../pixi/vertical-layout-container.mjs";
import { EventEmitter } from "../../utils/event-emitter.mjs";
import { TEXTURES } from "./texture-preloader.mjs";
import { queryVisibilityMode } from '../../utils/chat-utility.mjs';

const FONT_FAMILY = "Black-Chancery";
const TEXT_SETTINGS = {fontFamily : FONT_FAMILY, fontSize: 18, fontWeight: "bolder", fill : 0x191813, align : 'center'};
const TEXT_SETTINGS_INVERSE = {fontFamily : FONT_FAMILY, fontSize: 18, fontWeight: "bolder", fill : 0xffffff, align : 'center'};

// TODO: Implement proper layouting-logic or figure out how to make yoga layout for PixiJS work. 
export class ItemOnGrid {
  /**
   * @type {Number}
   * @private
   */
  _tileSize = 0;

  /**
   * @type {PIXI.Application}
   * @private
   */
  _pixiApp = undefined;

  /**
   * @type {VerticalLayoutContainer}
   * @private
   */
  _contentContainer = undefined;

  /**
   * @type {EventEmitter}
   * @private
   */
  _eventEmitter = undefined;

  /**
   * The currently focused element. 
   * @type {PIXI.DisplayObject|PIXI.Container|undefined}
   * @private
   */
  _focused = undefined;

  /**
   * Root Container which encompasses the entire item on grid. 
   * @type {CenterLayoutContainer}
   */
  rootContainer = undefined;

  /**
   * @type {AmbersteelItemItem}
   * @private
   */
  _item = undefined;
  /**
   * @type {AmbersteelItemItem}
   */
  get item() { return this._item; }

  /**
   * @type {InventoryIndex}
   * @private
   */
  _index = undefined;
  /**
   * @type {InventoryIndex}
   */
  get index() { return this._index; }
  
  /**
   * @type {Object} { width: {Number}, height: {Number} }
   * @private
   */
  _shape = { width: 1, height: 1 };
  /**
   * @type {Object} { width: {Number}, height: {Number} }
   */
  get shape() { return this._shape; }

  /**
   * A list of clickable buttons and their callbacks. 
   * @type {Array<ItemGridButtonMapButton>}
   * @private
   */
  _buttons = [];
  
  /**
   * Returns the wdith and height of the item, with respect to its current orientation. 
   * @type {Object} { width: {Number}, height: {Number} }
   */
  get orientedShape() {
    if (this.index.orientation === game.ambersteel.config.itemOrientations.vertical) {
      return this._shape;
    } else if (this.index.orientation === game.ambersteel.config.itemOrientations.horizontal) {
      return { width: this._shape.height, height: this._shape.width };
    }
  }

  /**
   * @type {PIXI.Rectangle}
   * @private
   */
  _rectangle = undefined;
  get rectangle() { return this._rectangle; }

  get x() { return this.rootContainer.x; }
  set x(value) {
    this.rootContainer.x = value;
    this._rectangle.x = value;
  }

  get y() { return this.rootContainer.y; }
  set y(value) {
    this.rootContainer.y = value;
    this._rectangle.y = value;
  }

  get width() { return this.rootContainer.width; }
  set width(value) {
    this.rootContainer.width = value;
    this._rectangle.width = value;
  }

  get height() { return this.rootContainer.height; }
  set height(value) {
    this.rootContainer.height = value;
    this._rectangle.height = value;
  }

  _drawDebug = false;
  get drawDebug() { return this._drawDebug; }
  set drawDebug(value) {
    this._drawDebug = value;
    this.rootContainer.drawDebug = value;
  }

  get tint() { return this._spriteBackground.tint; }
  set tint(value) { this._spriteBackground.tint = value; }

  constructor(item, index, tileSize, pixiApp) {
    this._item = item;
    this._index = index;
    this._shape = item.data.data.shape;
    this._tileSize = tileSize;
    this._pixiApp = pixiApp;
    this._rectangle = new PIXI.Rectangle(0, 0, 0, 0);
    
    this._eventEmitter = new EventEmitter();
    this._eventEmitter.bind(this);
    
    // Set up root container and determine dimensions. 
    this.rootContainer = new CenterLayoutContainer(this._pixiApp);
    
    // These actually implicitly set the rootContainer's dimensions.
    this.width = this.orientedShape.width * this._tileSize.width;
    this.height = this.orientedShape.height * this._tileSize.height;

    this._rectangle.width = this.width;
    this._rectangle.height = this.height;
    
    this._setupElements();
  }

  /**
   * Toggles between the vertical and horizontal orientation. 
   */
  rotate() {
    if (this.index.orientation === game.ambersteel.config.itemOrientations.vertical) {
      this.index.orientation = game.ambersteel.config.itemOrientations.horizontal;
    } else if (this.index.orientation === game.ambersteel.config.itemOrientations.horizontal) {
      this.index.orientation = game.ambersteel.config.itemOrientations.vertical;
    }
  }

  delete() {
    this.drawDebug = false;
    this.rootContainer.destroy();
    this._item.delete();
  }

  _setupElements() {
    const itemOnGrid = this;

    // Background sprite.
    // TODO: Make this work differently, perhaps more like a sprite grid, 
    // which uses individual sprites for the corners and walls. 
    this._spriteBackground = new DisplayObjectWrap(new PIXI.Sprite.from(TEXTURES.ITEM_SLOT), this._pixiApp);
    this._spriteBackground.fill = true;
    this.rootContainer.addChild(this._spriteBackground);

    // Content margin container. 
    this._rootContainerMargin = new MarginLayoutContainer(this._pixiApp);
    this._rootContainerMargin.padding.left = 8;
    this._rootContainerMargin.padding.right = 8;
    this._rootContainerMargin.padding.top = 8;
    this._rootContainerMargin.padding.bottom = 8;
    this._rootContainerMargin.fill = true;
    this.rootContainer.addChild(this._rootContainerMargin);

    // Content container. 
    this._contentContainer = new VerticalLayoutContainer(this._pixiApp);
    this._contentContainer.fill = true;
    this._rootContainerMargin.addChild(this._contentContainer);

    // HEADER

    const HEADER_HEIGHT = 16;

    this._containerHeader = new HorizontalLayoutContainer(this._pixiApp);
    this._containerHeader.height = HEADER_HEIGHT;
    this._contentContainer.addChild(this._containerHeader);

    // SendToChat button. 
    this._containerSendToChat = new CenterLayoutContainer(this._pixiApp);
    this._containerSendToChat.width = HEADER_HEIGHT;
    
    this._spriteSendToChat = new DisplayObjectWrap(new PIXI.Sprite.from(TEXTURES.SEND_TO_CHAT), this._pixiApp);
    this._containerSendToChat.addChild(this._spriteSendToChat);

    this._containerHeader.addChild(this._containerSendToChat);

    this._buttons.push(new ItemGridButtonMapButton(
      this._containerSendToChat,
      false,
      async () => {
        const dialogResult = await queryVisibilityMode();
        if (!dialogResult.confirmed) return;
  
        itemOnGrid.item.sendToChat(dialogResult.visibilityMode);
      }
    ));
    
    // Spacer between SendToChat and OpenSheet. 
    const headerButtonsSpacer1 = new Containable(this._pixiApp);
    headerButtonsSpacer1.width = 6;
    this._containerHeader.addChild(headerButtonsSpacer1);

    // OpenSheet button. 
    this._containerOpenSheet = new CenterLayoutContainer(this._pixiApp);
    this._containerOpenSheet.width = HEADER_HEIGHT;
    
    this._spriteOpenSheet = new DisplayObjectWrap(new PIXI.Sprite.from(TEXTURES.OPEN_SHEET), this._pixiApp);
    this._containerOpenSheet.addChild(this._spriteOpenSheet);

    this._containerHeader.addChild(this._containerOpenSheet);
    
    // Header spacer. 
    const headerSpacer2 = new Containable(this._pixiApp);
    headerSpacer2.fill = true;
    this._containerHeader.addChild(headerSpacer2);

    // Delete/Remove button.
    this._containerDelete = new CenterLayoutContainer(this._pixiApp);
    this._containerDelete.width = 14;
    
    this._spriteDelete = new DisplayObjectWrap(new PIXI.Sprite.from(TEXTURES.DELETE), this._pixiApp);
    this._containerDelete.addChild(this._spriteDelete);

    this._containerHeader.addChild(this._containerDelete);

    // ICON
    this._containerIcon = new CenterLayoutContainer(this._pixiApp);
    this._containerIcon.fill = true;

    this._spriteIcon = new DisplayObjectWrap(new PIXI.Sprite.from(TEXTURES.BULK), this._pixiApp);
    this._spriteIcon.alpha = 0.5;
    this._spriteIcon.wrapped.anchor.set(0.5);
    this._spriteIcon.wrapped.angle = this.index.orientation === game.ambersteel.config.itemOrientations.vertical ? 0 : 270;
    this._containerIcon.addChild(this._spriteIcon);

    this._contentContainer.addChild(this._containerIcon);

    // META
    const META_HEIGHT = 18;

    this._containerMeta = new HorizontalLayoutContainer(this._pixiApp);
    this._containerMeta.height = META_HEIGHT;
    this._contentContainer.addChild(this._containerMeta);

    // Quantity.
    this._containerQuantity = new HorizontalLayoutContainer(this._pixiApp);
    this._containerQuantity.height = META_HEIGHT;
    this._containerQuantity.width = META_HEIGHT + 6 + META_HEIGHT;
    this._containerMeta.addChild(this._containerQuantity);
    
    const containerQuantityImage = new CenterLayoutContainer(this._pixiApp);
    containerQuantityImage.width = META_HEIGHT;
    this._containerQuantity.addChild(containerQuantityImage);

    this._spriteQuantity = new DisplayObjectWrap(new PIXI.Sprite.from(TEXTURES.QUANTITY), this._pixiApp);
    containerQuantityImage.addChild(this._spriteQuantity);

    const quantitySpacer = new Containable(this._pixiApp);
    quantitySpacer.width = 6;
    this._containerQuantity.addChild(quantitySpacer);
    
    this._textQuantity = new DisplayObjectWrap(new PIXI.Text(this._item.data.data.quantity, TEXT_SETTINGS), this._pixiApp);
    this._containerQuantity.addChild(this._textQuantity);

    // Spacer.
    const metaSpacer = new Containable(this._pixiApp);
    metaSpacer.fill = true;
    this._containerMeta.addChild(metaSpacer);

    // Bulk.
    this._textBulk = new DisplayObjectWrap(new PIXI.Text(this._item.data.data.bulk, TEXT_SETTINGS_INVERSE), this._pixiApp);
    
    const containerBulkText = new CenterLayoutContainer(this._pixiApp);
    containerBulkText.fill = true;
    containerBulkText.addChild(this._textBulk);
    
    const marginBulkTextContainer = new MarginLayoutContainer(this._pixiApp);
    marginBulkTextContainer.fill = true;
    marginBulkTextContainer.padding.top = 3; // TODO: Make this scale well. 
    marginBulkTextContainer.addChild(containerBulkText);
    
    this._spriteBulk = new DisplayObjectWrap(new PIXI.Sprite.from(TEXTURES.BULK), this._pixiApp);
    
    this._containerBulk = new CenterLayoutContainer(this._pixiApp);
    this._containerBulk.width = META_HEIGHT;
    this._containerBulk.addChild(this._spriteBulk);
    this._containerBulk.addChild(marginBulkTextContainer);

    this._containerMeta.addChild(this._containerBulk);

    // FOOTER
    const FOOTER_HEIGHT = 20;

    this._contentFooter = new CenterLayoutContainer(this._pixiApp);
    this._contentFooter.height = FOOTER_HEIGHT;
    this._contentContainer.addChild(this._contentFooter);

    // Title
    this._textName = new DisplayObjectWrap(new PIXI.Text(this._item.name, TEXT_SETTINGS), this._pixiApp);
    this._contentFooter.addChild(this._textName);
  }

  /**
   * Either returns the button containing the given pixel coordinates, 
   * or undefined, if there is no button at the given pixel coordinates. 
   * @param {Number} x Pixel coordinate. 
   * @param {Number} y Pixel coordinate. 
   * @returns {ItemGridButtonMapButton} 
   */
  getButtonAt(x, y) {
    for (const _button of this._buttons) {
      const bounds = _button.wrapped.getGlobalBounds();
      if (bounds.contains(x, y) === true) {
        return _button;
      }
    }
    return undefined;
  }
}

export class ItemGridButtonMapButton {
  /**
   * @type {DisplayObjectWrap | LayoutContainer}
   * @private
   */
  _wrapped = undefined;
  get wrapped() { return this._wrapped; }

  /**
   * @type {Function}
   * @async
   * @private
   */
  _callback = async () => {};
  get callback() { return this._callback; }

  /**
   * If true, this button should only be clickable (and visible), 
   * if the current user has editing permissions. 
   * @type {Boolean}
   * @private
   */
  _requiresEditPermission = false;
  get requiresEditPermission() { return this._requiresEditPermission; }

  constructor(sprite, requiresEditPermission, callback) {
    this._wrapped = sprite;
    this._requiresEditPermission = requiresEditPermission;
    this._callback = callback;
  }
}