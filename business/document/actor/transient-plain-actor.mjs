import { ExtenderUtil } from "../../../common/extender-util.mjs";
import PlainActorChatMessageViewModel from "../../../presentation/sheet/actor/plain/plain-actor-chat-message-viewmodel.mjs";
import TransientBaseActor from "./transient-base-actor.mjs";

/**
 * Represents the full transient data of a plain actor. 
 * 
 * @extends TransientBaseActor
 */
export default class TransientPlainActor extends TransientBaseActor {
  /**
   * Returns the Chat message template path. 
   * 
   * @type {String}
   * @virtual
   * @readonly
   */
  get chatMessageTemplate() { return PlainActorChatMessageViewModel.TEMPLATE; }

  /** @override */
  getChatViewModel(overrides = {}) {
    return new PlainActorChatMessageViewModel({
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
    return super.getExtenders().concat(ExtenderUtil.getExtenders(TransientPlainActor));
  }
}
