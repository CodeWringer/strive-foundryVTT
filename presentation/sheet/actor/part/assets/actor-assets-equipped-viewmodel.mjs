import TransientBaseCharacterActor from "../../../../../business/document/actor/transient-base-character-actor.mjs"
import * as StringUtil from "../../../../../business/util/string-utility.mjs";
import { validateOrThrow } from "../../../../../business/util/validation-utility.mjs"
import ButtonViewModel from "../../../../component/button/button-viewmodel.mjs";
import DynamicInputDefinition from "../../../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import DynamicInputDialog from "../../../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";
import { DYNAMIC_INPUT_TYPES } from "../../../../dialog/dynamic-input-dialog/dynamic-input-types.mjs";
import { TEMPLATES } from "../../../../templatePreloader.mjs"
import ViewModel from "../../../../view-model/view-model.mjs"
import ActorAssetSlotViewModel from "./actor-asset-slot-group-viewmodel.mjs";

/**
 * Represents the "Worn & Equipped" section on a character sheet. 
 * 
 * @extends ViewModel
 */
export default class ActorAssetsEquippedViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_ASSETS; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * @type {String}
   * @readonly
   */
  get assetTemplate() { return TEMPLATES.ACTOR_ASSET_SLOT; }
  
  /**
   * @type {String}
   * @readonly
   */
  get localizedAddSlotLabel() { return game.i18n.localize("ambersteel.character.asset.slot.add.label"); }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {TransientBaseCharacterActor} args.document
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);

    this.document = args.document;

    this.assetSlotViewModels = [];
    this.assetSlotViewModels = this._getAssetSlotViewModels();

    this.vmBtnAddSlot = new ButtonViewModel({
      id: "vmBtnAddSlot",
      parent: this,
      isSendable: this.isSendable,
      isEditable: this.isEditable,
      isOwner: this.isOwner,
      target: this.document,
      localizableTitle: "ambersteel.character.asset.slot.add.label",
      onClick: async () => {
        const inputNameCustomName = "customName";
        const inputNameAcceptedTypes = "acceptedTypes";

        const dialog = await new DynamicInputDialog({
          localizedTitle: StringUtil.format(
            game.i18n.localize("ambersteel.general.input.queryFor"), 
            game.i18n.localize("ambersteel.character.asset.slot.label"), 
          ),
          inputDefinitions: [
            new DynamicInputDefinition({
              type: DYNAMIC_INPUT_TYPES.TEXTFIELD,
              name: inputNameCustomName,
              localizableLabel: "ambersteel.character.asset.slot.name",
              required: true,
              defaultValue: "New Asset Slot"
            }),
            new DynamicInputDefinition({
              type: DYNAMIC_INPUT_TYPES.TEXTFIELD,
              name: inputNameAcceptedTypes,
              localizableLabel: "ambersteel.character.asset.slot.acceptedTypes",
              required: true,
              defaultValue: "",
              specificArgs: {
                placeholder: "holdable, armor, clothing"
              },
            }),
          ],
        }).renderAndAwait(true);
        
        if (dialog.confirmed !== true) return;
        this.document.addEquipmentAssetSlot({
          customName: dialog[inputNameCustomName],
          acceptedTypes: dialog[inputNameAcceptedTypes],
        });
      },
    });
  }
  
  /**
   * Updates the data of this view model. 
   * 
   * @param {Boolean | undefined} args.isEditable If true, the view model data is editable.
   * * Default `false`. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat.
   * * Default `false`. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document.
   * * Default `false`. 
   * 
   * @override
   */
  update(args = {}) {
    super.update(args);

    this.assetSlotViewModels = this._getAssetSlotViewModels();
  }

  /**
   * @returns {Array<ActorAssetSlotViewModel>}
   * 
   * @private
   */
  _getAssetSlotViewModels() {
    const result = [];

    const groups = this.document.assets.equipmentSlots;
    for (const group of groups) {
      // let vm = this.assetSlotViewModels.find(it => it.id === assetSlot.id);
      // if (vm === undefined) {
      //   vm = new ActorAssetSlotViewModel({
      //     id: assetSlot.id,
      //     parent: this,
      //     assetSlot: assetSlot,
      //     isEditable: this.isEditable,
      //     isSendable: this.isSendable,
      //     isOwner: this.isOwner,
      //   });
      // }
      // result.push(vm);
    }

    return result;
  }
}
