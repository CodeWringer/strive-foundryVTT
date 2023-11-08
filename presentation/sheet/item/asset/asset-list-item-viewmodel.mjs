import TransientAsset from "../../../../business/document/item/transient-asset.mjs"
import CharacterAssetSlot from "../../../../business/ruleset/asset/character-asset-slot.mjs"
import { ASSET_TAGS } from "../../../../business/tags/system-tags.mjs"
import { arrayTakeUnless } from "../../../../business/util/array-utility.mjs"
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs"
import ButtonViewModel from "../../../component/button/button-viewmodel.mjs"
import ChoiceAdapter from "../../../component/input-choice/choice-adapter.mjs"
import ChoiceOption from "../../../component/input-choice/choice-option.mjs"
import InputImageViewModel from "../../../component/input-image/input-image-viewmodel.mjs"
import InputNumberSpinnerViewModel from "../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs"
import InputRichTextViewModel from "../../../component/input-rich-text/input-rich-text-viewmodel.mjs"
import InputTagsViewModel from "../../../component/input-tags/input-tags-viewmodel.mjs"
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs"
import DynamicInputDefinition from "../../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs"
import DynamicInputDialog from "../../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs"
import { DYNAMIC_INPUT_TYPES } from "../../../dialog/dynamic-input-dialog/dynamic-input-types.mjs"
import { TEMPLATES } from "../../../templatePreloader.mjs"
import ViewModelFactory from "../../../view-model/view-model-factory.mjs"
import ViewModel from "../../../view-model/view-model.mjs"

/**
 * @property {Boolean} hideTakeAsset
 * @property {Boolean} hideDropAsset
 * 
 * @extends ViewModel
 */
export default class AssetListItemViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ASSET_LIST_ITEM; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideTakeAsset() {
    return this.document.isEquipped === true;
  }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideDropAsset() {
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

    this.document = args.document;
    this.contextTemplate = args.contextTemplate ?? "item-list-item";

    const thiz = this;
    const factory = new ViewModelFactory();
    this._actor = this.document.owningDocument;

    this.vmImg = new InputImageViewModel({
      parent: thiz,
      id: "vmImg",
      value: thiz.document.img,
      onChange: (_, newValue) => {
        thiz.document.img = newValue;
      },
    });
    this.vmTfName = new InputTextFieldViewModel({
      parent: thiz,
      id: "vmTfName",
      value: thiz.document.name,
      onChange: (_, newValue) => {
        thiz.document.name = newValue;
      },
      placeholder: game.i18n.localize("ambersteel.general.name"),
    });
    this.vmBtnSendToChat = factory.createVmBtnSendToChat({
      parent: thiz,
      id: "vmBtnSendToChat",
      target: thiz.document,
      isEditable: thiz.isEditable || thiz.isGM,
    });
    this.vmBtnTakeAsset = new ButtonViewModel({
      id: "vmBtnTakeAsset",
      parent: this,
      isEditable: this._actor !== undefined && this.isEditable,
      iconHtml: '<i class="ambersteel-icon ico-take-item"></i>',
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
    });
    this.vmBtnDropAsset = new ButtonViewModel({
      id: "vmBtnDropAsset",
      parent: this,
      isEditable: this._actor !== undefined && this.isEditable,
      iconHtml: '<i class="ambersteel-icon ico-drop-item"></i>',
      onClick: async () => {
        // Move "down" on character sheet. 
        if (thiz.document.isEquipped === true) {
          thiz.document.moveToLuggage();
        } else if (thiz.document.isLuggage === true) {
          thiz.document.moveToProperty();
        }
      },
    });
    this.vmBtnDelete = factory.createVmBtnDelete({
      parent: thiz,
      id: "vmBtnDelete",
      target: thiz.document,
      withDialog: true,
    })
    this.vmNsQuantity = new InputNumberSpinnerViewModel({
      parent: thiz,
      id: "vmNsQuantity",
      value: thiz.document.quantity,
      onChange: (_, newValue) => {
        thiz.document.quantity = newValue;
      },
      min: 1,
    });
    this.vmNsMaxQuantity = new InputNumberSpinnerViewModel({
      parent: thiz,
      id: "vmNsMaxQuantity",
      value: thiz.document.maxQuantity,
      onChange: (_, newValue) => {
        thiz.document.maxQuantity = newValue;
      },
      min: 1,
    });
    this.vmNsBulk = new InputNumberSpinnerViewModel({
      parent: thiz,
      id: "vmNsBulk",
      value: thiz.document.bulk,
      onChange: (_, newValue) => {
        thiz.document.bulk = newValue;
      },
      min: 0,
    });
    this.vmRtDescription = new InputRichTextViewModel({
      parent: thiz,
      id: "vmRtDescription",
      value: thiz.document.description,
      onChange: (_, newValue) => {
        thiz.document.description = newValue;
      },
    });
    this.vmTags = new InputTagsViewModel({
      id: "vmTags",
      parent: this,
      systemTags: ASSET_TAGS.asArray(),
      value: this.document.tags,
      onChange: (_, newValue) => {
        this.document.tags = newValue;
      },
    });
  }

  /** @override */
  _getChildUpdates() {
    const updates = super._getChildUpdates();

    updates.set(this.vmBtnSendToChat, {
      ...updates.get(this.vmBtnSendToChat),
      isEditable: this.isEditable || this.isGM,
    });
    updates.set(this.vmBtnTakeItem, {
      ...updates.get(this.vmBtnTakeItem),
      isEditable: this._actor !== undefined && this.isEditable,
    });

    return updates;
  }

  /**
   * @returns {CharacterAssetSlot | undefined}
   * 
   * @private
   * @async
   */
  async _querySelectSlot() {
    if (this._actor === undefined) {
      throw new Error("actor is undefined");
    }

    const availableSlots = [];
    for (const group of this._actor.assets.equipmentSlotGroups) {
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
          localizedLabel: game.i18n.localize("ambersteel.character.asset.slot.label"),
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
