import { INJURY_STATES } from "../../../../business/ruleset/health/injury-states.mjs"
import StatefulChoiceOption from "../../../component/input-choice/stateful-choice-option.mjs"
import InputRadioButtonGroupViewModel from "../../../component/input-choice/input-radio-button-group/input-radio-button-group-viewmodel.mjs"
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs"
import BaseListItemViewModel from "../base/base-list-item-viewmodel.mjs"
import { DataFieldComponent } from "../base/datafield-component.mjs"
import { TemplatedComponent } from "../base/templated-component.mjs"
import { ExtenderUtil } from "../../../../common/util/extender-util.mjs"
import CompositeCurrentAndMaximumNumbersViewModel from "../../../component/composite-current-and-maximum-numbers/composite-current-and-maximum-numbers-viewmodel.mjs"

/**
 * @property {TransientInjury} document
 */
export default class InjuryListItemViewModel extends BaseListItemViewModel {
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

  /** @override */
  getDataFields() {
    return [
      new DataFieldComponent({
        template: CompositeCurrentAndMaximumNumbersViewModel.TEMPLATE,
        viewModel: new CompositeCurrentAndMaximumNumbersViewModel({
          id: "treatmentTime",
          parent: this,
          currentValue: this.document.timeToHealElapsed,
          currentValueMin: 0,
          currentValueToolTip: game.i18n.localize("system.character.health.healingTime.current"),
          currentValueIconClass: "ico dark ico-time-to-heal-solid",
          maximumValue: this.document.timeToHeal,
          maximumValueMin: 0,
          maximumValueToolTip: this.showReminders 
            ? `${game.i18n.localize("system.character.health.healingTime.total")}<br>${game.i18n.localize("system.character.health.healingTime.totalReminder")}`
            : game.i18n.localize("system.character.health.healingTime.total"),
          iconClass: "ico-obstacle-solid",
          onCurrentValueChange: (_, newValue) => {
            this.document.timeToHealElapsed = newValue;
          },
          onMaximumValueChange: (_, newValue) => {
            this.document.timeToHeal = newValue;
          },
        }),
      }),
      new DataFieldComponent({
        template: InputTextFieldViewModel.TEMPLATE,
        viewModel: new InputTextFieldViewModel({
          parent: this,
          id: "lastTreatmentTime",
          value: this.document.lastTreatmentTime,
          onChange: (_, newValue) => {
            this.document.lastTreatmentTime = newValue;
          },
        }),
        localizedToolTip: game.i18n.localize("system.character.health.lastTreatmentTime"),
        iconClass: "ico-time-to-heal-treated-solid",
      }),
      new DataFieldComponent({
        template: InputTextFieldViewModel.TEMPLATE,
        viewModel: new InputTextFieldViewModel({
          parent: this,
          id: "vmTreatmentSkill",
          value: this.document.treatmentSkill,
          onChange: (_, newValue) => {
            this.document.treatmentSkill = newValue;
          },
        }),
        localizedToolTip: game.i18n.localize("system.character.health.treatmentSkill.treatmentSkill"),
        iconClass: "ico-skill-solid",
      }),
      new DataFieldComponent({
        template: InputTextFieldViewModel.TEMPLATE,
        viewModel: new InputTextFieldViewModel({
          parent: this,
          id: "vmRequiredSupplies",
          value: this.document.requiredSupplies,
          onChange: (_, newValue) => {
            this.document.requiredSupplies = newValue;
          },
        }),
        localizedToolTip: game.i18n.localize("system.character.health.requiredSupplies"),
        iconClass: "ico-medical-supplies-solid",
      }),
      new DataFieldComponent({
        template: InputTextFieldViewModel.TEMPLATE,
        viewModel: new InputTextFieldViewModel({
          parent: this,
          id: "vmObstacleTreatment",
          value: this.document.obstacleTreatment,
          onChange: (_, newValue) => {
            this.document.obstacleTreatment = newValue;
          },
        }),
        localizedToolTip: this.showReminders 
          ? `${game.i18n.localize("system.character.health.obstacleTreatment.obstacleTreatment")}<br>${game.i18n.localize("system.character.health.obstacleTreatment.reminder")}`
          : game.i18n.localize("system.character.health.obstacleTreatment.obstacleTreatment"),
        iconClass: "ico-obstacle-solid",
      }),
      new DataFieldComponent({
        template: InputTextFieldViewModel.TEMPLATE,
        viewModel: new InputTextFieldViewModel({
          parent: this,
          id: "vmScar",
          value: this.document.scar,
          onChange: (_, newValue) => {
            this.document.scar = newValue;
          },
        }),
        localizedToolTip: game.i18n.localize("system.character.health.scar.singular"),
        iconClass: "ico-scar-solid",
      }),
    ];
  }

  /** @override */
  getHeaderButtons() {
    return [
      new TemplatedComponent({
        template: InputRadioButtonGroupViewModel.TEMPLATE,
        viewModel: new InputRadioButtonGroupViewModel({
          parent: this,
          id: "vmRbgState",
          options: this.stateOptions,
          value: this.stateOptions.find(it => it.value === this.document.state.name),
          onChange: (_, newValue) => {
            this.document.state = INJURY_STATES[newValue.value];
          },
        }),
      }),
    ].concat(super.getHeaderButtons());
  }
  
  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(InjuryListItemViewModel));
  }

}
