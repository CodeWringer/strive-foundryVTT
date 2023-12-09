import TransientDocument from "../../../../business/document/transient-document.mjs";
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import ButtonContextMenuViewModel from "../../../component/button-context-menu/button-context-menu-viewmodel.mjs";
import ButtonDeleteViewModel from "../../../component/button-delete/button-delete-viewmodel.mjs";
import ButtonSendToChatViewModel from "../../../component/button-send-to-chat/button-send-to-chat-viewmodel.mjs";
import InputImageViewModel from "../../../component/input-image/input-image-viewmodel.mjs";
import InputRichTextViewModel from "../../../component/input-rich-text/input-rich-text-viewmodel.mjs";
import DynamicInputDefinition from "../../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import DynamicInputDialog from "../../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";
import { DYNAMIC_INPUT_TYPES } from "../../../dialog/dynamic-input-dialog/dynamic-input-types.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import { CONTEXT_TYPES } from "../../context-types.mjs";

/**
 * Represents the abstract base class for all view models that represent 
 * a list item. 
 * 
 * Inheriting types must implement: 
 * * `TEMPLATE` @see ViewModel.TEMPLATE
 * 
 * @abstract
 */
export default class BaseListItemViewModel extends ViewModel {
  /** @override */
  get entityId() { return this.document.id; }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {TransientDocument} args.document 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);

    this.document = args.document;

    this.vmImg = new InputImageViewModel({
      parent: this,
      id: "vmImg",
      value: this.document.img,
      onChange: (_, newValue) => {
        this.document.img = newValue;
      },
    });
    this.vmBtnContextMenu = new ButtonContextMenuViewModel({
      id: "vmBtnContextMenu",
      parent: this,
      menuItems: [
        // Edit name
        {
          name: game.i18n.localize("ambersteel.general.name.edit"),
          icon: '<i class="fas fa-edit"></i>',
          condition: this.context === CONTEXT_TYPES.LIST_ITEM,
          callback: this.queryEditName.bind(this),
        },
      ]
    });
    this.vmBtnSendToChat = new ButtonSendToChatViewModel({
      parent: this,
      id: "vmBtnSendToChat",
      target: this.document,
      isEditable: this.isEditable || this.isGM,
    });
    this.vmBtnDelete = new ButtonDeleteViewModel({
      parent: this,
      id: "vmBtnDelete",
      target: this.document,
      withDialog: true,
    })
    this.vmRtDescription = new InputRichTextViewModel({
      parent: this,
      id: "vmRtDescription",
      value: this.document.description,
      onChange: (_, newValue) => {
        this.document.description = newValue;
      },
    });
  }

  /**
   * Prompts the user to enter a name and applies it. 
   * 
   * @protected
   */
  async queryEditName() {
    const inputName = "inputName";

    const dialog = await new DynamicInputDialog({
      localizedTitle: `${format(game.i18n.localize("ambersteel.general.name.editOf"), this.document.name)}`,
      inputDefinitions: [
        new DynamicInputDefinition({
          type: DYNAMIC_INPUT_TYPES.TEXTFIELD,
          name: inputName,
          localizedLabel: game.i18n.localize("ambersteel.general.name.label"),
          required: true,
          defaultValue: this.document.name,
          validationFunc: (str) => {
            return str.trim().length > 0;
          },
        }),
      ],
    }).renderAndAwait(true);

    if (dialog.confirmed !== true) return;

    this.document.name = dialog[inputName];
  }
}
