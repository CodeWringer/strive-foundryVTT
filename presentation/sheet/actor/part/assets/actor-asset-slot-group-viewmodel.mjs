import CharacterAssetSlotGroup from "../../../../../business/ruleset/asset/character-asset-slot-group.mjs";
import { StringUtil } from "../../../../../business/util/string-utility.mjs";
import { UuidUtil } from "../../../../../business/util/uuid-utility.mjs";
import { ValidationUtil } from "../../../../../business/util/validation-utility.mjs";
import ButtonContextMenuViewModel from "../../../../component/button-context-menu/button-context-menu-viewmodel.mjs";
import ConfirmablePlainDialog from "../../../../dialog/plain-confirmable-dialog/plain-confirmable-dialog.mjs";
import ViewModel from "../../../../view-model/view-model.mjs";
import ActorAssetSlotViewModel from "./actor-asset-slot-viewmodel.mjs";
import { queryAssetSlotConfiguration } from "./assets-utils.mjs";

/**
 * @extends ViewModel
 * 
 * @property {CharacterAssetSlotGroup} group
 * * Read-only. 
 * @property {String} localizedName
 * * Read-only. 
 * @property {Boolean} hasFreeSlot
 * * Read-only. 
 * @property {Boolean} hasExceededBulk Returns `true`, if the asset slot group's maximum allowed bulk has been exceeded. 
 * * Read-only. 
 * @property {Array<ActorAssetSlotViewModel>} assetSlotViewModels
 * * Read-only. 
 * @property {String} assetSlotTemplate
 * * Read-only. 
 */
export default class ActorAssetSlotGroupViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_ASSET_SLOT_GROUP; }

  /**
   * @type {String}
   * @readonly
   */
  get localizedName() {
    const name = this.group.name.toLowerCase();
    if (name === "hand") {
      return game.i18n.localize("system.character.asset.slot.hand");
    } else if (name === "clothing") {
      return game.i18n.localize("system.character.asset.slot.clothing");
    } else if (name === "armor") {
      return game.i18n.localize("system.character.asset.slot.armor");
    } else if (name === "back") {
      return game.i18n.localize("system.character.asset.slot.back");
    } else {
      return this.group.name;
    }
  }

  /**
   * @type {String}
   * @readonly
   */
  get assetSlotTemplate() { return ActorAssetSlotViewModel.TEMPLATE; }
  
  /**
   * @type {Boolean}
   * @readonly
   */
  get hasFreeSlot() {
    for (const slot of this.group.slots) {
      if (ValidationUtil.isDefined(slot.alottedId) === false) {
        return true;
      }
    }
    return false;
  }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hasExceededBulk() {
    if (this.group.currentBulk > this.group.maxBulk) {
      return true;
    } else {
      return false;
    }
  }

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
   * @param {CharacterAssetSlotGroup} args.group
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["group"]);

    this.group = args.group;
    const thiz = this;

    this.vmBtnEdit = new ButtonContextMenuViewModel({
      id: "vmBtnEdit",
      parent: this,
      isSendable: this.isSendable,
      isEditable: this.isEditable,
      isOwner: this.isOwner,
      menuItems: [
        {
          name: StringUtil.format(
            game.i18n.localize("system.general.add.addType"),
            game.i18n.localize("system.character.asset.slot.label"),
          ),
          icon: '<i class="fas fa-plus"></i>',
          condition: () => { return true; },
          callback: async () => {
            const data = await queryAssetSlotConfiguration({
              name: this.group.name,
            });
            await this.group.actor.updateByPath(`system.assets.equipment.${this.group.id}.slots.${UuidUtil.createUUID()}`, {
              name: data.name,
              acceptedTypes: data.acceptedTypes,
              alottedId: null,
              maxBulk: data.maxBulk,
            });
          },
        },
        {
          name: StringUtil.format(
            game.i18n.localize("system.general.delete.deleteType"), 
            game.i18n.localize("system.character.asset.slot.group.label")
          ),
          icon: '<i class="fas fa-trash"></i>',
          condition: () => { return true; },
          callback: async () => {
            const dialog = await new ConfirmablePlainDialog({
              localizedTitle: game.i18n.localize("system.general.delete.query"),
              localizedContent: StringUtil.format(
                game.i18n.localize("system.general.delete.queryTypeOf"),
                game.i18n.localize("system.character.asset.slot.group.label"),
                thiz.group.name
              ),
            }).renderAndAwait(true);

            if (dialog.confirmed !== true) return;

            thiz.group.delete();
          },
        },
      ],
    });
    this.assetSlotViewModels = [];
    this.assetSlotViewModels = this._getAssetSlotViewModels();
  }

  /** @override */
  update(args = {}) {
    const newAssetSlotViewModels = this._getAssetSlotViewModels();
    this._cullObsolete(this.assetSlotViewModels, newAssetSlotViewModels);
    this.assetSlotViewModels = newAssetSlotViewModels;
    
    super.update(args);
  }

  /**
   * @returns {Array<ActorAssetSlotViewModel>}
   * 
   * @private
   */
  _getAssetSlotViewModels() {
    // The arguments-object passed to the constructor must be overridden 
    // here, because the constructor doesn't expect a parameter named 
    // `documents`, but instead expects `assetSlot`. Therefore, a mapping 
    // is required. 
    return this._getViewModels(
      this.group.slots, 
      this.assetSlotViewModels,
      (args) => { return new ActorAssetSlotViewModel({
        id: args.id,
        assetSlot: args.document,
        parent: this,
        isEditable: this.isEditable,
        isSendable: this.isSendable,
        isOwner: this.isOwner,
        showSlotBulk: this.group.slots.length > 1,
      }); }
    );
  }
}