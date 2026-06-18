import { ExtenderUtil } from "../../../../common/util/extender-util.mjs"
import FoundryWrapper from "../../../../foundry-interop/foundry-wrapper.mjs"
import { SOUNDS_CONSTANTS } from "../../../../presentation/audio/sounds.mjs"
import PreparedChatData from "../../../../presentation/chat/prepared-chat-data.mjs"
import HealthConditionChatMessageViewModel from "../../../../presentation/sheet/item/health-condition/health-condition-chat-message-viewmodel.mjs"
import TransientBaseItem from "./transient-base-item.mjs"

/**
 * @property {Number} current
 * @property {Number} limit
 * 
 * @extends TransientBaseItem
 */
export default class TransientHealthCondition extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "systems/strive/presentation/image/health-condition.svg"; }
  
  /** @override */
  get chatMessageTemplate() { return HealthConditionChatMessageViewModel.TEMPLATE; }

  /**
   * @type {Number}
   */
  get current() {
    return this.document.system.current;
  }
  set current(value) {
    this.document.system.current = value;
    this.updateByPath("system.current", value);
  }
  
  /**
   * @type {Number}
   */
  get limit() {
    return this.document.system.limit;
  }
  set limit(value) {
    this.document.system.limit = value;
    this.updateByPath("system.limit", value);
  }

  /**
   * @param {GameSystemItem} document An encapsulated document instance. 
   * 
   * @throws {Error} Thrown, if `document` is `undefined`. 
   */
  constructor(document) {
    super(document);
    this.document.system.current = Math.max(1, this.document.system.current);
  }
  
  /** @override */
  async getChatData() {
    const vm = this.getChatViewModel();

    const renderedContent = await new FoundryWrapper().renderTemplate(this.chatMessageTemplate, {
      viewModel: vm,
    });

    return new PreparedChatData({
      renderedContent: renderedContent,
      actor: (this.owningDocument ?? {}).document, 
      sound: SOUNDS_CONSTANTS.NOTIFY,
      viewModel: vm,
      flavor: game.i18n.localize("system.character.health.condition.condition"),
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
   * @returns {HealthConditionChatMessageViewModel}
   * 
   * @override
   */
  getChatViewModel(overrides = {}) {
    return new HealthConditionChatMessageViewModel({
      id: overrides.id,
      parent: overrides.parent,
      isEditable: overrides.isEditable ?? false,
      isSendable: overrides.isSendable ?? false,
      isOwner: this.isOwner,
      isGM: game.user.isGM,
      document: this,
    });
  }
  
  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(TransientHealthCondition));
  }
}
