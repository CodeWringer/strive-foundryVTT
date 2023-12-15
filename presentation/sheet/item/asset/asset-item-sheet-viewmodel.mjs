import { ASSET_TAGS } from "../../../../business/tags/system-tags.mjs"
import ButtonTakeItemViewModel, { TAKE_ITEM_CONTEXT_TYPES } from "../../../component/button-take-item/button-take-item-viewmodel.mjs"
import InputNumberSpinnerViewModel from "../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs"
import InputTagsViewModel from "../../../component/input-tags/input-tags-viewmodel.mjs"
import BaseItemSheetViewModel from "../base/base-item-sheet-viewmodel.mjs"
import { DataFieldComponent } from "../base/datafield-component.mjs"
import { TemplatedComponent } from "../base/templated-component.mjs"

/**
 * @property {TransientAsset} document 
 */
export default class AssetItemSheetViewModel extends BaseItemSheetViewModel {
  /** @override */
  getDataFields() {
    return [
      new DataFieldComponent({
        template: InputNumberSpinnerViewModel.TEMPLATE,
        viewModel: new InputNumberSpinnerViewModel({
          parent: this,
          id: "vmQuantity",
          value: this.document.quantity,
          onChange: (_, newValue) => {
            this.document.quantity = newValue;
          },
          min: 1,
        }),
        localizedIconToolTip: game.i18n.localize("ambersteel.character.asset.quantity.label"),
        iconClass: "ico-quantity-solid",
      }),
      new DataFieldComponent({
        template: InputNumberSpinnerViewModel.TEMPLATE,
        viewModel: new InputNumberSpinnerViewModel({
          parent: this,
          id: "vmMaxQuantity",
          value: this.document.maxQuantity,
          onChange: (_, newValue) => {
            this.document.maxQuantity = newValue;
          },
          min: 1,
        }),
        localizedIconToolTip: game.i18n.localize("ambersteel.character.asset.quantity.maximum"),
        iconClass: "ico-limit-solid",
      }),
      new DataFieldComponent({
        template: InputNumberSpinnerViewModel.TEMPLATE,
        viewModel: new InputNumberSpinnerViewModel({
          parent: this,
          id: "vmBulk",
          value: this.document.bulk,
          onChange: (_, newValue) => {
            this.document.bulk = newValue;
          },
          min: 0,
        }),
        localizedIconToolTip: game.i18n.localize("ambersteel.character.asset.bulk"),
        iconClass: "ico-bulk-solid",
      }),
      new DataFieldComponent({
        template: InputTagsViewModel.TEMPLATE,
        viewModel: new InputTagsViewModel({
          id: "vmTags",
          parent: this,
          systemTags: ASSET_TAGS.asArray(),
          value: this.document.tags,
          onChange: (_, newValue) => {
            this.document.tags = newValue;
          },
        }),
        localizedIconToolTip: game.i18n.localize("ambersteel.general.tags.label"),
        iconClass: "ico-tags-solid",
        cssClass: "grid-span-2",
      }),
    ];
  }

  /** @override */
  getSecondaryHeaderButtons() {
    const inherited = super.getSecondaryHeaderButtons();
    return [
      new TemplatedComponent({
        template: ButtonTakeItemViewModel.TEMPLATE,
        viewModel: new ButtonTakeItemViewModel({
          parent: this,
          id: "vmBtnTakeItem",
          target: this.document,
          contextType: TAKE_ITEM_CONTEXT_TYPES.itemSheet
        }),
      }),
    ].concat(inherited);
  }
}
