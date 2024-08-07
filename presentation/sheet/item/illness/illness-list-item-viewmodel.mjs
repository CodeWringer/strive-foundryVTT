import { ILLNESS_STATES } from "../../../../business/ruleset/health/illness-states.mjs"
import StatefulChoiceOption from "../../../component/input-choice/stateful-choice-option.mjs"
import InputRadioButtonGroupViewModel from "../../../component/input-choice/input-radio-button-group/input-radio-button-group-viewmodel.mjs"
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs"
import BaseListItemViewModel from "../base/base-list-item-viewmodel.mjs"
import { DataFieldComponent } from "../base/datafield-component.mjs"
import { TemplatedComponent } from "../base/templated-component.mjs"
import { getExtenders } from "../../../../common/extender-util.mjs"

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
        localizedIconToolTip: game.i18n.localize("system.character.health.treatmentSkill"),
        iconClass: "ico-skill-solid",
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
        localizedIconToolTip: game.i18n.localize("system.character.health.treatment"),
        iconClass: "ico-treatment-solid",
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
          options: this.stateOptions,
          value: this.stateOptions.find(it => it.value === this.document.state),
          onChange: (_, newValue) => {
            this.document.state = newValue.value;
          },
        }),
      }),
    ]);
  }
  
  /** @override */
  getAdditionalHeaderContent() {
    return new TemplatedComponent({
      template: game.strive.const.TEMPLATES.ILLNESS_LIST_ITEM_EXTRA_HEADER,
      viewModel: this,
    });
  }
  
  /** @override */
  getExtenders() {
    return super.getExtenders().concat(getExtenders(IllnessListItemViewModel));
  }

}
