import { TEMPLATES } from "../../../presentation/templatePreloader.mjs";
import InjuryChatMessageViewModel from "../../../presentation/sheet/item/injury/injury-chat-message-viewmodel.mjs";
import PreparedChatData from "../../../presentation/chat/prepared-chat-data.mjs";
import { SOUNDS_CONSTANTS } from "../../../presentation/audio/sounds.mjs";
import { ITEM_SUBTYPE } from "./item-subtype.mjs";
import TransientBaseItem from "./transient-base-item.mjs";
import { createUUID } from "../../util/uuid-utility.mjs";
import { DataField, DataFieldAdapter, DataFieldPresenter, DataFieldRowLayout } from "../data-field.mjs";
import InputTextFieldViewModel from "../../../presentation/component/input-textfield/input-textfield-viewmodel.mjs";
import InputRadioButtonGroupViewModel from "../../../presentation/component/input-radio-button-group/input-radio-button-group-viewmodel.mjs";
import { INJURY_STATES } from "../../ruleset/health/injury-states.mjs";
import StatefulChoiceOption from "../../../presentation/component/input-choice/stateful-choice-option.mjs";
import { ColumnLayout, LayoutSize, RowLayout } from "../../../presentation/layout/layout.mjs";

/**
 * Represents the full transient data of an injury. 
 * 
 * @extends TransientBaseItem
 * 
 * @property {DataField< String >} state
 * @property {DataField< String >} timeToHeal
 * @property {DataField< String >} timeToHealTreated
 * @property {DataField< String >} limit 
 * @property {DataField< String >} scar 
 * @property {DataField< String >} selfPatchUp 
 * @property {DataField< String >} treatmentSkill 
 * @property {DataField< String >} requiredSupplies 
 * @property {DataField< String >} obstaclePatchUp 
 * @property {DataField< String >} obstacleTreatment 
 */
