import { ILLNESS_STATES } from "../../../../business/ruleset/health/illness-states.mjs"
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
import BaseListItemViewModel, { DataFieldComponent, TemplatedComponent } from "../base/base-list-item-viewmodel.mjs"

/**
 * @property {TransientIllness} document
 */
export default class IllnessListItemViewModel extends BaseListItemViewModel {
  /**
   * An array of {StatefulChoiceOption}s which represent the possible states of the illness. 
   * @type {Array<StatefulChoiceOption>}
   * @readonly
   */
  get stateOptions() {
    if (this._stateOptions === undefined) {
      this._stateOptions = ILLNESS_STATES.asChoices().map((choiceOption) => {
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

  constructor(args = {}) {
    super(args);

    this.vmDuration = new InputTextFieldViewModel({
      parent: this,
      id: "vmDuration",
      value: this.document.duration,
      onChange: (_, newValue) => {
        this.document.duration = newValue;
      },
    });
  }

  /** @override */
  getDataFields() {
    return [
      new DataFieldComponent({
        template: InputTextFieldViewModel.TEMPLATE,
        viewModel: new InputTextFieldViewModel({
          parent: this,
          id: "vmTfTreatmentSkill",
          value: this.document.treatmentSkill,
          onChange: (_, newValue) => {
            this.document.treatmentSkill = newValue;
          },
        }),
        localizedIconToolTip: game.i18n.localize("ambersteel.character.health.treatmentSkill"),
        iconClass: "",
      }),
      new DataFieldComponent({
        template: InputTextFieldViewModel.TEMPLATE,
        viewModel: new InputTextFieldViewModel({
          parent: this,
          id: "vmTfTreatment",
          value: this.document.treatment,
          onChange: (_, newValue) => {
            this.document.treatment = newValue;
          },
        }),
        localizedIconToolTip: game.i18n.localize("ambersteel.character.health.treatment"),
        iconClass: "",
      }),
    ];
  }

  /** @override */
  getSecondaryHeaderButtons() {
    return super.getSecondaryHeaderButtons().concat([
      new TemplatedComponent({
        template: InputRadioButtonGroupViewModel.TEMPLATE,
        viewModel: new InputRadioButtonGroupViewModel({
          parent: this,
          id: "vmRbgState",
          value: this.document.state,
          onChange: (_, newValue) => {
            this.document.state = newValue;
          },
          options: this.stateOptions,
        }),
      }),
    ]);
  }
  
  /** @override */
  getAdditionalHeaderContent() {
    return new TemplatedComponent({
      template: TEMPLATES.ILLNESS_LIST_ITEM_EXTRA_HEADER,
      viewModel: this,
    });
  }
}
