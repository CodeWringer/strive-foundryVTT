import { TEMPLATES } from "../../../presentation/templatePreloader.mjs";
import MutationChatMessageViewModel from "../../../presentation/sheet/item/mutation/mutation-chat-message-viewmodel.mjs";
import PreparedChatData from "../../../presentation/chat/prepared-chat-data.mjs";
import { SOUNDS_CONSTANTS } from "../../../presentation/audio/sounds.mjs";
import { ITEM_SUBTYPE } from "./item-subtype.mjs";
import TransientBaseItem from "./transient-base-item.mjs";
import { createUUID } from "../../util/uuid-utility.mjs";
import MutationSheetPresenter from "../../../presentation/document/mutation/mutation-sheet-presenter.mjs";
import MutationListItemPresenter from "../../../presentation/document/mutation/mutation-list-item-presenter.mjs";
import MutationChatMessagePresenter from "../../../presentation/document/mutation/mutation-chat-message-presenter.mjs";

/**
 * Represents the full transient data of a mutation. 
 * 
 * @extends TransientBaseItem
 * 
 */
export default class TransientMutation extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/ice-aura.svg"; }
  
  /** @override */
  get chatMessageTemplate() { return TEMPLATES.MUTATION_CHAT_MESSAGE; }

  /**
   * @param {Item} document An encapsulated item instance. 
   * 
   * @throws {Error} Thrown, if `document` is `undefined`. 
   */
  constructor(args = {}) {
    super(args);

    this.sheetPresenter = new MutationSheetPresenter({ document: this });
    this.listItemPresenter = new MutationListItemPresenter({ document: this });
    this.chatMessagePresenter = new MutationChatMessagePresenter({ document: this });
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
      flavor: game.i18n.localize("ambersteel.character.health.mutation.singular"),
    });
  }

  /** @override */
  getChatViewModel(overrides = {}) {
    return new MutationChatMessageViewModel({
      id: `${this.id}-${createUUID()}`,
      isEditable: false,
      isSendable: false,
      isOwner: this.isOwner,
      isGM: game.user.isGM,
      document: this,
      ...overrides,
    });
  }
}

ITEM_SUBTYPE.set("mutation", (document) => { return new TransientMutation(document) });
