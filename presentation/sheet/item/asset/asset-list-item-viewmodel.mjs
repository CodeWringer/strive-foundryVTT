import TransientAsset from "../../../../business/document/item/transient-asset.mjs"
import CharacterAssetSlot from "../../../../business/ruleset/asset/character-asset-slot.mjs"
import { ValidationUtil } from "../../../../business/util/validation-utility.mjs"
import { ExtenderUtil } from "../../../../common/extender-util.mjs"
import ButtonViewModel from "../../../component/button/button-viewmodel.mjs"
import CompositeCurrentAndMaximumNumbersViewModel from "../../../component/composite-current-and-maximum-numbers/composite-current-and-maximum-numbers-viewmodel.mjs"
import ChoiceOption from "../../../component/input-choice/choice-option.mjs"
import InputDropDownViewModel from "../../../component/input-choice/input-dropdown/input-dropdown-viewmodel.mjs"
import InputNumberSpinnerViewModel from "../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs"
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs"
import DynamicInputDefinition from "../../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs"
import DynamicInputDialog from "../../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs"
import ViewModel from "../../../view-model/view-model.mjs"
import BaseListItemViewModel from "../base/base-list-item-viewmodel.mjs"
import { TemplatedComponent } from "../base/templated-component.mjs"

/**
 * @property {TransientAsset} document
 */
export default class AssetListItemViewModel extends BaseListItemViewModel {
  /**
   * @type {Boolean}
   * @readonly
   */
  get isEquipped() {
    return this.document.isEquipped === true;
  }

  /**
   * @type {Boolean}
   * @readonly
   */
  get isProperty() {
    return this.document.isProperty === true;
  }

  /**
   * @type {String}
   * @readonly
   */
  get quantityAndMaxTemplate() { return CompositeCurrentAndMaximumNumbersViewModel.TEMPLATE; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {TransientAsset} args.document 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["document"]);

    // Promoted content
    this.vmCompositeQuantity = new CompositeCurrentAndMaximumNumbersViewModel({
      id: "vmCompositeQuantity",
      parent: this,
      
      currentValue: this.document.quantity,
      onCurrentValueChange: (_, newValue) => {
        this.document.quantity = newValue;
      },
      currentValueMin: 0,
      currentValueToolTip: game.i18n.localize("system.character.asset.quantity.label"),

      currentValueIconClass: "ico dark ico-quantity-solid",
      currentValueIconToolTip: game.i18n.localize("system.character.asset.quantity.label"),

      maximumValue: this.document.maxQuantity,
      onMaximumValueChange: (_, newValue) => {
        this.document.maxQuantity = newValue;
      },
      maximumValueMin: 1,
      maximumValueToolTip: game.i18n.localize("system.character.asset.quantity.maximum"),

      maximumValueIconClass: "ico dark ico-limit-solid",
      maximumValueIconToolTip: game.i18n.localize("system.character.asset.quantity.maximum"),
    });
    
    this.vmQualityIcon = new ViewModel({
      id: "vmQualityIcon",
      parent: this,
      localizedToolTip: game.i18n.localize("system.character.asset.quality"),
    });
    this.vmQuality = new InputNumberSpinnerViewModel({
      parent: this,
      id: "vmQuality",
      value: this.document.quality,
      min: 0,
      localizedToolTip: game.i18n.localize("system.character.asset.quality"),
      onChange: (_, newValue) => {
        this.document.quality = newValue;
      },
    });

    this.vmBulkIcon = new ViewModel({
      id: "vmBulkIcon",
      parent: this,
      localizedToolTip: game.i18n.localize("system.character.asset.bulk"),
    });
    this.vmBulk = new InputNumberSpinnerViewModel({
      parent: this,
      id: "vmBulk",
      value: this.document.bulk,
      min: 0,
      localizedToolTip: game.i18n.localize("system.character.asset.bulk"),
      onChange: (_, newValue) => {
        this.document.bulk = newValue;
      },
    });
    
