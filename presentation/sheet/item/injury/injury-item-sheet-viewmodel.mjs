import { ExtenderUtil } from "../../../../common/extender-util.mjs";
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs";
import BaseItemSheetViewModel from "../base/base-item-sheet-viewmodel.mjs";
import { DataFieldComponent } from "../base/datafield-component.mjs";

/**
 * @property {TransientInjury} document 
 */
export default class InjuryItemSheetViewModel extends BaseItemSheetViewModel {
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
          id: "vmAutoTreatment",
          value: this.document.autoTreatment,
          onChange: (_, newValue) => {
            this.document.autoTreatment = newValue;
          },
        }),
        localizedIconToolTip: game.i18n.localize("system.character.health.autoTreatment"),
        iconClass: "ico-self-patch-up-solid",
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
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(InjuryItemSheetViewModel));
  }

}
