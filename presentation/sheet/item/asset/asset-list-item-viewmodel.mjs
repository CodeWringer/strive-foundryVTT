import TransientAsset from "../../../../business/document/item/transient-asset.mjs"
import CharacterAssetSlot from "../../../../business/ruleset/asset/character-asset-slot.mjs"
import { ASSET_TAGS } from "../../../../business/tags/system-tags.mjs"
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs"
import ButtonViewModel from "../../../component/button/button-viewmodel.mjs"
import ChoiceAdapter from "../../../component/input-choice/choice-adapter.mjs"
import ChoiceOption from "../../../component/input-choice/choice-option.mjs"
import InputNumberSpinnerViewModel from "../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs"
import InputTagsViewModel from "../../../component/input-tags/input-tags-viewmodel.mjs"
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs"
import DynamicInputDefinition from "../../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs"
import DynamicInputDialog from "../../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs"
import { DYNAMIC_INPUT_TYPES } from "../../../dialog/dynamic-input-dialog/dynamic-input-types.mjs"
import { TEMPLATES } from "../../../templatePreloader.mjs"
import ViewModel from "../../../view-model/view-model.mjs"
import BaseListItemViewModel from "../base/base-list-item-viewmodel.mjs"
import { DataFieldComponent } from "../base/datafield-component.mjs"
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
    validateOrThrow(args, ["document"]);

    this.vmQuantity = new InputNumberSpinnerViewModel({
      parent: this,
      id: "vmQuantity",
      value: this.document.quantity,
      onChange: (_, newValue) => {
        this.document.quantity = newValue;
      },
      min: 1,
    });
    this.vmMaxQuantity = new InputNumberSpinnerViewModel({
      parent: this,
      id: "vmMaxQuantity",
      value: this.document.maxQuantity,
      onChange: (_, newValue) => {
        this.document.maxQuantity = newValue;
      },
      min: 1,
    });
    this.vmBulk = new InputNumberSpinnerViewModel({
      parent: this,
      id: "vmBulk",
      value: this.document.bulk,
      onChange: (_, newValue) => {
        this.document.bulk = newValue;
      },
      min: 0,
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
  getDataFields() {
    return [
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
        localizedIconToolTip: game.i18n.localize("system.general.tags.label"),
        iconClass: "ico-tags-solid",
        cssClass: "grid-span-2",
      }),
    ];
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
  getAdditionalHeaderContent() {
    return new TemplatedComponent({
      template: TEMPLATES.ASSET_LIST_ITEM_EXTRA_HEADER,
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

    const availableSlotChoices = [];
    const adapter = new ChoiceAdapter({
      // obj: CharacterAssetSlot
      toChoiceOption: (obj) => {
        return new ChoiceOption({
          value: obj.id,
          localizedValue: obj.name,
        });
      },
      fromChoiceOption: (choice) => {
        return availableSlots.find(it => it.id === choice.value);
      },
    })
    for (const slot of availableSlots) {
      availableSlotChoices.push(adapter.toChoiceOption(slot));
    }

    const inputSlots = "inputSlots";

    const dialog = await new DynamicInputDialog({
      easyDismissal: true,
      inputDefinitions: [
        new DynamicInputDefinition({
          type: DYNAMIC_INPUT_TYPES.DROP_DOWN,
          name: inputSlots,
          localizedLabel: game.i18n.localize("system.character.asset.slot.label"),
          specificArgs: {
            options: availableSlotChoices,
            adapter: adapter,
          },
          required: true,
          defaultValue: availableSlots[0].id,
        }),
      ],
    }).renderAndAwait(true);

    if (dialog.confirmed !== true) return undefined;

    const selectedId = dialog[inputSlots];
    const assetSlot = availableSlots.find(it => it.id === selectedId);

    return assetSlot;
  }
}
