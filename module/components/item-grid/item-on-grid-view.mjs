import AmbersteelItemItem from "../../documents/subtypes/item/ambersteel-item-item.mjs";
import InventoryIndex from "../../dto/inventory-index.mjs";
import CenterLayoutContainer from "../../pixi/center-layout-container.mjs";
import Containable from "../../pixi/containable.mjs";
import DisplayObjectWrap from "../../pixi/display-object-wrap.mjs";
import HorizontalLayoutContainer from "../../pixi/horizontal-layout-container.mjs";
import MarginLayoutContainer from "../../pixi/margin-layout-container.mjs";
import VerticalLayoutContainer from "../../pixi/vertical-layout-container.mjs";
import { EventEmitter } from "../../utils/event-emitter.mjs";
import { TEXTURES } from "../../pixi/texture-preloader.mjs";
import { queryVisibilityMode } from '../../utils/chat-utility.mjs';
import { Button } from "../../pixi/button.mjs";

const FONT_FAMILY = "Black-Chancery";
const TEXT_SETTINGS = {fontFamily : FONT_FAMILY, fontSize: 18, fontWeight: "bolder", fill : 0x191813, align : 'center'};
const TEXT_SETTINGS_INVERSE = {fontFamily : FONT_FAMILY, fontSize: 18, fontWeight: "bolder", fill : 0xffffff, align : 'center'};

export class ItemOnGridView {
  /**
   * @type {Object} { width: {Number}, height: {Number} }
   * @private
   */
  _tileSize = { width: 0, height: 0 };

  /**
   * @type {VerticalLayoutContainer}
   * @private
   */
  _contentContainer = undefined;

  /**
   * @type {ItemGridView}
   * @private
   */
  _parent = undefined;

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
   * @type {Array<Button>}
   * @private
   */
  _buttons = [];
  
  /**
   * Returns the wdith and height of the item, with respect to its current orientation. 
   * @type {Object} { width: {Number}, height: {Number} }
   */
  get orientedShape() {
    if (this.index.orientation === game.ambersteel.config.itemOrientations.vertical) {
      return { width: this._shape.width, height: this._shape.height };
    } else if (this.index.orientation === game.ambersteel.config.itemOrientations.horizontal) {
      return { width: this._shape.height, height: this._shape.width };
    }
  }

  /**
   * Returns the current orientation of the item. 
   * @type {CONFIG.itemOrientations}
   */
  get orientation() { return this.index.orientation; }

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

  /**
   * 
   * @param {AmbersteelItemItem} item 
   * @param {InventoryIndex} index 
   * @param {Object} tileSize { width: {Number}, height: {Number} }
   * @param {ItemGridView} itemGridView 
   */
  constructor(item, index, tileSize, itemGridView) {
    this._item = item;
    this._index = index;
    this._shape = item.data.data.shape;
    this._tileSize = tileSize;
    this._parent = itemGridView;
    this._rectangle = new PIXI.Rectangle(0, 0, 0, 0);
    
    // Set up root container and determine dimensions. 
    this.rootContainer = new CenterLayoutContainer(this._parent._pixiApp);
    
    // These actually implicitly set the rootContainer's dimensions.
    this.width = this.orientedShape.width * this._tileSize.width;
    this.height = this.orientedShape.height * this._tileSize.height;

    this._rectangle.width = this.width;
    this._rectangle.height = this.height;
    
    this._setupElements();
  }

  /**
   * Tears down this {ItemOnGridView}. 
   * 
   * NOTE: Callers mustn't use this instance any further, after this method has been called!
   */
  delete() {
    this.drawDebug = false;
    this.rootContainer.destroy();
    this._item.delete();
  }
  
  /**
   * Either returns the button containing the given pixel coordinates, 
   * or undefined, if there is no button at the given pixel coordinates. 
   * @param {Number} x Pixel coordinate. 
   * @param {Number} y Pixel coordinate. 
   * @returns {Button | undefined} A {Button}, or {undefined}. 
   */
  getButtonAt(x, y) {
    for (const _button of this._buttons) {
      const bounds = _button.getGlobalBounds();
      if (bounds.contains(x, y) === true) {
        return _button;
      }
    }
    return undefined;
  }

