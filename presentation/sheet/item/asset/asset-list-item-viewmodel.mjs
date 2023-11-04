import TransientAsset from "../../../../business/document/item/transient-asset.mjs"
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs"
import { TEMPLATES } from "../../../templatePreloader.mjs"
import ViewModel from "../../../view-model/view-model.mjs"

/**
 * @property {Boolean} hideTakeAsset
 * @property {Boolean} hideDropAsset
 * 
 * @extends ViewModel
 */
export default class AssetListItemViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ITEM_LIST_ITEM; }

  /** @override */
  get entityId() { return this.document.id; }

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
    this.layoutViewModel = this.document.listItemPresenter.getViewModel(this);

    // this.vmBtnTakeAsset = new ButtonViewModel({
    //   id: "vmBtnTakeAsset",
    //   parent: this,
    //   isEditable: this._actor !== undefined && this.isEditable,
    //   onClick: async () => {
    //     // Move "up" on character sheet. 
    //     if (thiz.document.isProperty === true) {
    //       thiz.document.moveToLuggage();
    //     } else if (thiz.document.isLuggage === true) {
    //       const slot = await this._querySelectSlot();
    //       if (slot !== undefined) {
    //         thiz.document.moveToAssetSlot(slot);
    //       }
    //     }
    //   },
    // });
    // this.vmBtnDropAsset = new ButtonViewModel({
    //   id: "vmBtnDropAsset",
    //   parent: this,
    //   isEditable: this._actor !== undefined && this.isEditable,
    //   onClick: async () => {
    //     // Move "down" on character sheet. 
    //     if (thiz.document.isEquipped === true) {
    //       thiz.document.moveToLuggage();
    //     } else if (thiz.document.isLuggage === true) {
    //       thiz.document.moveToProperty();
    //     }
    //   },
    // });
  }

  // /**
  //  * @returns {CharacterAssetSlot | undefined}
  //  * 
  //  * @private
  //  * @async
  //  */
  // async _querySelectSlot() {
  //   if (this._actor === undefined) {
  //     throw new Error("actor is undefined");
  //   }

  //   const availableSlots = [];
  //   for (const group of this._actor.assets.equipmentSlotGroups) {
  //     for (const slot of group.slots) {
  //       availableSlots.push(slot);
  //     }
  //   }

  //   const availableSlotChoices = [];
  //   const adapter = new ChoiceAdapter({
  //     // obj: CharacterAssetSlot
  //     toChoiceOption: (obj) => {
  //       return new ChoiceOption({
  //         value: obj.id,
  //         localizedValue: obj.name,
  //       });
  //     },
  //     fromChoiceOption: (choice) => {
  //       return availableSlots.find(it => it.id === choice.value);
  //     },
  //   })
  //   for (const slot of availableSlots) {
  //     availableSlotChoices.push(adapter.toChoiceOption(slot));
  //   }

  //   const inputSlots = "inputSlots";

  //   const dialog = await new DynamicInputDialog({
  //     easyDismissal: true,
  //     inputDefinitions: [
  //       new DynamicInputDefinition({
  //         type: DYNAMIC_INPUT_TYPES.DROP_DOWN,
  //         name: inputSlots,
  //         localizedLabel: game.i18n.localize("ambersteel.character.asset.slot.label"),
  //         specificArgs: {
  //           options: availableSlotChoices,
  //           adapter: adapter,
  //         },
  //         required: true,
  //         defaultValue: availableSlots[0].id,
  //       }),
  //     ],
  //   }).renderAndAwait(true);

  //   if (dialog.confirmed !== true) return undefined;

  //   const selectedId = dialog[inputSlots];
  //   const assetSlot = availableSlots.find(it => it.id === selectedId);

  //   return assetSlot;
  // }
}
