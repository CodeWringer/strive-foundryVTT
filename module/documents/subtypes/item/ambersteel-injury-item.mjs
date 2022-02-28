import AmbersteelBaseItem from "./ambersteel-base-item.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";
import InjuryChatMessageViewModel from "../../../../templates/item/injury/injury-chat-message-viewmodel.mjs";

export default class AmbersteelInjuryItem extends AmbersteelBaseItem {
  /**
   * @param parent {Item} The owning Item. 
   */
  constructor(parent) {
    super(parent);
    
    this.parent.chatMessageTemplate = this.chatMessageTemplate;
    this.parent.getChatData = this.getChatData.bind(this);
  }

  /** @override */
  get img() { return "icons/svg/bones.svg"; }

  /**
   * Chat message template path. 
   * @type {String}
   */
  get chatMessageTemplate() { return TEMPLATES.INJURY_CHAT_MESSAGE; }

  /** @override */
  prepareData() {
    this.parent.data.img = this.img;
  }

  /** @override */
  async getChatData() {
    const messageBase = super.getChatData();
    const renderedContent = await renderTemplate(this.chatMessageTemplate, {
      viewModel: new InjuryChatMessageViewModel({
        isEditable: false,
        isSendable: false,
        isOwner: this.parent.owner,
        isGM: game.user.isGM,
        item: this.parent,
      })
    });

    return {
      ...messageBase,
      flavor: game.i18n.localize("ambersteel.labels.injury"),
      renderedContent: renderedContent
    }
  }
}
