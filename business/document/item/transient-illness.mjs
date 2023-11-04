import { TEMPLATES } from "../../../presentation/templatePreloader.mjs";
import IllnessChatMessageViewModel from "../../../presentation/sheet/item/illness/illness-chat-message-viewmodel.mjs";
import PreparedChatData from "../../../presentation/chat/prepared-chat-data.mjs";
import { SOUNDS_CONSTANTS } from "../../../presentation/audio/sounds.mjs";
import { ITEM_SUBTYPE } from "./item-subtype.mjs";
import TransientBaseItem from "./transient-base-item.mjs";
import { createUUID } from "../../util/uuid-utility.mjs";
import { DataField } from "../data-field.mjs";
import InputRadioButtonGroupViewModel from "../../../presentation/component/input-radio-button-group/input-radio-button-group-viewmodel.mjs";
import InputTextFieldViewModel from "../../../presentation/component/input-textfield/input-textfield-viewmodel.mjs";
import { ILLNESS_STATES } from "../../ruleset/health/illness-states.mjs";
import StatefulChoiceOption from "../../../presentation/component/input-choice/stateful-choice-option.mjs";
import ValueAdapter from "../../util/value-adapter.mjs";

/**
 * Represents the full transient data of an illness. 
 * 
 * @extends TransientBaseItem
 * 
 * @property {DataField< String >} state
 * @property {DataField< String >} duration
 * @property {DataField< String >} treatment
 * @property {DataField< String >} treatmentSkill
 */
export default class TransientIllness extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/poison.svg"; }

  /** @override */
  get chatMessageTemplate() { return TEMPLATES.ILLNESS_CHAT_MESSAGE; }

  state = new DataField({
    document: this,
    dataPaths: ["system.state"],
    template: InputRadioButtonGroupViewModel.TEMPLATE,
    defaultValue: "active",
    viewModelFunc: (parent, isOwner, isGM) => {
      return new InputRadioButtonGroupViewModel({
        id: "state",
        parent: parent,
        localizedToolTip: game.i18n.localize("ambersteel.character.health.illness.state.label"),
        iconHtml: '<a href="icons/svg/bones.svg"></a>',
        options: this._getIllnessStateOptions(),
      }); 
    },
    viewModelAdapter: new ValueAdapter({
      to: (value) => {
        return this._getIllnessStateOptions().find(it => it.value === value);
      },
      from: (choiceOption) => {
        return choiceOption.value;
      }
    }),
  });

  duration = new DataField({
    document: this,
    dataPaths: ["system.duration"],
    template: InputTextFieldViewModel.TEMPLATE,
    defaultValue: "",
    viewModelFunc: (parent, isOwner, isGM) => {
      return new InputTextFieldViewModel({
        id: "duration",
        parent: parent,
        localizedToolTip: game.i18n.localize("ambersteel.character.health.duration"),
        iconHtml: '<a href="icons/svg/bones.svg"></a>',
      }); 
    },
  });

  treatment = new DataField({
    document: this,
    dataPaths: ["system.treatment"],
    template: InputTextFieldViewModel.TEMPLATE,
    defaultValue: "",
    viewModelFunc: (parent, isOwner, isGM) => {
      return new InputTextFieldViewModel({
        id: "treatment",
        parent: parent,
        localizedToolTip: game.i18n.localize("ambersteel.character.health.treatment"),
        iconHtml: '<a href="icons/svg/bones.svg"></a>',
      }); 
    },
  });

  treatmentSkill = new DataField({
    document: this,
    dataPaths: ["system.treatmentSkill"],
    template: InputTextFieldViewModel.TEMPLATE,
    defaultValue: "",
    viewModelFunc: (parent, isOwner, isGM) => {
      return new InputTextFieldViewModel({
        id: "treatmentSkill",
        parent: parent,
        localizedToolTip: game.i18n.localize("ambersteel.character.health.treatmentSkill"),
        iconHtml: '<a href="icons/svg/bones.svg"></a>',
      }); 
    },
  });

  /**
   * @param {Item} document An encapsulated item instance. 
   * 
   * @throws {Error} Thrown, if `document` is `undefined`. 
   */
  constructor(document) {
    super(document);

    this.sheetPresenter = new IllnessSheetPresenter({ document: this });
    this.listItemPresenter = new IllnessListItemPresenter({ document: this });
    this.chatMessagePresenter = new IllnessChatMessagePresenter({ document: this });
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
      flavor: game.i18n.localize("ambersteel.character.health.illness.singular"),
    });
  }

  /** @override */
  getChatViewModel(overrides = {}) {
    return new IllnessChatMessageViewModel({
      id: `${this.id}-${createUUID()}`,
      isEditable: false,
      isSendable: false,
      isOwner: this.isOwner,
      isGM: game.user.isGM,
      document: this,
      ...overrides,
    });
  }

  // TODO: Extract to more common ground?
  /**
   * @returns {Array<StatefulChoiceOption>}
   * 
   * @private
   */
  _getIllnessStateOptions() {
    return ILLNESS_STATES.asChoices().map((choiceOption) => {
      const html = `<i class="${choiceOption.icon}"></i>`;
      return new StatefulChoiceOption({
        value: choiceOption.value,
        activeHtml: html,
        tooltip: choiceOption.localizedValue,
        inactiveHtml: html,
      });
    })
  }
}

ITEM_SUBTYPE.set("illness", (document) => { return new TransientIllness(document) });
