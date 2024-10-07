import TransientBaseCharacterActor from "../../../../../business/document/actor/transient-base-character-actor.mjs";
import CharacterAssetSlot from "../../../../../business/ruleset/asset/character-asset-slot.mjs";
import { StringUtil } from "../../../../../business/util/string-utility.mjs";
import { ValidationUtil } from "../../../../../business/util/validation-utility.mjs";
import ButtonDeleteViewModel from "../../../../component/button-delete/button-delete-viewmodel.mjs";
import ButtonViewModel from "../../../../component/button/button-viewmodel.mjs";
import ChoiceOption from "../../../../component/input-choice/choice-option.mjs";
import DynamicInputDefinition from "../../../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import DynamicInputDialog from "../../../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";
import { DYNAMIC_INPUT_TYPES } from "../../../../dialog/dynamic-input-dialog/dynamic-input-types.mjs";
import ViewModel from "../../../../view-model/view-model.mjs";
import AssetListItemViewModel from "../../../item/asset/asset-list-item-viewmodel.mjs";
import { queryAssetSlotConfiguration } from "./assets-utils.mjs";

/**
 * @extends ViewModel
 * 
 * @property {CharacterAssetSlot} assetSlot
 * * Read-only. 
 * @property {TransientAsset | undefined} asset
 * * Read-only. 
 * @property {Boolean} hasAsset
 * * Read-only. 
 * @property {Number} currentBulk
 * * Read-only. 
 * @property {Number} maxBulk
 * * Read-only. 
 * @property {Number} moddedMaxBulk
 * * Read-only. 
 * @property {Array<TransientAsset>} availableAssets
 * * Read-only. 
 * @property {String} assetListItemTemplate
 * * Read-only. 
 * @property {AssetListItemViewModel} assetListItemViewModel
 * * Read-only. 
 * @property {Boolean} hasExceededBulk Returns `true`, if the asset slot's maximum allowed bulk has been exceeded. 
 * * Read-only. 
 * @property {TransientBaseCharacterActor} actor 
 * * Read-only. 
 */
export default class ActorAssetSlotViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_ASSET_SLOT; }

  /**
   * @type {TransientAsset | undefined}
   * @readonly
   */
  get asset() {
    return this.assetSlot.asset;
  }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hasAsset() {
    return ValidationUtil.isDefined(this.assetSlot.alottedId) === true;
  }

    /**
   * @type {Number}
   * @readonly
   */
  get currentBulk() {
    const asset = this.asset;
    if (asset === undefined) {
      return 0;
    } else {
      return asset.bulk;
    }
  }

  /**
   * @type {Number}
   * @readonly
   */
  get maxBulk() {
    return this.assetSlot.maxBulk;
  }

  /**
   * @type {Number}
   * @readonly
   */
  get moddedMaxBulk() {
    return this.assetSlot.moddedMaxBulk;
  }

  /**
   * @type {TransientBaseCharacterActor}
   * @readonly
   */
  get actor() {
    return this.assetSlot.group.actor;
  }

  /**
   * @type {Array<TransientAsset>}
   * @readonly
   */
  get availableAssets() {
    return this.actor.assets.all;
  }

  /**
   * @type {String}
   * @readonly
   */
  get assetListItemTemplate() { return AssetListItemViewModel.TEMPLATE; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hasExceededBulk() {
    if (this.currentBulk > this.moddedMaxBulk) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {CharacterAssetSlot} args.assetSlot
   * @param {Boolean | undefined} args.showSlotBulk If `true`, will render bulk for the slot. 
   * * default `false`
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["assetSlot"]);

    this.assetSlot = args.assetSlot;
    this.showSlotBulk = args.showSlotBulk ?? false;

    const thiz = this;

    this.vmBtnEdit = new ButtonViewModel({
      id: "vmBtnEdit",
      parent: this,
      iconHtml: '<i class="fas fa-cog"></i>',
      localizedToolTip: game.i18n.localize("system.character.asset.slot.edit"),
      onClick: async () => {
        const delta = await queryAssetSlotConfiguration(this.assetSlot);
        await this.assetSlot.update(delta);
      },
    });

    this.vmBtnAssign = new ButtonViewModel({
      id: "vmBtnAssign",
      parent: this,
      target: this.document,
      iconHtml: '<i class="fas fa-plus"></i>',
      localizedLabel: game.i18n.localize("system.character.asset.slot.assign.label"),
      localizedToolTip: game.i18n.localize("system.character.asset.slot.assign.label"),
      onClick: async () => {
        const inputChoices = "inputChoices";
        const assetChoices = this._getAssetsAsChoices();

        const dialog = await new DynamicInputDialog({
          localizedTitle: StringUtil.format(
            game.i18n.localize("system.general.input.queryFor"), 
            game.i18n.localize("system.character.asset.slot.label"), 
          ),
          inputDefinitions: [
            new DynamicInputDefinition({
              type: DYNAMIC_INPUT_TYPES.DROP_DOWN,
              name: inputChoices,
              localizedLabel: game.i18n.localize("system.general.name.label"),
              required: true,
              defaultValue: assetChoices.length > 0 ? assetChoices[0] : undefined,
              specificArgs: {
                options: assetChoices,
              }
            }),
          ],
        }).renderAndAwait(true);
        
        if (dialog.confirmed !== true) return;
        
        // Assign the asset to the slot, via its `moveToAssetSlot` method. 
        const assetIdToAlot = dialog[inputChoices].value;
        const assetToAlot = this.availableAssets.find(it => it.id === assetIdToAlot);
        assetToAlot.moveToAssetSlot(this.assetSlot);
      },
    });

    this.vmBtnDelete = new ButtonDeleteViewModel({
      id: "vmBtnDelete",
      parent: this,
      isEditable: this.isEditable,
      target: this.assetSlot,
      withDialog: true,
      localizedDeletionType: game.i18n.localize("system.character.asset.slot.label"),
      localizedDeletionTarget: this.assetSlot.name,
      callback: async () => {
        const assetToUnassign = this.availableAssets.find(it => it.id === this.assetSlot.alottedId);
        if (assetToUnassign !== undefined) {
          assetToUnassign.moveToProperty();
        }
      },
    });

    this._updateViewModel();
  }
  
  /** @override */
  update(args = {}) {
    this._updateViewModel();

    super.update(args);
  }

  /**
   * Updates the view model, by discarding and re-instantiating it. 
   * 
   * @private
   */
  _updateViewModel() {
    if (this.assetListItemViewModel !== undefined) {
      this.assetListItemViewModel.dispose();
    }
    if (ValidationUtil.isDefined(this.assetSlot.alottedId) === true) {
      this.assetListItemViewModel = new AssetListItemViewModel({
        id: "assetListItemViewModel",
        parent: this,
        document: this.assetSlot.asset,
        isEditable: this.isEditable,
        isSendable: this.isSendable,
        isOwner: this.isOwner,
      });
    }
  }

  /**
   * Returns all luggage and property from the group's parent actor. 
   * 
   * @returns {Array<TransientAsset>}
   * 
   * @private
   */
  _getAssetsAsChoices() {
    return this.availableAssets
      .map(asset => {
        return new ChoiceOption({
          value: asset.id,
          localizedValue: asset.name,
        });
      })
      .sort((a, b) => a.localizedValue.localeCompare(b.localizedValue));
  }
}