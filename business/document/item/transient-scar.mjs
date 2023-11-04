import { TEMPLATES } from "../../../presentation/templatePreloader.mjs";
import ScarChatMessageViewModel from "../../../presentation/sheet/item/scar/scar-chat-message-viewmodel.mjs";
import PreparedChatData from "../../../presentation/chat/prepared-chat-data.mjs";
import { SOUNDS_CONSTANTS } from "../../../presentation/audio/sounds.mjs";
import { ITEM_SUBTYPE } from "./item-subtype.mjs";
import TransientBaseItem from "./transient-base-item.mjs";
import { createUUID } from "../../util/uuid-utility.mjs";
import { DataField } from "../data-field.mjs";
import InputTextFieldViewModel from "../../../presentation/component/input-textfield/input-textfield-viewmodel.mjs";
import ScarListItemPresenter from "../../../presentation/document/scar/scar-list-item-presenter.mjs";
import ScarSheetPresenter from "../../../presentation/document/scar/scar-sheet-presenter.mjs";
import ScarChatMessagePresenter from "../../../presentation/document/scar/scar-chat-message-presenter.mjs";

/**
 * Represents the full transient data of a scar. 
 * 
 * @extends TransientBaseItem
 * 
 * @property {DataField< Number >} limit
 */
export default class TransientScar extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/deaf.svg"; }
  
  /** @override */
  get chatMessageTemplate() { return TEMPLATES.SCAR_CHAT_MESSAGE; }

  limit = new DataField({
    document: this,
    dataPaths: ["system.limit"],
    template: InputTextFieldViewModel.TEMPLATE,
    defaultValue: "",
    viewModelFunc: (parent, isOwner, isGM) => { return new InputTextFieldViewModel({
      id: "limit",
      parent: parent,
      localizedToolTip: game.i18n.localize("ambersteel.character.health.injury.limit.label"),
      iconHtml: '<a href="icons/svg/bones.svg"></a>',
    }); },
  });

  /**
   * @param {Item} document An encapsulated item instance. 
   * 
   * @throws {Error} Thrown, if `document` is `undefined`. 
   */
  constructor(args = {}) {
    super(args);

    this.sheetPresenter = new ScarSheetPresenter({ document: this });
    this.listItemPresenter = new ScarListItemPresenter({ document: this });
    this.chatMessagePresenter = new ScarChatMessagePresenter({ document: this });
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
      flavor: game.i18n.localize("ambersteel.character.health.scar.singular"),
    });
  }

  /** @override */
  getChatViewModel(overrides = {}) {
    return new ScarChatMessageViewModel({
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

ITEM_SUBTYPE.set("scar", (document) => { return new TransientScar(document) });
