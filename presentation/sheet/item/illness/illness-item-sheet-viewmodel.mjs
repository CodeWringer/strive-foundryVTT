import { getExtenders } from "../../../../common/extender-util.mjs";
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs";
import BaseItemSheetViewModel from "../base/base-item-sheet-viewmodel.mjs";
import { DataFieldComponent } from "../base/datafield-component.mjs";

/**
 * @property {TransientIllness} document 
 */
export default class IllnessItemSheetViewModel extends BaseItemSheetViewModel {
  /** @override */
  getDataFields() {
    return [
      new DataFieldComponent({
        template: InputTextFieldViewModel.TEMPLATE,
        viewModel: new InputTextFieldViewModel({
          parent: this,
          id: "tf-duration",
          value: this.document.duration,
          onChange: (_, newValue) => {
            this.document.duration = newValue;
          },
        }),
        localizedIconToolTip: game.i18n.localize("system.character.health.duration"),
        iconClass: "ico-duration-solid",
      }),
      new DataFieldComponent({
        template: InputTextFieldViewModel.TEMPLATE,
        viewModel: new InputTextFieldViewModel({
          parent: this,
          id: "tf-treatment-skill",
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
          id: "tf-treatment",
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
  getExtenders() {
    return super.getExtenders().concat(getExtenders(IllnessItemSheetViewModel));
  }

}
