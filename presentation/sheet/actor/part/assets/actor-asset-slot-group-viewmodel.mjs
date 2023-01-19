import TransientBaseCharacterActor from "../../../../../business/document/actor/transient-base-character-actor.mjs";
import { validateOrThrow } from "../../../../../business/util/validation-utility.mjs";
import ButtonViewModel from "../../../../component/button/button-viewmodel.mjs";
import ViewModel from "../../../../view-model/view-model.mjs";

/**
 * @extends ViewModel
 */
export default class ActorAssetSlotGroupViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_ASSET_SLOT; }

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
   * @param {CharacterAssetSlotGroup} args.group
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document", "group"]);

    this.document = args.document;
    this.group = args.group;

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
}