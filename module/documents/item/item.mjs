// Imports of specific item "sub-types", to ensure their imports cause the `ITEM_SUBTYPE` map to be populated. 
import AmbersteelFateCardItem from './ambersteel-fate-card-item.mjs';
import AmbersteelIllnessItem from './ambersteel-illness-item.mjs';
import AmbersteelInjuryItem from './ambersteel-injury-item.mjs';
import AmbersteelItemItem from './ambersteel-item-item.mjs';
import AmbersteelSkillItem from './ambersteel-skill-item.mjs';
import AmbersteelMutationItem from './ambersteel-mutation-item.mjs';
// Other imports
import * as UpdateUtil from "../../utils/document-update-utility.mjs";
import * as ChatUtil from "../../utils/chat-utility.mjs";
import { createUUID } from '../../utils/uuid-utility.mjs';
import SheetViewModel from '../../components/sheet-viewmodel.mjs';
import PreparedChatData from '../../dto/prepared-chat-data.mjs';
import { SOUNDS_CONSTANTS } from '../../constants/sounds.mjs';
import { ITEM_SUBTYPE } from './item-subtype.mjs';

/**
 * @summary
 * This class represents FoundryVTT's `item` document type. 
 * 
 * @description
 * This is both the type that is instantiated by FoundryVTT for use in items, 
 * as well as a "base class" of sorts. To keep this class from becoming a 
 * monolithic maintenance nightmare, any type-specific things are only 
 * added _after_ this class is instantiated. 
 * 
 * To that end, via the '_getType'-method an instance of the specific type 
 * is fetched and then used in all the data preparation methods. 
 * 
 * **IMPORTANT**: The fetched sub-type instance **must not**, under any 
 * circumstance, keep a reference to *this* `Item` instance! Such circular 
 * references would cause errors within FoundryVTT itself. 
 * 
 * The sub types add properties and methods to this `Item` instance. 
 * That is also why this class only contains general and basic methods. 
 */
export class AmbersteelItem extends Item {
  /**
   * Returns the default icon image path for this type of object. 
   * @type {String}
   * @virtual
   * @readonly
   */
  get defaultImg() { return this._getType().defaultImg; }

  /**
   * Chat message template path. 
   * @type {String}
   * @readonly
   */
  get chatMessageTemplate() { return this._getType().chatMessageTemplate; }

  /** @override */
  prepareData() {
    super.prepareData();

    this._getType().prepareData(this);
  }
  
  /** @override */
  prepareBaseData() {
    super.prepareBaseData();
    
    this._getType().prepareBaseData(this);
  }
  
  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
    
    this._getType().prepareDerivedData(this);
  }

  /**
   * Returns an instance of the specific type of this item. 
   * @returns {AmbersteelFateCardItem | AmbersteelIllnessItem | AmbersteelInjuryItem | AmbersteelItemItem | AmbersteelSkillItem | AmbersteelMutationItem}
   * @private
   */
  _getType() {
    const type = this.type;
    const enhancer = ITEM_SUBTYPE.get(type);
    
    if (enhancer === undefined) {
      throw new Error(`InvalidTypeException: Item subtype ${type} is unrecognized!`);
    }

    return enhancer;
  }

  /**
   * Deletes a property on the given document, via the given path. 
   * @param {Document} document A Foundry {Document}. 
   * @param {String} propertyPath Path leading to the property to delete, on the given document entity. 
   *        Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   *        E.g.: "data.attributes[0].value" 
   *        E.g.: "data.attributes[4]" 
   *        E.g.: "data.attributes" 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. Default 'true'. 
   * @async
   */
  async deleteByPropertyPath(propertyPath, render = true) {
    await UpdateUtil.deleteByPropertyPath(this, propertyPath, render);
  }

  /**
   * Updates a property on the parent item, identified via the given path. 
   * @param {String} propertyPath Path leading to the property to update, on the parent item. 
   *        Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   *        E.g.: "data.attributes[0].value"
   * @param {any} newValue The value to assign to the property. 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. Default 'true'. 
   * @async
   * @protected
   */
  async updateProperty(propertyPath, newValue, render = true) {
    await UpdateUtil.updateProperty(this, propertyPath, newValue, render);
  }

  /**
   * Base implementation of returning data for a chat message, based on this item. 
   * @returns {PreparedChatData}
   * @virtual
   * @async
   */
  async getChatData() {
    const actor = this.parent ?? this.actor;
    const vm = this.getChatViewModel();

    const renderedContent = await renderTemplate(this.chatMessageTemplate, {
      viewModel: vm,
    });

    return new PreparedChatData({
      renderedContent: renderedContent,
      actor: actor, 
      sound: SOUNDS_CONSTANTS.NOTIFY,
      viewModel: vm,
    });
  }

  /**
   * Returns an instance of a view model for use in a chat message. 
   * @returns {SheetViewModel}
   * @param {Object | undefined} overrides Optional. An object that allows overriding any of the view model properties. 
   * @param {String | undefined} overrides.id
   * @param {Boolean | undefined} overrides.isEditable
   * @param {Boolean | undefined} overrides.isSendable
   * @param {Boolean | undefined} overrides.isOwner
   * @param {Boolean | undefined} overrides.isGM
   * @virtual
   */
  getChatViewModel(overrides = {}) {
    return new SheetViewModel({
      id: `${this.id}-${createUUID()}`,
      isEditable: false,
      isSendable: false,
      isOwner: this.isOwner ?? this.owner ?? false,
      isGM: game.user.isGM,
      ...overrides,
    });
  }

  /**
   * Base implementation of sending this item to the chat. 
   * @param {CONFIG.ambersteel.visibilityModes} visibilityMode Determines the visibility of the chat message. 
   * @async
   * @virtual
   */
  async sendToChat(visibilityMode = CONFIG.ambersteel.visibilityModes.public) {
    const chatData = await this.getChatData();
    ChatUtil.sendToChat({
      visibilityMode: visibilityMode,
      ...chatData
    });
  }

  /**
   * Sends a property of this item to chat, based on the given property path. 
   * @param {String} propertyPath 
   * @param {CONFIG.ambersteel.visibilityModes} visibilityMode 
   * @async
   */
  async sendPropertyToChat(propertyPath, visibilityMode = CONFIG.ambersteel.visibilityModes.public) {
    await ChatUtil.sendPropertyToChat({
      obj: this,
      propertyPath: propertyPath,
      parent: this,
      actor: this.parent ?? this.actor,
      visibilityMode: visibilityMode
    });
  }
}
