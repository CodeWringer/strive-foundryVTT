import { ASSET_PROPERTIES } from "../../../../business/document/item/item-properties.mjs"
import CharacterAssetSlot from "../../../../business/ruleset/asset/character-asset-slot.mjs"
import { arrayTakeUnless } from "../../../../business/util/array-utility.mjs"
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs"
import { TAKE_ITEM_CONTEXT_TYPES } from "../../../component/button-take-item/button-take-item-viewmodel.mjs"
import ButtonViewModel from "../../../component/button/button-viewmodel.mjs"
import ChoiceAdapter from "../../../component/input-choice/choice-adapter.mjs"
import ChoiceOption from "../../../component/input-choice/choice-option.mjs"
import InputPropertiesViewModel from "../../../component/input-properties/input-properties-viewmodel.mjs"
import DynamicInputDefinition from "../../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs"
import DynamicInputDialog from "../../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs"
import { DYNAMIC_INPUT_TYPES } from "../../../dialog/dynamic-input-dialog/dynamic-input-types.mjs"
import { TEMPLATES } from "../../../templatePreloader.mjs"
import ViewModelFactory from "../../../view-model/view-model-factory.mjs"
import ViewModel from "../../../view-model/view-model.mjs"

/**
 * @property {Boolean} assetIsProperty
 * * Read-only. 
 * @property {Boolean} assetIsLuggage
 * * Read-only. 
 * @property {Boolean} assetIsEquipped
 * * Read-only. 
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
  get assetIsProperty() {
    if (this.document.owningDocument === undefined) {
      return false;
    } else {
      return this.document.owningDocument.assets.property.find(it => it.id === this.document.id) !== undefined;
    }
  }

  /**
   * @type {Boolean}
   * @readonly
   */
  get assetIsLuggage() {
    if (this.document.owningDocument === undefined) {
      return false;
    } else {
      return this.document.owningDocument.assets.luggage.find(it => it.id === this.document.id) !== undefined;
    }
  }

  /**
   * @type {Boolean}
   * @readonly
   */
  get assetIsEquipped() {
    if (this.document.owningDocument === undefined) {
      return false;
    } else {
      return this.document.owningDocument.assets.equipment.find(it => it.id === this.document.id) !== undefined;
    }
  }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideTakeAsset() {
    return this.assetIsEquipped === true;
  }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideDropAsset() {
    return this.assetIsProperty === true;
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
    const actor = this.document.owningDocument;

    this.vmImg = factory.createVmImg({
      parent: thiz,
      id: "vmImg",
      propertyOwner: thiz.document,
      propertyPath: "img",
    });
    this.vmTfName = factory.createVmTextField({
      parent: thiz,
      id: "vmTfName",
      propertyOwner: thiz.document,
      propertyPath: "name",
      placeholder: "ambersteel.general.name",
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
      isEditable: actor !== undefined && this.isEditable,
      onClick: async () => {
        // Move "up" on character sheet. 
        if (actor === undefined) return;

        if (thiz.assetIsProperty === true) {
          // Assign asset to luggage list. 
          const newLuggage = actor.document.system.assets.luggage.concat([this.document.id]);
          actor.updateByPath("system.assets.luggage", newLuggage);

          // Remove asset from property list. 
          const propertyIds = arrayTakeUnless(actor.document.system.assets.property, (element) => {
            return element === this.document.id;
          });
          actor.updateByPath("system.assets.property", propertyIds);
        } else if (thiz.assetIsLuggage === true) {
          // Assign asset to slot. 
          const slot = await this._querySelectSlot();
          if (slot === undefined) return; // User canceled. 
          slot.alottedId = this.document.id;

          // Remove asset from luggage list. 
          const luggageIds = arrayTakeUnless(actor.document.system.assets.luggage, (element) => {
            return element === this.document.id;
          });
          actor.updateByPath("system.assets.luggage", luggageIds);
        }
      },
    });
    this.vmBtnDropAsset = new ButtonViewModel({
      id: "vmBtnDropAsset",
      parent: this,
      isEditable: actor !== undefined && this.isEditable,
      onClick: async () => {
        // Move "down" on character sheet. 
        if (actor === undefined) return;

        if (thiz.assetIsEquipped === true) {
          // Remove from slot. 
          const slot = this._getAssetSlot(this.document.id);
          if (slot === undefined) {
            throw new Error("Asset slot is undefined");
          }
          slot.alottedId = null;

          // Assign to luggage list. 
          const newLuggage = actor.document.system.assets.luggage.concat([this.document.id]);
          actor.updateByPath("system.assets.luggage", newLuggage);
        } else if (thiz.assetIsLuggage === true) {
          // Assign asset to property list. 
          const newPropertyList = actor.document.system.assets.property.concat([this.document.id]);
          actor.updateByPath("system.assets.property", newPropertyList);

          // Remove asset from luggage list. 
          const luggageIds = arrayTakeUnless(actor.document.system.assets.luggage, (element) => {
            return element === this.document.id;
          });
          actor.updateByPath("system.assets.luggage", luggageIds);
        }
      },
    });
    this.vmBtnDelete = factory.createVmBtnDelete({
      parent: thiz,
      id: "vmBtnDelete",
      target: thiz.document,
      withDialog: true,
    })
    this.vmNsQuantity = factory.createVmNumberSpinner({
      parent: thiz,
      id: "vmNsQuantity",
      propertyOwner: thiz.document,
      propertyPath: "quantity",
      min: 1,
    });
    this.vmNsMaxQuantity = factory.createVmNumberSpinner({
      parent: thiz,
      id: "vmNsMaxQuantity",
      propertyOwner: thiz.document,
      propertyPath: "maxQuantity",
      min: 1,
    });
    this.vmNsBulk = factory.createVmNumberSpinner({
      parent: thiz,
      id: "vmNsBulk",
      propertyOwner: thiz.document,
      propertyPath: "bulk",
      min: 1,
    });
    this.vmRtDescription = factory.createVmRichText({
      parent: thiz,
      id: "vmRtDescription",
      propertyOwner: thiz.document,
      propertyPath: "description",
    });
    this.vmProperties = new InputPropertiesViewModel({
      id: "vmProperties",
      parent: this,
      propertyPath: "properties",
      propertyOwner: this.document,
      isEditable: this.isEditable,
      systemProperties: ASSET_PROPERTIES.asArray,
    });
  }

  /** @override */
  _getChildUpdates() {
    const updates = super._getChildUpdates();
    const actor = this.document.owningDocument;

    updates.set(this.vmBtnSendToChat, {
      ...updates.get(this.vmBtnSendToChat),
      isEditable: this.isEditable || this.isGM,
    });
    updates.set(this.vmBtnTakeItem, {
      ...updates.get(this.vmBtnTakeItem),
      isEditable: actor !== undefined && this.isEditable,
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
    if (this.document.owningDocument === undefined) {
      throw new Error("actor is undefined");
    }

    const availableSlots = [];
    const owningDocument = this.document.owningDocument;
    for (const group of owningDocument.assets.equipmentSlotGroups) {
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
          localizableLabel: "ambersteel.character.asset.slot.label",
          specificArgs: {
            options: availableSlotChoices,
            adapter: adapter,
          },
          required: true,
          defaultValue: availableSlots[0],
        }),
      ],
    }).renderAndAwait(true);

    if (dialog.confirmed !== true) return undefined;

    return dialog[inputSlots];
  }

  /**
   * Returns the asset slot the asset with the given id is currently assigned to. 
   * 
   * @param {String} assetId 
   * 
   * @returns {CharacterAssetSlot | undefined}
   * 
   * @private
   * 
   * @throws If the owningDocument is undefined. 
   */
  _getAssetSlot(assetId) {
    if (this.document.owningDocument === undefined) {
      throw new Error("actor is undefined");
    }

    const owningDocument = this.document.owningDocument;
    for (const group of owningDocument.assets.equipmentSlotGroups) {
      for (const slot of group.slots) {
        if (slot.alottedId === assetId) {
          return slot;
        }
      }
    }
    return undefined;
  }
}
