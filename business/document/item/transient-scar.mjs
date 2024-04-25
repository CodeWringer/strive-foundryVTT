import { TEMPLATES } from "../../../presentation/templatePreloader.mjs";
import ScarChatMessageViewModel from "../../../presentation/sheet/item/scar/scar-chat-message-viewmodel.mjs";
import PreparedChatData from "../../../presentation/chat/prepared-chat-data.mjs";
import { SOUNDS_CONSTANTS } from "../../../presentation/audio/sounds.mjs";
import { ITEM_SUBTYPE } from "./item-subtype.mjs";
import TransientBaseItem from "./transient-base-item.mjs";
import { createUUID } from "../../util/uuid-utility.mjs";

/**
 * Represents the full transient data of a scar. 
 * 
 * @extends TransientBaseItem
 * 
 * @property {Number} limit
 */
export default class TransientScar extends TransientBaseItem {
  /** @override */
  static get TYPE() { return "scar"; }

  /** @override */
  get defaultImg() { return "icons/svg/deaf.svg"; }
  
  /** @override */
  get chatMessageTemplate() { return TEMPLATES.SCAR_CHAT_MESSAGE; }

  /**
   * @type {String}
   */
  get limit() {
    return this.document.system.limit;
  }
  /**
   * @param {String} value
   */
  set limit(value) {
    this.document.system.limit = value;
    this.updateByPath("system.limit", value);
  }

  /** @override */
  async getChatData() {
    const vm = this.getChatViewModel();

    const renderedContent = await renderTemplate(this.chatMessageTemplate, {
      viewModel: vm,
    });

    return new PreparedChatData({
      renderedContent: renderedContent,
      actor: (this.owningDocument ?? {}).document, 
      sound: SOUNDS_CONSTANTS.NOTIFY,
      viewModel: vm,
      flavor: game.i18n.localize("system.character.health.scar.singular"),
    });
  }

  /**
   * Returns an instance of a view model for use in a chat message. 
   * 
   * @param {Object | undefined} overrides Optional. An object that allows overriding any of the view model properties. 
   * @param {ViewModel | undefined} overrides.parent A parent view model instance. 
   * In case this is an embedded document, such as an expertise, this value must be supplied 
   * for proper function. 
   * @param {String | undefined} overrides.id
   * * default is a new UUID.
   * @param {Boolean | undefined} overrides.isEditable
   * * default `false`
   * @param {Boolean | undefined} overrides.isSendable
   * * default `false`
   * 
   * @returns {ScarChatMessageViewModel}
   * 
   * @override
   */
  getChatViewModel(overrides = {}) {
    return new ScarChatMessageViewModel({
      id: overrides.id,
      parent: overrides.parent,
      isEditable: overrides.isEditable ?? false,
      isSendable: overrides.isSendable ?? false,
      isOwner: this.isOwner,
      isGM: game.user.isGM,
      document: this,
    });
  }
}

ITEM_SUBTYPE.set("scar", (document) => { return new TransientScar(document) });
