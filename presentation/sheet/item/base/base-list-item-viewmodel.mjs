import TransientDocument from "../../../../business/document/transient-document.mjs";
import { isDefined, validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import ButtonContextMenuViewModel from "../../../component/button-context-menu/button-context-menu-viewmodel.mjs";
import ButtonDeleteViewModel from "../../../component/button-delete/button-delete-viewmodel.mjs";
import ButtonSendToChatViewModel from "../../../component/button-send-to-chat/button-send-to-chat-viewmodel.mjs";
import ButtonViewModel from "../../../component/button/button-viewmodel.mjs";
import InputImageViewModel from "../../../component/input-image/input-image-viewmodel.mjs";
import InputRichTextViewModel from "../../../component/input-rich-text/input-rich-text-viewmodel.mjs";
import DynamicInputDefinition from "../../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import DynamicInputDialog from "../../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";
import { DYNAMIC_INPUT_TYPES } from "../../../dialog/dynamic-input-dialog/dynamic-input-types.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import { CONTEXT_TYPES } from "../../context-types.mjs";
import { TemplatedComponent } from "./templated-component.mjs";

/**
 * Represents the abstract base class for all view models that represent 
 * a list item. 
 * 
 * @abstract Inheriting types should override: 
 * * `getDataFields`
 * * `getPrimaryHeaderButtons`
 * * `getSecondaryHeaderButtons`
 * * `getAdditionalHeaderContent`
 * 
 * @property {Array<TemplatedComponent>} primaryHeaderButtons An array of the primary 
 * header buttons. 
 * * Note that each of the provided view model instances will be available for access on 
 * this view model instance, as a property whose name is the id of the provided 
 * view model instance. 
 * @property {Array<TemplatedComponent>} secondaryHeaderButtons An array of the secondary  
 * header buttons. 
 * * Note that each of the provided view model instances will be available for access on 
 * this view model instance, as a property whose name is the id of the provided 
 * view model instance. 
 * @property {additionalHeaderContent | undefined} additionalHeaderContent Additional 
 * header content. Will not be collapsible and will be rendered directly beneath the 
 * header. 
 * @property {Array<TemplatedComponent>} dataFields 
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
   * @type {Boolean}
   * @private
   */
  _isExpanded = false;
  /**
   * @type {Boolean}
   */
  get isExpanded() { return this._isExpanded; }
  set isExpanded(value) {
    this._isExpanded = value;
    this.writeViewState();

    const contentElement = this.element.find(`#${this.id}-content`);
    if (value === true) {
      contentElement.removeClass("hidden");
      contentElement.animate({
        height: "100%"
      }, 300, () => {
      });
    } else {
      contentElement.animate({
        height: "0%"
      }, 300, () => {
        contentElement.addClass("hidden");
      });
    }
  }

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
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);

    this.document = args.document;

    this.dataFields = this.getDataFields();
    this._ensureViewModelsAsProperties(this.dataFields);

    this.primaryHeaderButtons = this.getPrimaryHeaderButtons();
    this._ensureViewModelsAsProperties(this.primaryHeaderButtons);
    
    this.secondaryHeaderButtons = this.getSecondaryHeaderButtons();
    this._ensureViewModelsAsProperties(this.secondaryHeaderButtons);
    
    this.additionalHeaderContent = this.getAdditionalHeaderContent();
    if (isDefined(this.additionalHeaderContent)) {
      this._ensureViewModelsAsProperties([this.additionalHeaderContent]);
    }

    this.vmImg = new InputImageViewModel({
      parent: this,
      id: "vmImg",
      value: this.document.img,
      onChange: (_, newValue) => {
        this.document.img = newValue;
      },
    });
    this.vmHeaderButton = new ButtonViewModel({
      id: "vmHeaderButton",
      parent: this,
      localizedLabel: this.document.name,
      onClick: () => {
        this.isExpanded = !this.isExpanded;
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
   * Returns the data field definitions that will be rendered as two fields 
   * per row, in the collapsible content area. 
   * 
   * @returns {Array<TemplatedComponent>}
   * 
   * @virtual
   * @protected
   */
  getDataFields() {
    return [];
  }

  /**
   * Returns the definitions of the primary header buttons. 
   * * By default, contains a send to chat button. 
   * 
   * @returns {Array<TemplatedComponent>}
   * 
   * @virtual
   * @protected
   */
  getPrimaryHeaderButtons() {
    return [
      // Send to chat button
      new TemplatedComponent({
        template: ButtonSendToChatViewModel.TEMPLATE,
        viewModel: new ButtonSendToChatViewModel({
          id: "vmBtnSendToChat",
          parent: this,
          target: this.document,
        }),
      }),
    ]; 
  }

  /**
   * Returns the definitions of the secondary header buttons. 
   * * By default, contains a context menu and delete button. 
   * 
   * @returns {Array<TemplatedComponent>}
   * 
   * @virtual
   * @protected
   */
  getSecondaryHeaderButtons() {
    return [
      // Context menu button
      new TemplatedComponent({
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
      // Delete button
      new TemplatedComponent({
        template: ButtonDeleteViewModel.TEMPLATE,
        viewModel: new ButtonDeleteViewModel({
          parent: this,
          id: "vmBtnDelete",
          target: this.document,
          withDialog: true,
        }),
      }),
    ]; 
  }
  
  /**
   * Returns the definition of the additional header content. 
   * 
   * @returns {TemplatedComponent | undefined}
   * 
   * @virtual
   * @protected
   */
  getAdditionalHeaderContent() {
    return undefined;
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

  /**
   * Adds the given definitions' view models as accessible properties on *this* view 
   * model instance. 
   * 
   * @param {Array<TemplatedComponent> | undefined} definitions The definitions whose view models 
   * are to be added as properties. 
   * 
   * @private
   */
  _ensureViewModelsAsProperties(definitions = []) {
    for (const definition of definitions) {
      this[definition.viewModel._id] = definition.viewModel;
    }
  }
}
