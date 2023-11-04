import { TEMPLATES } from "../../../presentation/templatePreloader.mjs";
import FateCardChatMessageViewModel from "../../../presentation/sheet/item/fate-card/fate-card-chat-message-viewmodel.mjs";
import PreparedChatData from "../../../presentation/chat/prepared-chat-data.mjs";
import { SOUNDS_CONSTANTS } from "../../../presentation/audio/sounds.mjs";
import { ITEM_SUBTYPE } from "./item-subtype.mjs";
import TransientBaseItem from "./transient-base-item.mjs";
import { createUUID } from "../../util/uuid-utility.mjs";
import { DataField } from "../data-field.mjs";
import InputNumberSpinnerViewModel from "../../../presentation/component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import FateCardSheetPresenter from "../../../presentation/document/fate-card/fate-card-sheet-presenter.mjs";
import FateCardListItemPresenter from "../../../presentation/document/fate-card/fate-card-list-item-presenter.mjs";
import FateCardChatMessagePresenter from "../../../presentation/document/fate-card/fate-card-chat-message-presenter.mjs";

/**
 * Represents the full transient data of a fate card. 
 * 
 * @extends TransientBaseItem
 * 
 * @property {DataField< Object >} costMiFP
 * @property {DataField< Object >} costMaFP
 * @property {DataField< Object >} costAFP
 * @property {Object} cost Convenience accessor object for the cost. 
 * @property {DataField< Number >} cost.miFP
 * @property {DataField< Number >} cost.maFP
 * @property {DataField< Number >} cost.AFP
 */
export default class TransientFateCard extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/wing.svg"; }
  
  /** @override */
  get chatMessageTemplate() { return TEMPLATES.FATE_CARD_CHAT_MESSAGE; }
 
  costMiFP = new DataField({
    document: this,
    dataPaths: ["system.cost.miFP"],
    template: InputNumberSpinnerViewModel.TEMPLATE,
    defaultValue: 0,
    viewModelFunc: (parent, isOwner, isGM) => {
      return new InputNumberSpinnerViewModel({
        id: "costMiFP",
        parent: parent,
        localizedToolTip: game.i18n.localize("ambersteel.character.driverSystem.fateSystem.fatePoints.minor.label"),
        iconHtml: '<a href="icons/svg/bones.svg"></a>',
        min: 0,
      }); 
    },
  });
 
  costMaFP = new DataField({
    document: this,
    dataPaths: ["system.cost.maFP"],
    template: InputNumberSpinnerViewModel.TEMPLATE,
    defaultValue: 0,
    viewModelFunc: (parent, isOwner, isGM) => {
      return new InputNumberSpinnerViewModel({
        id: "costMaFP",
        parent: parent,
        localizedToolTip: game.i18n.localize("ambersteel.character.driverSystem.fateSystem.fatePoints.major.label"),
        iconHtml: '<a href="icons/svg/bones.svg"></a>',
        min: 0,
      }); 
    },
  });
 
  costAFP = new DataField({
    document: this,
    dataPaths: ["system.cost.AFP"],
    template: InputNumberSpinnerViewModel.TEMPLATE,
    defaultValue: 0,
    viewModelFunc: (parent, isOwner, isGM) => {
      return new InputNumberSpinnerViewModel({
        id: "costAFP",
        parent: parent,
        localizedToolTip: game.i18n.localize("ambersteel.character.driverSystem.fateSystem.fatePoints.ambition.label"),
        iconHtml: '<a href="icons/svg/bones.svg"></a>',
        min: 0,
      }); 
    },
  });

  /**
   * Convenience accessor object for the cost. 
   * 
   * @type {Object}
   * @readonly
   */
  get cost() {
    const thiz = this;
    return {
      miFP: thiz.costMiFP,
      maFP: thiz.costMaFP,
      AFP: thiz.costAFP,
    };
  }

  /**
   * @param {Item} document An encapsulated item instance. 
   * 
   * @throws {Error} Thrown, if `document` is `undefined`. 
   */
  constructor(document) {
    super(document);

    this.sheetPresenter = new FateCardSheetPresenter({ document: this });
    this.listItemPresenter = new FateCardListItemPresenter({ document: this });
    this.chatMessagePresenter = new FateCardChatMessagePresenter({ document: this });
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
      flavor: game.i18n.localize("ambersteel.character.driverSystem.fateSystem.fateCard.label"),
    });
  }

  /** @override */
  getChatViewModel(overrides = {}) {
    return new FateCardChatMessageViewModel({
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

ITEM_SUBTYPE.set("fate-card", (document) => { return new TransientFateCard(document) });