    this.vmLocation = new InputTextFieldViewModel({
      parent: this,
      id: "vmLocation",
      value: this.document.location,
      placeholder: game.i18n.localize("system.character.asset.location.placeholder"),
      onChange: (_, newValue) => {
        this.document.location = newValue;
      },
    })
  }

  /** @override */
  getPrimaryHeaderButtons() {
    const thiz = this;

    let takeLabel = "system.character.asset.take";
    if (this.document.isLuggage) {
      takeLabel = "system.character.asset.takeToEquipped";
    } else if (this.document.isProperty) {
      takeLabel = "system.character.asset.takeToLuggage";
    }

    let dropLabel = "system.character.asset.drop";
    if (this.document.isEquipped) {
      dropLabel = "system.character.asset.dropToLuggage";
    } else if (this.document.isLuggage) {
      dropLabel = "system.character.asset.dropToProperty";
    }

    return super.getPrimaryHeaderButtons().concat([
      new TemplatedComponent({
        template: ButtonViewModel.TEMPLATE,
        viewModel: new ButtonViewModel({
          id: "vmBtnTakeAsset",
          parent: this,
          isEditable: this.getRootOwningDocument() !== undefined && this.isEditable,
          iconHtml: '<i class="ico dark interactible ico-take-item"></i>',
          localizedToolTip: game.i18n.localize(takeLabel),
          onClick: async () => {
            // Move "up" on character sheet. 
            if (thiz.document.isProperty === true) {
              thiz.document.moveToLuggage();
            } else if (thiz.document.isLuggage === true) {
              const slot = await this._querySelectSlot();
              if (slot !== undefined) {
                thiz.document.moveToAssetSlot(slot);
              }
            }
          },
        }),
        isHidden: this.isEquipped,
      }),
      new TemplatedComponent({
        template: ButtonViewModel.TEMPLATE,
        viewModel: new ButtonViewModel({
          id: "vmBtnDropAsset",
          parent: this,
          isEditable: this.getRootOwningDocument() !== undefined && this.isEditable,
          iconHtml: '<i class="ico dark interactible ico-drop-item"></i>',
          localizedToolTip: game.i18n.localize(dropLabel),
          onClick: async () => {
            // Move "down" on character sheet. 
            if (thiz.document.isEquipped === true) {
              thiz.document.moveToLuggage();
            } else if (thiz.document.isLuggage === true) {
              thiz.document.moveToProperty();
            }
          },
        }),
        isHidden: this.isProperty,
      }),
    ]);
  }

  /** @override */
  getPromotedContentTemplate() {
    return new TemplatedComponent({
      template: game.strive.const.TEMPLATES.ASSET_LIST_ITEM_PROMOTED_CONTENT,
      viewModel: this,
    });
  }

  /**
   * @returns {CharacterAssetSlot | undefined}
   * 
   * @private
   * @async
   */
  async _querySelectSlot() {
    const rootOwner = this.getRootOwningDocument();
    if (rootOwner === undefined) {
      throw new Error("root owner is undefined");
    } else if (rootOwner.documentName !== "Actor") {
      throw new Error("root owner is not an actor");
    }

    const availableSlots = [];
    for (const group of rootOwner.assets.equipmentSlotGroups) {
      for (const slot of group.slots) {
        availableSlots.push(slot);
      }
    }

    const availableSlotChoices = availableSlots.map(slot => {
      return new ChoiceOption({
        value: slot.id,
        localizedValue: slot.name,
      });
    });

    const inputSlots = "inputSlots";

    const dialog = await new DynamicInputDialog({
      easyDismissal: true,
      inputDefinitions: [
        new DynamicInputDefinition({
          name: inputSlots,
          localizedLabel: game.i18n.localize("system.character.asset.slot.label"),
          template: InputDropDownViewModel.TEMPLATE,
          viewModelFactory: (id, parent, overrides) => new InputDropDownViewModel({
            id: id,
            parent: parent,
            options: availableSlotChoices,
            value: availableSlotChoices.length > 0 ? availableSlotChoices[0] : undefined,
            ...overrides,
          }),
        }),
      ],
    }).renderAndAwait(true);

    if (dialog.confirmed !== true) return undefined;

    const selectedId = dialog[inputSlots].value;
    const assetSlot = availableSlots.find(it => it.id === selectedId);

    return assetSlot;
  }
  
  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(AssetListItemViewModel));
  }

}