export default class TransientInjury extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/bones.svg"; }

  /** @override */
  get chatMessageTemplate() { return TEMPLATES.INJURY_CHAT_MESSAGE; }

  state = new DataField({
    document: this,
    dataPath: "system.state",
    template: InputRadioButtonGroupViewModel.TEMPLATE,
    viewModelFunc: (parent, isOwner, isGM) => { return new InputRadioButtonGroupViewModel({
      id: "state",
      parent: parent,
      localizedToolTip: game.i18n.localize("ambersteel.character.health.injury.state"),
      iconHtml: '<a href="icons/svg/bones.svg"></a>',
      options: this._getInjuryStateOptions(),
    }); },
    adapter: new DataFieldAdapter({
      toViewModelValue: (value) => {
        return this._getInjuryStateOptions().find(it => it.value === value);
      },
      fromViewModelValue: (choiceOption) => {
        return choiceOption.value;
      }
    }),
  });
  
  timeToHeal = new DataField({
    document: this,
    dataPath: "system.timeToHeal",
    template: InputTextFieldViewModel.TEMPLATE,
    viewModelFunc: (parent, isOwner, isGM) => { return new InputTextFieldViewModel({
      id: "timeToHeal",
      parent: parent,
      localizedToolTip: game.i18n.localize("ambersteel.character.health.timeToHeal"),
      iconHtml: '<a href="icons/svg/bones.svg"></a>',
    }); },
  });
  
  limit = new DataField({
    document: this,
    dataPath: "system.limit",
    template: InputTextFieldViewModel.TEMPLATE,
    viewModelFunc: (parent, isOwner, isGM) => { return new InputTextFieldViewModel({
      id: "timeToHeal",
      parent: parent,
      localizedToolTip: game.i18n.localize("ambersteel.character.health.injury.limit.label"),
      iconHtml: '<a href="icons/svg/bones.svg"></a>',
    }); },
  });
  
  scar = new DataField({
    document: this,
    dataPath: "system.scar",
    template: InputTextFieldViewModel.TEMPLATE,
    viewModelFunc: (parent, isOwner, isGM) => { return new InputTextFieldViewModel({
      id: "timeToHeal",
      parent: parent,
      localizedToolTip: game.i18n.localize("ambersteel.character.health.scar.singular"),
      iconHtml: '<a href="icons/svg/bones.svg"></a>',
    }); },
  });
  
  timeToHealTreated = new DataField({
    document: this,
    dataPath: "system.timeToHealTreated",
    template: InputTextFieldViewModel.TEMPLATE,
    viewModelFunc: (parent, isOwner, isGM) => { return new InputTextFieldViewModel({
      id: "timeToHeal",
      parent: parent,
      localizedToolTip: game.i18n.localize("ambersteel.character.health.timeToHealTreated"),
      iconHtml: '<a href="icons/svg/bones.svg"></a>',
    }); },
  });

  selfPatchUp = new DataField({
    document: this,
    dataPath: "system.selfPatchUp",
    template: InputTextFieldViewModel.TEMPLATE,
    viewModelFunc: (parent, isOwner, isGM) => { return new InputTextFieldViewModel({
      id: "timeToHeal",
      parent: parent,
      localizedToolTip: game.i18n.localize("ambersteel.character.health.selfPatchUp"),
      iconHtml: '<a href="icons/svg/bones.svg"></a>',
    }); },
  });

  treatmentSkill = new DataField({
    document: this,
    dataPath: "system.treatmentSkill",
    template: InputTextFieldViewModel.TEMPLATE,
    viewModelFunc: (parent, isOwner, isGM) => { return new InputTextFieldViewModel({
      id: "timeToHeal",
      parent: parent,
      localizedToolTip: game.i18n.localize("ambersteel.character.health.treatmentSkill"),
      iconHtml: '<a href="icons/svg/bones.svg"></a>',
    }); },
  });

  requiredSupplies = new DataField({
    document: this,
    dataPath: "system.requiredSupplies",
    template: InputTextFieldViewModel.TEMPLATE,
    viewModelFunc: (parent, isOwner, isGM) => { return new InputTextFieldViewModel({
      id: "timeToHeal",
      parent: parent,
      localizedToolTip: game.i18n.localize("ambersteel.character.health.requiredSupplies"),
      iconHtml: '<a href="icons/svg/bones.svg"></a>',
    }); },
  });

  obstaclePatchUp = new DataField({
    document: this,
    dataPath: "system.obstaclePatchUp",
    template: InputTextFieldViewModel.TEMPLATE,
    viewModelFunc: (parent, isOwner, isGM) => { return new InputTextFieldViewModel({
      id: "timeToHeal",
      parent: parent,
      localizedToolTip: game.i18n.localize("ambersteel.character.health.obstaclePatchUp"),
      iconHtml: '<a href="icons/svg/bones.svg"></a>',
    }); },
  });

  obstacleTreatment = new DataField({
    document: this,
    dataPath: "system.obstacleTreatment",
    template: InputTextFieldViewModel.TEMPLATE,
    viewModelFunc: (parent, isOwner, isGM) => { return new InputTextFieldViewModel({
      id: "timeToHeal",
      parent: parent,
      localizedToolTip: game.i18n.localize("ambersteel.character.health.obstacleTreatment"),
      iconHtml: '<a href="icons/svg/bones.svg"></a>',
    }); },
  });
  
  /**
   * Returns an array of all data fields of this document. 
   * 
   * @type {Array<DataField>}
   * @readonly
   */
  get dataFields() { return [
    this.state,
    this.timeToHeal,
    this.limit,
    this.scar,
    this.timeToHealTreated,
    this.selfPatchUp,
    this.treatmentSkill,
    this.requiredSupplies,
    this.obstaclePatchUp,
    this.obstacleTreatment,
  ]; }

  /**
   * Returns the layout of this type for presentation as a sheet. 
   * 
   * @type {Layoutable}
   * @readonly
   */
  get sheetLayout() {
    return new ColumnLayout({
      content: [
        new RowLayout({
          cssClass: "header",
          content: [
            this.img,
            this.name,
            this.buttonSendToChat,
          ],
        }),
        new RowLayout({
          content: [
            this.description,
          ],
        }),
        new RowLayout({
          content: [
            this.treatmentSkill,
            this.requiredSupplies,
          ],
        }),
        new RowLayout({
          content: [
            this.obstaclePatchUp,
            this.obstacleTreatment,
          ],
        }),
        new RowLayout({
          content: [
            this.timeToHeal,
            this.timeToHealTreated,
            this.selfPatchUp,
          ],
        }),
        new RowLayout({
          content: [
            this.scar,
            this.limit,
          ],
        }),
      ],
    });
  }

  /**
   * Returns the layout of this type for presentation as a list item. 
   * 
   * @type {Layoutable}
   * @readonly
   */
  get listItemLayout() {
    return new ColumnLayout({
      content: [
        new RowLayout({
          cssClass: "header",
          content: [
            this.buttonSendToChat,
            this.img,
            this.name,
            this.state,
            this.buttonDelete,
          ],
        }),
        new RowLayout({
          content: [
            this.description,
          ],
        }),
        new RowLayout({
          content: [
            this.treatmentSkill,
            this.requiredSupplies,
          ],
        }),
        new RowLayout({
          content: [
            this.obstaclePatchUp,
            this.obstacleTreatment,
          ],
        }),
        new RowLayout({
          content: [
            this.timeToHeal,
            this.timeToHealTreated,
            this.selfPatchUp,
          ],
        }),
        new RowLayout({
          content: [
            this.scar,
            this.limit,
          ],
        }),
      ],
    });
  }

  /**
   * Returns the layout of this type for presentation as a chat message. 
   * 
   * @type {Layoutable}
   * @readonly
   */
  get chatMessageLayout() {
    return new ColumnLayout({
      content: [
        new RowLayout({
          cssClass: "header",
          content: [
            this.img,
            this.name,
            this.state,
          ],
        }),
        this.description,
        this.treatmentSkill,
        this.requiredSupplies,
        this.obstaclePatchUp,
        this.obstacleTreatment,
        this.timeToHeal,
        this.timeToHealTreated,
        this.selfPatchUp,
        this.scar,
        this.limit,
      ],
    });
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
      flavor: game.i18n.localize("ambersteel.character.health.injury.singular"),
    });
  }

  /** @override */
  getChatViewModel(overrides = {}) {
    return new InjuryChatMessageViewModel({
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
  _getInjuryStateOptions() {
    return INJURY_STATES.asChoices().map((choiceOption) => {
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

ITEM_SUBTYPE.set("injury", (document) => { return new TransientInjury(document) });