  /**
   * Sets up all graphical elements (sprites), as well as clickable {Button}s. 
   * @private
   */
  _setupElements() {
    const thiz = this;

    const pixiApp = this._parent._pixiApp;

    // Background sprite.
    // TODO: Make this work differently, perhaps more like a sprite grid, 
    // which uses individual sprites for the corners and walls. 
    this._spriteBackground = new DisplayObjectWrap(new PIXI.Sprite.from(TEXTURES.ITEM_SLOT), pixiApp);
    this._spriteBackground.fill = true;
    this.rootContainer.addChild(this._spriteBackground);

    // Content margin container. 
    this._rootContainerMargin = new MarginLayoutContainer(pixiApp);
    this._rootContainerMargin.padding.left = 8;
    this._rootContainerMargin.padding.right = 8;
    this._rootContainerMargin.padding.top = 8;
    this._rootContainerMargin.padding.bottom = 8;
    this._rootContainerMargin.fill = true;
    this.rootContainer.addChild(this._rootContainerMargin);

    // Content container. 
    this._contentContainer = new VerticalLayoutContainer(pixiApp);
    this._contentContainer.fill = true;
    this._rootContainerMargin.addChild(this._contentContainer);

    // HEADER

    const HEADER_HEIGHT = 16;

    this._containerHeader = new HorizontalLayoutContainer(pixiApp);
    this._containerHeader.height = HEADER_HEIGHT;
    this._contentContainer.addChild(this._containerHeader);

    // SendToChat button. 
    this._buttonSendToChat = new Button(pixiApp, TEXTURES.SEND_TO_CHAT, async () => {
      const dialogResult = await queryVisibilityMode();
      if (!dialogResult.confirmed) return;

      thiz.item.sendToChat(dialogResult.visibilityMode);
    });
    this._buttons.push(this._buttonSendToChat);
    this._buttonSendToChat.width = HEADER_HEIGHT;
    this._buttonSendToChat.height = HEADER_HEIGHT;
    this._containerHeader.addChild(this._buttonSendToChat);
    
    // Spacer. 
    const headerButtonsSpacer1 = new Containable(pixiApp);
    headerButtonsSpacer1.width = 6;
    this._containerHeader.addChild(headerButtonsSpacer1);
    
    // OpenSheet button. 
    this._buttonOpenSheet = new Button(pixiApp, TEXTURES.OPEN_SHEET, async () => {
      this.item.sheet.render(true);
    });
    this._buttons.push(this._buttonOpenSheet);
    this._buttonOpenSheet.width = HEADER_HEIGHT;
    this._buttonOpenSheet.height = HEADER_HEIGHT;
    this._containerHeader.addChild(this._buttonOpenSheet);

    // Spacer. 
    const headerButtonsSpacer2 = new Containable(pixiApp);
    headerButtonsSpacer2.width = 6;
    this._containerHeader.addChild(headerButtonsSpacer2);
    
    // Move to property button. 
    this._buttonMoveItemToProperty = new Button(pixiApp, TEXTURES.HAND_HOLD_ITEM_DOWN, async () => {
      thiz.item.updateProperty("data.isOnPerson", false);
      thiz._parent._itemGrid.remove(thiz.item);
      thiz._parent._itemGrid.synchronize();
    });
    this._buttons.push(this._buttonMoveItemToProperty);
    this._buttonMoveItemToProperty.width = HEADER_HEIGHT;
    this._buttonMoveItemToProperty.height = HEADER_HEIGHT;
    this._containerHeader.addChild(this._buttonMoveItemToProperty);
    
    // Header spacer. 
    const headerSpacer2 = new Containable(pixiApp);
    headerSpacer2.fill = true;
    this._containerHeader.addChild(headerSpacer2);

    // Delete/Remove button.
    this._buttonDelete = new Button(pixiApp, TEXTURES.DELETE, async () => {
      thiz._parent._itemGrid.remove(thiz.item);
      thiz._parent._itemGrid.synchronize();
      thiz.item.delete();
    });
    this._buttons.push(this._buttonDelete);
    this._buttonDelete.width = 14;
    this._buttonDelete.height = HEADER_HEIGHT;
    this._buttonDelete.padding.x = HEADER_HEIGHT - 14;
    this._containerHeader.addChild(this._buttonDelete);

    // ICON
    this._containerIcon = new CenterLayoutContainer(pixiApp);
    this._containerIcon.fill = true;

    this._spriteIcon = new DisplayObjectWrap(new PIXI.Sprite.from(TEXTURES.BULK), pixiApp);
    this._spriteIcon.alpha = 0.5;
    this._spriteIcon.tint = 0x565656;
    this._spriteIcon.wrapped.anchor.set(0.5);
    this._spriteIcon.wrapped.angle = this.index.orientation === game.ambersteel.config.itemOrientations.vertical ? 0 : 270;
    this._containerIcon.addChild(this._spriteIcon);

    this._contentContainer.addChild(this._containerIcon);

    // META
    const META_HEIGHT = 18;

    this._containerMeta = new HorizontalLayoutContainer(pixiApp);
    this._containerMeta.height = META_HEIGHT;
    this._contentContainer.addChild(this._containerMeta);

    // Quantity.
    this._containerQuantity = new HorizontalLayoutContainer(pixiApp);
    this._containerQuantity.height = META_HEIGHT;
    this._containerQuantity.width = META_HEIGHT + 3 + META_HEIGHT;
    this._containerMeta.addChild(this._containerQuantity);
    
    const containerQuantityImage = new CenterLayoutContainer(pixiApp);
    containerQuantityImage.width = META_HEIGHT;
    this._containerQuantity.addChild(containerQuantityImage);

    this._spriteQuantity = new DisplayObjectWrap(new PIXI.Sprite.from(TEXTURES.QUANTITY), pixiApp);
    this._spriteQuantity.tint = 0x000000;
    containerQuantityImage.addChild(this._spriteQuantity);

    const quantitySpacer = new Containable(pixiApp);
    quantitySpacer.width = 3;
    this._containerQuantity.addChild(quantitySpacer);
    
    const quantityText = this._item.data.data.maxQuantity > 1 ? `${this._item.data.data.quantity}/${this._item.data.data.maxQuantity}` : this._item.data.data.quantity;
    this._textQuantity = new DisplayObjectWrap(new PIXI.Text(quantityText, TEXT_SETTINGS), pixiApp);
    this._containerQuantity.addChild(this._textQuantity);

    // Spacer.
    const metaSpacer = new Containable(pixiApp);
    metaSpacer.fill = true;
    this._containerMeta.addChild(metaSpacer);

    // Bulk.
    this._containerBulk = new HorizontalLayoutContainer(pixiApp);
    this._containerBulk.height = META_HEIGHT;
    this._containerBulk.width = META_HEIGHT * 1.5 + 3;
    this._containerMeta.addChild(this._containerBulk);

    const containerBulkImage = new CenterLayoutContainer(pixiApp);
    containerBulkImage.width = META_HEIGHT;
    this._containerBulk.addChild(containerBulkImage);

    this._spriteBulk = new DisplayObjectWrap(new PIXI.Sprite.from(TEXTURES.BULK), pixiApp);
    this._spriteBulk.tint = 0x000000;
    containerBulkImage.addChild(this._spriteBulk);

    const bulkSpacer = new Containable(pixiApp);
    bulkSpacer.width = 3;
    this._containerBulk.addChild(bulkSpacer);
    
    this._textBulk = new DisplayObjectWrap(new PIXI.Text(this._item.data.data.bulk, TEXT_SETTINGS), pixiApp);
    this._containerBulk.addChild(this._textBulk);

    // FOOTER
    const FOOTER_HEIGHT = 20;

    this._contentFooter = new CenterLayoutContainer(pixiApp);
    this._contentFooter.height = FOOTER_HEIGHT;
    this._contentContainer.addChild(this._contentFooter);

    // Title
    this._textName = new DisplayObjectWrap(new PIXI.Text(this._item.name, TEXT_SETTINGS), pixiApp);
    this._contentFooter.addChild(this._textName);
  }
}
