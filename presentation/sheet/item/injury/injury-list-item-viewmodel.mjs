import { INJURY_STATES } from "../../../../business/ruleset/health/injury-states.mjs"
import StatefulChoiceOption from "../../../component/input-choice/stateful-choice-option.mjs"
import InputRadioButtonGroupViewModel from "../../../component/input-choice/input-radio-button-group/input-radio-button-group-viewmodel.mjs"
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs"
import BaseListItemViewModel from "../base/base-list-item-viewmodel.mjs"
import { DataFieldComponent } from "../base/datafield-component.mjs"
import { TemplatedComponent } from "../base/templated-component.mjs"

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
        template: InputTextFieldViewModel.TEMPLATE,
        viewModel: new InputTextFieldViewModel({
          parent: this,
          id: "vmTreatmentSkill",
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
          id: "vmRequiredSupplies",
          value: this.document.requiredSupplies,
          onChange: (_, newValue) => {
            this.document.requiredSupplies = newValue;
          },
        }),
        localizedIconToolTip: game.i18n.localize("system.character.health.requiredSupplies"),
        iconClass: "ico-medical-supplies-solid",
      }),
      new DataFieldComponent({
        template: InputTextFieldViewModel.TEMPLATE,
        viewModel: new InputTextFieldViewModel({
          parent: this,
          id: "vmObstaclePatchUp",
          value: this.document.obstaclePatchUp,
          onChange: (_, newValue) => {
            this.document.obstaclePatchUp = newValue;
          },
        }),
        localizedIconToolTip: game.i18n.localize("system.character.health.obstaclePatchUp"),
        iconClass: "ico-obstacle-patch-up-solid",
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
        localizedIconToolTip: game.i18n.localize("system.character.health.obstacleTreatment"),
        iconClass: "ico-obstacle-treatment-solid",
      }),
      new DataFieldComponent({
        template: InputTextFieldViewModel.TEMPLATE,
        viewModel: new InputTextFieldViewModel({
          parent: this,
          id: "vmTfTimeToHeal",
          value: this.document.timeToHeal,
          onChange: (_, newValue) => {
            this.document.timeToHeal = newValue;
          },
        }),
        localizedIconToolTip: game.i18n.localize("system.character.health.timeToHeal"),
        iconClass: "ico-time-to-heal-solid",
      }),
      new DataFieldComponent({
        template: InputTextFieldViewModel.TEMPLATE,
        viewModel: new InputTextFieldViewModel({
          parent: this,
          id: "vmTimeToHealTreated",
          value: this.document.timeToHealTreated,
          onChange: (_, newValue) => {
            this.document.timeToHealTreated = newValue;
          },
        }),
        localizedIconToolTip: game.i18n.localize("system.character.health.timeToHealTreated"),
        iconClass: "ico-time-to-heal-treated-solid",
      }),
      new DataFieldComponent({
        template: InputTextFieldViewModel.TEMPLATE,
        viewModel: new InputTextFieldViewModel({
          parent: this,
          id: "vmSelfPatchUp",
          value: this.document.selfPatchUp,
          onChange: (_, newValue) => {
            this.document.selfPatchUp = newValue;
          },
        }),
        localizedIconToolTip: game.i18n.localize("system.character.health.selfPatchUp"),
        iconClass: "ico-self-patch-up-solid",
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
        localizedIconToolTip: game.i18n.localize("system.character.health.scar.singular"),
        iconClass: "ico-scar-solid",
      }),
      new DataFieldComponent({
        template: InputTextFieldViewModel.TEMPLATE,
        viewModel: new InputTextFieldViewModel({
          parent: this,
          id: "vmNsLimit",
          value: this.document.limit,
          onChange: (_, newValue) => {
            this.document.limit = newValue;
          },
          placeholder: game.i18n.localize("system.character.health.injury.limit.placeholder"),
        }),
        localizedIconToolTip: game.i18n.localize("system.character.health.injury.limit.label"),
        iconClass: "ico-limit-solid",
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
}
