import { validateOrThrow } from "../../../../../business/util/validation-utility.mjs";
import ButtonViewModel from "../../../../component/button/button-viewmodel.mjs";
import ViewModel from "../../../../view-model/view-model.mjs";

/**
 * @extends ViewModel
 */
export default class ActorAssetSlotViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_ASSET_SLOT; }

  get localizedName() {
    if (this.assetSlot.localizableName === undefined) {
      return this.assetSlot.customName;
    } else {
      return game.i18n.localize(this.assetSlot.localizableName);
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
   * @param {CharacterAssetSlot} args.assetSlot
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["assetSlot"]);

    this.assetSlot = args.assetSlot;

    this.vmBtnEdit = new ButtonViewModel({
      id: "vmBtnEdit",
      parent: this,
      isSendable: this.isSendable,
      isEditable: this.isEditable,
      isOwner: this.isOwner,
      target: this.document,
      localizableTitle: "ambersteel.character.asset.slot.edit",
      onClick: () => {
        // TODO #196
      },
    });
  }
}