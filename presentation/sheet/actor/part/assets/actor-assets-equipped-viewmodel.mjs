import TransientBaseCharacterActor from "../../../../../business/document/actor/transient-base-character-actor.mjs";
import * as StringUtil from "../../../../../business/util/string-utility.mjs";
import { createUUID } from "../../../../../business/util/uuid-utility.mjs";
import { validateOrThrow } from "../../../../../business/util/validation-utility.mjs"
import ButtonViewModel from "../../../../component/button/button-viewmodel.mjs";
import DynamicInputDefinition from "../../../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import DynamicInputDialog from "../../../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";
import { DYNAMIC_INPUT_TYPES } from "../../../../dialog/dynamic-input-dialog/dynamic-input-types.mjs";
import { TEMPLATES } from "../../../../templatePreloader.mjs"
import ViewModel from "../../../../view-model/view-model.mjs"
import ActorAssetSlotGroupViewModel from "./actor-asset-slot-group-viewmodel.mjs";

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
  get assetSlotGroupTemplate() { return TEMPLATES.ACTOR_ASSET_SLOT_GROUP; }
  
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

    this.assetSlotGroupViewModels = [];
    this.assetSlotGroupViewModels = this._getAssetSlotGroupViewModels();

    this.vmBtnAddSlotGroup = new ButtonViewModel({
      id: "vmBtnAddSlotGroup",
      parent: this,
      target: this.document,
      iconHtml: '<i class="fas fa-plus"></i>',
      localizedLabel: game.i18n.localize("system.character.asset.slot.group.add.label"),
      localizedTooltip: game.i18n.localize("system.character.asset.slot.add.label"),
      onClick: async () => {
        const inputName = "name";

        const dialog = await new DynamicInputDialog({
          localizedTitle: StringUtil.format(
            game.i18n.localize("system.general.input.queryFor"), 
            game.i18n.localize("system.character.asset.slot.group.label"), 
          ),
          inputDefinitions: [
            new DynamicInputDefinition({
              type: DYNAMIC_INPUT_TYPES.TEXTFIELD,
              name: inputName,
              localizedLabel: game.i18n.localize("system.general.name.label"),
              required: true,
              defaultValue: "New Asset Slot Group"
            }),
          ],
        }).renderAndAwait(true);
        
        if (dialog.confirmed !== true) return;
        
        this.document.update({
          system: {
            assets: {
              equipment: {
                [createUUID()]: {
                  name: dialog[inputName],
                  slots: {}
                }
              }
            }
          }
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

    const newGroups = this._getAssetSlotGroupViewModels();
    this._cullObsolete(this.assetSlotGroupViewModels, newGroups);
    this.assetSlotGroupViewModels = newGroups;
  }

  /**
   * @returns {Array<ActorAssetSlotViewModel>}
   * 
   * @private
   */
  _getAssetSlotGroupViewModels() {
    const result = [];

    const groups = this.document.assets.equipmentSlotGroups;
    for (const group of groups) {
      let vm = this.assetSlotGroupViewModels.find(it => it.id === group.id);
      if (vm === undefined) {
        vm = new ActorAssetSlotGroupViewModel({
          id: group.id,
          parent: this,
          group: group,
          isEditable: this.isEditable,
          isSendable: this.isSendable,
          isOwner: this.isOwner,
        });
      }
      result.push(vm);
    }

    return result;
  }
}
