import { ExtenderUtil } from "../../../../common/extender-util.mjs";
import InputNumberSpinnerViewModel from "../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import BaseItemSheetViewModel from "../base/base-item-sheet-viewmodel.mjs";
import { DataFieldComponent } from "../base/datafield-component.mjs";

/**
 * @property {TransientFateCard} document 
 */
export default class FateCardItemSheetViewModel extends BaseItemSheetViewModel {
  /** @override */
  getDataFields() {
    return [
      new DataFieldComponent({
        template: InputNumberSpinnerViewModel.TEMPLATE,
        viewModel: new InputNumberSpinnerViewModel({
          parent: this,
          id: "vmNsMifp",
          value: this.document.cost.miFP,
          onChange: (_, newValue) => {
            this.document.cost.miFP = newValue;
          },
          min: 0,
        }),
        localizedIconToolTip: game.i18n.localize("system.character.driverSystem.fateSystem.fatePoints.minor.label"),
        localizedLabel: game.i18n.localize("system.character.driverSystem.fateSystem.fatePoints.minor.abbreviation"),
      }),
      new DataFieldComponent({
        template: InputNumberSpinnerViewModel.TEMPLATE,
        viewModel: new InputNumberSpinnerViewModel({
          parent: this,
          id: "vmNsMafp",
          value: this.document.cost.maFP,
          onChange: (_, newValue) => {
            this.document.cost.maFP = newValue;
          },
          min: 0,
        }),
        localizedIconToolTip: game.i18n.localize("system.character.driverSystem.fateSystem.fatePoints.major.label"),
        localizedLabel: game.i18n.localize("system.character.driverSystem.fateSystem.fatePoints.major.abbreviation"),
      }),
      new DataFieldComponent({
        template: InputNumberSpinnerViewModel.TEMPLATE,
        viewModel: new InputNumberSpinnerViewModel({
          parent: this,
          id: "vmNsAfp",
          value: this.document.cost.AFP,
          onChange: (_, newValue) => {
            this.document.cost.AFP = newValue;
          },
          min: 0,
        }),
        localizedIconToolTip: game.i18n.localize("system.character.driverSystem.fateSystem.fatePoints.ambition.label"),
        localizedLabel: game.i18n.localize("system.character.driverSystem.fateSystem.fatePoints.ambition.abbreviation"),
      }),
    ];
  }
  
  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(FateCardItemSheetViewModel));
  }

}
