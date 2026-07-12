import TransientMomentumAction from "../../../../business/model/document/item/transient-momentum-action.mjs"
import { ExtenderUtil } from "../../../../common/util/extender-util.mjs"
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs"
import InputImageViewModel from "../../../component/input-image/input-image-viewmodel.mjs"
import InputNumberSpinnerViewModel from "../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs"
import InputRichTextViewModel from "../../../component/input-rich-text/input-rich-text-viewmodel.mjs"
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs"
import BaseListItemViewModel from "../base/base-list-item-viewmodel.mjs"
import { DataFieldComponent } from "../base/datafield-component.mjs"
import { TemplatedComponent } from "../base/templated-component.mjs"

/**
 * @property {TransientMomentumAction} document
 */
export default class MomentumActionListItemViewModel extends BaseListItemViewModel {
  /**@override */
  get showDescription() { return false; }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {TransientMomentumAction} args.document 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {String | undefined} args.visGroupId
   */
  constructor(args = {}) {
    super({
      ...args,
      title: args.document.nameForDisplay,
    });
    ValidationUtil.validateOrThrow(args, ["document"]);

    this.vmImgHeroic = new InputImageViewModel({
      id: "vmImgHeroic",
      parent: this,
      value: this.document.imgHeroic,
      localizedToolTip: game.i18n.localize("system.combat.momentum.imgHeroic"),
      onChange: (_, newValue) => {
        this.document.imgHeroic = newValue;
      },
    });
    this.vmNameHeroic = new InputTextFieldViewModel({
      id: "vmNameHeroic",
      parent: this,
      value: this.document.nameHeroic,
      localizedToolTip: game.i18n.localize("system.combat.momentum.nameHeroic"),
      onChange: (_, newValue) => {
        this.document.nameHeroic = newValue;
      },
    });
    this.vmDescriptionHeroic = new InputRichTextViewModel({
      id: "vmDescriptionHeroic",
      parent: this,
      value: this.document.descriptionHeroic,
      localizedToolTip: game.i18n.localize("system.combat.momentum.descriptionHeroic"),
      onChange: (_, newValue) => {
        this.document.descriptionHeroic = newValue;
      },
    });

    this.vmImgDesperate = new InputImageViewModel({
      id: "vmImgDesperate",
      parent: this,
      value: this.document.imgDesperate,
      localizedToolTip: game.i18n.localize("system.combat.momentum.imgDesperate"),
      onChange: (_, newValue) => {
        this.document.imgDesperate = newValue;
      },
    });
    this.vmNameDesperate = new InputTextFieldViewModel({
      id: "vmNameDesperate",
      parent: this,
      value: this.document.nameDesperate,
      localizedToolTip: game.i18n.localize("system.combat.momentum.nameDesperate"),
      onChange: (_, newValue) => {
        this.document.nameDesperate = newValue;
      },
    });
    this.vmDescriptionDesperate = new InputRichTextViewModel({
      id: "vmDescriptionDesperate",
      parent: this,
      value: this.document.descriptionDesperate,
      localizedToolTip: game.i18n.localize("system.combat.momentum.descriptionDesperate"),
      onChange: (_, newValue) => {
        this.document.descriptionDesperate = newValue;
      },
    });
  }

  /** @override */
  getDataFields() {
    return [
      new DataFieldComponent({
        template: InputNumberSpinnerViewModel.TEMPLATE,
        viewModel: new InputNumberSpinnerViewModel({
          id: "vmMomentumShiftHeroic",
          parent: this,
          value: this.document.momentumShiftHeroic,
          onChange: (_, newValue) => {
            this.document.momentumShiftHeroic = newValue;
          },
        }),
        localizedToolTip: game.i18n.localize("system.combat.momentum.shiftHeroic"),
        iconClass: this.document.momentumShiftHeroic >= 0 ? "ico-momentum-shift-heroism-solid" : "ico-momentum-shift-desperation-solid",
      }),
      new DataFieldComponent({
        template: InputNumberSpinnerViewModel.TEMPLATE,
        viewModel: new InputNumberSpinnerViewModel({
          id: "vmMomentumShiftDesperate",
          parent: this,
          value: this.document.momentumShiftDesperate,
          onChange: (_, newValue) => {
            this.document.momentumShiftDesperate = newValue;
          },
        }),
        localizedToolTip: game.i18n.localize("system.combat.momentum.shiftDesperate"),
        iconClass: this.document.momentumShiftDesperate >= 0 ? "ico-momentum-shift-heroism-solid" : "ico-momentum-shift-desperation-solid",
      }),
    ];
  }
  
  /** @override */
  getAdditionalContent() {
    return new TemplatedComponent({
      template: game.strive.const.TEMPLATES.MOMENTUM_ACTION_LIST_ITEM_EXTRA_CONTENT,
      viewModel: this,
    });
  }

  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(MomentumActionListItemViewModel));
  }

}
