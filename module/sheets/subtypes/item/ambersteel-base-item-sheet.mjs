import * as SheetUtil from '../../../utils/sheet-utility.mjs';
import * as ChatUtil from '../../../utils/chat-utility.mjs';
import { queryVisibilityMode } from "../../../utils/chat-utility.mjs";
import { getNestedPropertyValue } from '../../../utils/property-utility.mjs';
import * as ButtonRoll from '../../../components/button-roll.mjs';
import * as ButtonDelete from '../../../components/button-delete.mjs';
import * as ButtonSendToChat from '../../../components/button-send-to-chat.mjs';
import * as ButtonToggleSkillAbilityList from '../../../components/button-toggle-skill-ability-list.mjs';

export default class AmbersteelBaseItemSheet {
  /**
   * The owning ItemSheet object. 
   * @type {ItemSheet}
   */
  parent = undefined;

  /**
   * @param parent {ItemSheet} The owning ItemSheet. 
   */
  constructor(parent) {
    if (!parent || parent === undefined) {
      throw "Argument 'owner' must not be null or undefined!"
    }
    this.parent = parent;
  }

  /**
   * Returns the template path. 
   * @returns {String} Path to the template. 
   * @virtual
   */
  get template() { 
    return "systems/ambersteel/templates/item/item-item-sheet.hbs"; 
  }

  /**
   * Returns the item object of the parent sheet. 
   * @returns {Item} The item object of the parent sheet. 
   */
  getItem() {
    return this.parent.item;
  }

  /**
   * Extends the given context object with derived data. 
   * 
   * This is where any data should be added, which is only required to 
   * display the data via the parent sheet. 
   * @param context {Object} A context data object. Some noteworthy properties are 
   * 'item', 'CONFIG', 'isSendable' and 'isEditable'. 
   * @virtual
   */
  prepareDerivedData(context) {
    context.ownerId = context.item.id;
    context.ownerType = "item";
  }

  /**
   * Registers events on elements of the given DOM. 
   * @param html {Object} DOM of the sheet for which to register listeners. 
   * @param isOwner {Boolean} If true, registers events that require owner permission. 
   * @param isEditable {Boolean} If true, registers events that require editing permission. 
   * @virtual
   */
  activateListeners(html, isOwner, isEditable) {
    ButtonRoll.activateListeners(html, this, isOwner, isEditable);
    // ButtonDelete.activateListeners(html, this, isOwner, isEditable);
    // ButtonSendToChat.activateListeners(html, this, isOwner, isEditable);
    // ButtonToggleSkillAbilityList.activateListeners(html, this, isOwner, isEditable);
    // TODO
    
    // -------------------------------------------------------------
    if (!isOwner) return;

    // Send item to chat. 
    html.find(".ambersteel-item-to-chat").click(this._onItemSendToChat.bind(this));

    // Send item property to chat.
    html.find(".ambersteel-item-property-to-chat").click(this._onItemPropertySendToChat.bind(this));

    // Roll property. 
    html.find(".ambersteel-property-roll").click(this._onPropertyRoll.bind(this));
    
    // -------------------------------------------------------------
    if (!isEditable) return;

    // Add Item
    html.find('.ambersteel-item-create').click(this._onItemCreate.bind(this));

    // Edit item. 
    html.find(".ambersteel-item-edit").change(this._onItemEdit.bind(this));

    // Delete item. 
    html.find(".ambersteel-item-delete").click(this._onItemDelete.bind(this));
  }

  /**
   * 
   * @param event 
   * @private
   * @async
   */
  async _onItemEdit(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const item = this.getItem();
    const propertyPath = element.dataset.field;
    const newValue = SheetUtil.getElementValue(element);

    await item.updateProperty(propertyPath, newValue);

    this.parent.render();
  }

  /**
   * 
   * @param event 
   * @private
   * @async
   */
  async _onItemDelete(event) {
    event.preventDefault();

    const item = this.getItem();
    await item.delete();
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   * @async
   */
  async _onItemCreate(event) {
    event.preventDefault();

    const header = event.currentTarget;
    const type = header.dataset.type;
    const data = duplicate(header.dataset);

    let imgPath = "icons/svg/item-bag.svg";
    if (type === "skill") {
      imgPath = "icons/svg/book.svg";
    } else if (type === "fate-card") {
      imgPath = "icons/svg/wing.svg";
    }

    const itemData = {
      name: `New ${type.capitalize()}`,
      type: type,
      data: data,
      img: imgPath
    };
    // Remove the type from the dataset since it's already in the 'itemData.type' property.
    delete itemData.data["type"];

    return await Item.create(itemData, { parent: this.parent });
  }

  /**
   * @param event 
   * @private
   * @async
   */
  async _onItemSendToChat(event) {
    event.preventDefault();

    const item = this.getItem();

    const dialogResult = await queryVisibilityMode();
    if (dialogResult.confirmed) {
      await item.sendToChat(dialogResult.visibilityMode);
    }
  }

  /**
   * @param event 
   * @private
   * @async
   */
  async _onItemPropertySendToChat(event) {
    event.preventDefault();

    const item = this.getItem();
    const propertyPath = event.currentTarget.dataset.property;
    
    const dialogResult = await queryVisibilityMode();
    if (dialogResult.confirmed) {
      await item.sendPropertyToChat(propertyPath, {
        parent: this.parent,
        actor: this.parent.actor, 
        visibilityMode: dialogResult.visibilityMode
      });
    }
  }

  /**
   * @param event 
   * @private
   * @async
   */
  async _onPropertyRoll(event) {
    event.preventDefault();

    const item = this.getItem();
    const actor = item.parent;
    const flavor = event.currentTarget.dataset.chatTitle;
    const propertyPath = event.currentTarget.dataset.property;
    const propertyValue = getNestedPropertyValue(item, propertyPath);

    const dialogResult = await queryVisibilityMode();
    if (dialogResult.confirmed) {
      const renderedContent = await new Roll(propertyValue).render();
      ChatUtil.sendToChat({
        speaker: actor,
        renderedContent: renderedContent,
        flavor: flavor,
        actor: actor,
        sound: "../sounds/dice.wav",
        visibilityMode: dialogResult.visibilityMode
      })
    }
  }
}