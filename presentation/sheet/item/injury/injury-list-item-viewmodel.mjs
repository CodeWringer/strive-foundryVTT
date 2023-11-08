import { INJURY_STATES } from "../../../../business/ruleset/health/injury-states.mjs"
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs"
import ButtonDeleteViewModel from "../../../component/button-delete/button-delete-viewmodel.mjs"
import ButtonSendToChatViewModel from "../../../component/button-send-to-chat/button-send-to-chat-viewmodel.mjs"
import StatefulChoiceOption from "../../../component/input-choice/stateful-choice-option.mjs"
import InputImageViewModel from "../../../component/input-image/input-image-viewmodel.mjs"
import InputRadioButtonGroupViewModel from "../../../component/input-radio-button-group/input-radio-button-group-viewmodel.mjs"
import InputRichTextViewModel from "../../../component/input-rich-text/input-rich-text-viewmodel.mjs"
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs"
import { TEMPLATES } from "../../../templatePreloader.mjs"
import ViewModel from "../../../view-model/view-model.mjs"

export default class InjuryListItemViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.INJURY_LIST_ITEM; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * An array of {StatefulChoiceOption}s which represent the possible states of the injury. 
   * @type {Array<StatefulChoiceOption>}
   * @readonly
   */
  get stateOptions() {
    if (this._stateOptions === undefined) {
      this._stateOptions = INJURY_STATES.asChoices().map((choiceOption) => {
        const html = `<i class="${choiceOption.icon}"></i>`;
        return new StatefulChoiceOption({
          value: choiceOption.value,
          activeHtml: html,
          tooltip: choiceOption.localizedValue,
          inactiveHtml: html,
        });
      });
    }
    
    return this._stateOptions;
  }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {TransientInjury} args.document
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);

    this.document = args.document;
    this.contextTemplate = args.contextTemplate ?? "injury-list-item";
    const thiz = this;

    this.vmImg = new InputImageViewModel({
      parent: thiz,
      id: "vmImg",
      value: thiz.document.img,
      onChange: (_, newValue) => {
        thiz.document.img = newValue;
      },
    });
    this.vmTfName = new InputTextFieldViewModel({
      parent: thiz,
      id: "vmTfName",
      value: thiz.document.name,
      onChange: (_, newValue) => {
        thiz.document.name = newValue;
      },
      placeholder: game.i18n.localize("ambersteel.general.name"),
    });
    this.vmRbgState = new InputRadioButtonGroupViewModel({
      parent: thiz,
      id: "vmRbgState",
      value: thiz.document.state,
      onChange: (_, newValue) => {
        thiz.document.state = newValue;
      },
      placeholder: game.i18n.localize("ambersteel.general.name"),
      options: thiz.stateOptions,
    });
    this.vmBtnSendToChat = new ButtonSendToChatViewModel({
      parent: thiz,
      id: "vmBtnSendToChat",
      target: thiz.document,
      isEditable: thiz.isEditable || thiz.isGM,
    });
    this.vmBtnDelete = new ButtonDeleteViewModel({
      parent: thiz,
      id: "vmBtnDelete",
      target: thiz.document,
      withDialog: true,
    })
    this.vmLimit = new InputTextFieldViewModel({
      parent: thiz,
      id: "vmNsLimit",
      value: thiz.document.limit,
      onChange: (_, newValue) => {
        thiz.document.limit = newValue;
      },
      placeholder: game.i18n.localize("ambersteel.character.health.injury.limit.placeholder"),
    });
    this.vmScar = new InputTextFieldViewModel({
      parent: thiz,
      id: "vmScar",
      value: thiz.document.scar,
      onChange: (_, newValue) => {
        thiz.document.scar = newValue;
      },
    });
    this.vmTfTimeToHeal = new InputTextFieldViewModel({
      parent: thiz,
      id: "vmTfTimeToHeal",
      value: thiz.document.timeToHeal,
      onChange: (_, newValue) => {
        thiz.document.timeToHeal = newValue;
      },
    });
    this.vmRtDescription = new InputRichTextViewModel({
      parent: thiz,
      id: "vmRtDescription",
      value: thiz.document.description,
      onChange: (_, newValue) => {
        thiz.document.description = newValue;
      },
    });
    this.vmTreatmentSkill = new InputTextFieldViewModel({
      parent: thiz,
      id: "vmTreatmentSkill",
      value: thiz.document.treatmentSkill,
      onChange: (_, newValue) => {
        thiz.document.treatmentSkill = newValue;
      },
    });
    this.vmRequiredSupplies = new InputTextFieldViewModel({
      parent: thiz,
      id: "vmRequiredSupplies",
      value: thiz.document.requiredSupplies,
      onChange: (_, newValue) => {
        thiz.document.requiredSupplies = newValue;
      },
    });
    this.vmObstaclePatchUp = new InputTextFieldViewModel({
      parent: thiz,
      id: "vmObstaclePatchUp",
      value: thiz.document.obstaclePatchUp,
      onChange: (_, newValue) => {
        thiz.document.obstaclePatchUp = newValue;
      },
    });
    this.vmObstacleTreatment = new InputTextFieldViewModel({
      parent: thiz,
      id: "vmObstacleTreatment",
      value: thiz.document.obstacleTreatment,
      onChange: (_, newValue) => {
        thiz.document.obstacleTreatment = newValue;
      },
    });
    this.vmTimeToHealTreated = new InputTextFieldViewModel({
      parent: thiz,
      id: "vmTimeToHealTreated",
      value: thiz.document.timeToHealTreated,
      onChange: (_, newValue) => {
        thiz.document.timeToHealTreated = newValue;
      },
    });
    this.vmSelfPatchUp = new InputTextFieldViewModel({
      parent: thiz,
      id: "vmSelfPatchUp",
      value: thiz.document.selfPatchUp,
      onChange: (_, newValue) => {
        thiz.document.selfPatchUp = newValue;
      },
    });
  }

  /** @override */
  _getChildUpdates() {
    const updates = super._getChildUpdates();

    updates.set(this.vmBtnSendToChat, {
      ...updates.get(this.vmBtnSendToChat),
      isEditable: this.isEditable || this.isGM,
    });

    return updates;
  }
}
