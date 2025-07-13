import TransientBaseCharacterActor from "../../../../../business/document/actor/transient-base-character-actor.mjs";
import { StringUtil } from "../../../../../business/util/string-utility.mjs";
import { UuidUtil } from "../../../../../business/util/uuid-utility.mjs";
import { ValidationUtil } from "../../../../../business/util/validation-utility.mjs";
import ButtonViewModel from "../../../../component/button/button-viewmodel.mjs";
import InputTextFieldViewModel from "../../../../component/input-textfield/input-textfield-viewmodel.mjs";
import DynamicInputDefinition from "../../../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import DynamicInputDialog from "../../../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";
import ViewModel from "../../../../view-model/view-model.mjs"
import ActorAssetSlotGroupViewModel from "./actor-asset-slot-group-viewmodel.mjs";

/**
 * Represents the "Worn & Equipped" section on a character sheet. 
 * 
 * @extends ViewModel
 */
export default class ActorAssetsEquippedViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_ASSETS; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * @type {String}
   * @readonly
   */
  get assetSlotGroupTemplate() { return game.strive.const.TEMPLATES.ACTOR_ASSET_SLOT_GROUP; }
  
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
    ValidationUtil.validateOrThrow(args, ["document"]);

    this.document = args.document;

    this.assetSlotGroupViewModels = [];
    this.assetSlotGroupViewModels = this._getAssetSlotGroupViewModels();

    this.vmBtnAddSlotGroup = new ButtonViewModel({
      id: "vmBtnAddSlotGroup",
      parent: this,
      target: this.document,
      iconHtml: '<i class="fas fa-plus"></i>',
      localizedLabel: StringUtil.format(
        game.i18n.localize("system.general.add.addType"),
        game.i18n.localize("system.character.asset.slot.group.label"),
      ),
      onClick: async () => {
        const inputName = "name";

        const dialog = await new DynamicInputDialog({
          localizedTitle: StringUtil.format(
            game.i18n.localize("system.general.input.queryFor"), 
            game.i18n.localize("system.character.asset.slot.group.label"), 
          ),
          inputDefinitions: [
            new DynamicInputDefinition({
              name: inputName,
              localizedLabel: game.i18n.localize("system.general.name.label"),
              template: InputTextFieldViewModel.TEMPLATE,
              viewModelFactory: (id, parent) => new InputTextFieldViewModel({
                id: id,
                parent: parent,
                value: "New Asset Slot Group",
              }),
              required: true,
              validationFunc: (value) => { return ValidationUtil.isNotBlankOrUndefined(value); },
            }),
          ],
        }).renderAndAwait(true);
        
        if (dialog.confirmed !== true) return;
        
        this.document.update({
          system: {
            assets: {
              equipment: {
                [UuidUtil.createUUID()]: {
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
