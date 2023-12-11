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
import { TEMPLATES } from "../../../templatePreloader.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import { CONTEXT_TYPES } from "../../context-types.mjs";

/**
 * Represents a header button definition of a list item. 
 * 
 * @property {String} template
 * @property {ViewModel} viewModel
 * @property {String} cssClass
 */
export class HeaderButtonDefinition {
  /**
   * @param {Object} args 
   * @param {String} args.template 
   * @param {ViewModel} args.viewModel 
   * @param {String | undefined} args.cssClass 
   * * default `""`
   */
  constructor(args = {}) {
    validateOrThrow(args, ["template", "viewModel"]);

    this.template = args.template;
    this.viewModel = args.viewModel;

    this.cssClass = args.cssClass ?? "";
  }
}

/**
 * Represents the abstract base class for all view models that represent 
 * a list item. 
 * 
 * @abstract
 * 
 * @property {Array<HeaderButtonDefinition>} primaryHeaderButtons An array of the primary 
 * header buttons. 
 * * Note that each of the provided view model instances will be available for access on 
 * this view model instance, as a property whose name is the id of the provided 
 * view model instance. 
 * @property {Array<HeaderButtonDefinition>} secondaryHeaderButtons An array of the secondary  
 * header buttons. 
 * * Note that each of the provided view model instances will be available for access on 
 * this view model instance, as a property whose name is the id of the provided 
 * view model instance. 
 */
export default class BaseListItemViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.BASE_LIST_ITEM; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {TransientDocument} args.document 
   * @param {Array<HeaderButtonDefinition> | undefined} args.primaryHeaderButtons An override of the primary 
   * header buttons. 
   * * By default, contains a send to chat button. 
   * * Note that providing this argument implies having to provide **all** the button definitions, including 
   * the default. 
   * @param {Array<HeaderButtonDefinition> | undefined} args.secondaryHeaderButtons An override of the secondary 
   * header buttons. 
   * * By default, contains a context menu and delete button. 
   * * Note that providing this argument implies having to provide **all** the button definitions, including 
   * the default. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);

    this.document = args.document;

    this.primaryHeaderButtons = (args.primaryHeaderButtons ?? [
      new HeaderButtonDefinition({
        template: ButtonSendToChatViewModel.TEMPLATE,
        viewModel: new ButtonSendToChatViewModel({
          id: "vmBtnSendToChat",
          parent: this,
          target: this.document,
        }),
      }),
    ]);

    for (const definition of this.primaryHeaderButtons) {
      this[definition.viewModel.id] = definition.viewModel;
    }

    this.secondaryHeaderButtons = (args.primaryHeaderButtons ?? [
      new HeaderButtonDefinition({
        template: ButtonContextMenuViewModel.TEMPLATE,
        viewModel: new ButtonContextMenuViewModel({
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
          ],
        }),
      }),
      new HeaderButtonDefinition({
        template: ButtonDeleteViewModel.TEMPLATE,
        viewModel: new ButtonDeleteViewModel({
          parent: this,
          id: "vmBtnDelete",
          target: this.document,
          withDialog: true,
        }),
      }),
    ]);

    for (const definition of this.secondaryHeaderButtons) {
      this[definition.viewModel.id] = definition.viewModel;
    }

    this.vmImg = new InputImageViewModel({
      parent: this,
      id: "vmImg",
      value: this.document.img,
      onChange: (_, newValue) => {
        this.document.img = newValue;
      },
    });
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
