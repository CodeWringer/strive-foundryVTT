import TransientDocument from "../../../../business/document/transient-document.mjs";
import { format } from "../../../../business/util/string-utility.mjs";
import { isDefined, validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import { getExtenders } from "../../../../common/extender-util.mjs";
import ButtonContextMenuViewModel from "../../../component/button-context-menu/button-context-menu-viewmodel.mjs";
import ButtonDeleteViewModel from "../../../component/button-delete/button-delete-viewmodel.mjs";
import ButtonSendToChatViewModel from "../../../component/button-send-to-chat/button-send-to-chat-viewmodel.mjs";
import ButtonViewModel from "../../../component/button/button-viewmodel.mjs";
import InputImageViewModel from "../../../component/input-image/input-image-viewmodel.mjs";
import InputRichTextViewModel from "../../../component/input-rich-text/input-rich-text-viewmodel.mjs";
import DynamicInputDefinition from "../../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import DynamicInputDialog from "../../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";
import { DYNAMIC_INPUT_TYPES } from "../../../dialog/dynamic-input-dialog/dynamic-input-types.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import { CONTEXT_TYPES } from "../../context-types.mjs";
import { DataFieldComponent } from "./datafield-component.mjs";
import { TemplatedComponent } from "./templated-component.mjs";

/**
 * Represents the abstract base class for all view models that represent 
 * a list item. 
 * 
 * @abstract Inheriting types should override: 
 * * `getDataFields`
 * * `getPrimaryHeaderButtons`
 * * `getSecondaryHeaderButtons`
 * * `getAdditionalContent`
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
  static get TEMPLATE() { return game.strive.const.TEMPLATES.BASE_LIST_ITEM; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * @type {String}
   * @readonly
   */
  get context() { return CONTEXT_TYPES.LIST_ITEM; }

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
    const expansionUpIndicatorElement = this.element.find(`#${this.id}-expansion-indicator-up`);
    const expansionDownIndicatorElement = this.element.find(`#${this.id}-expansion-indicator-down`);
    if (value === true) {
      contentElement.removeClass("hidden");
      contentElement.animate({
        height: "100%"
      }, 300, () => {
      });
      expansionUpIndicatorElement.removeClass("hidden");
      expansionDownIndicatorElement.addClass("hidden");
    } else {
      contentElement.animate({
        height: "0%"
      }, 300, () => {
        contentElement.addClass("hidden");
      });
      expansionUpIndicatorElement.addClass("hidden");
      expansionDownIndicatorElement.removeClass("hidden");
    }
  }

  /**
   * Returns `true`, if the expansion controls should be enabled. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get enableExpansion() {
    const dataFields = (this.dataFields ?? []);
    return (dataFields.length > 0 && dataFields.find(it => it.isHidden === false) !== undefined)
      || this.additionalContent !== undefined;
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
   * @param {String | undefined} args.title
   * * default `args.document.name`
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);

    this.registerViewStateProperty("_isExpanded");

    this.document = args.document;
    this.title = args.title ?? args.document.name;

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
    
    this.additionalContent = this.getAdditionalContent();
    if (isDefined(this.additionalContent)) {
      this._ensureViewModelsAsProperties([this.additionalContent]);
    }

    this.vmImg = new InputImageViewModel({
      parent: this,
      id: "vmImg",
      value: this.document.img,
      onChange: (_, newValue) => {
        this.document.img = newValue;
      },
    });
    if (this.enableExpansion === true) {
      this.vmHeaderButton = new ButtonViewModel({
        id: "vmHeaderButton",
        parent: this,
        localizedLabel: this.title,
        onClick: () => {
          this.isExpanded = !this.isExpanded;
        },
        isEditable: true, // Even those without editing right should be able to see nested content. 
      });
    }
    this.vmRtDescription = new InputRichTextViewModel({
      parent: this,
      id: "vmRtDescription",
      value: this.document.description,
      onChange: (_, newValue) => {
        this.document.description = newValue;
      },
    });
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    if (this.isEditable === true) {
      new ContextMenu(html, `#${this.id}-name-area`, [
        {
          name: game.i18n.localize("system.general.name.edit"),
          icon: '<i class="fas fa-edit"></i>',
          callback: this.queryEditName.bind(this),
        },
      ]);
    }
  }

  /**
   * Returns the data field definitions that will be rendered as two fields 
   * per row, in the collapsible content area. 
   * 
   * @returns {Array<DataFieldComponent>}
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
          localizedToolTip: game.i18n.localize("system.general.sendToChat"),
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
          localizedToolTip: game.i18n.localize("system.general.contextMenu"),
          menuItems: [
            // Edit name
            {
              name: game.i18n.localize("system.general.name.edit"),
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
          localizedToolTip: game.i18n.localize("system.general.delete.label"),
        }),
      }),
    ]; 
  }
  
  /**
   * Returns the definition of the additional header content, if there is one. 
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
   * Returns the definition of the additional content, if there is one. 
   * 
   * @returns {TemplatedComponent | undefined}
   * 
   * @virtual
   * @protected
   */
  getAdditionalContent() {
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
      localizedTitle: `${format(game.i18n.localize("system.general.name.editOf"), this.title)}`,
      inputDefinitions: [
        new DynamicInputDefinition({
          type: DYNAMIC_INPUT_TYPES.TEXTFIELD,
          name: inputName,
          localizedLabel: game.i18n.localize("system.general.name.label"),
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
   * Returns the root owning document of the list item, if it has one. 
   * Otherwise, returns the list item itself.  
   * 
   * @returns {TransientDocument}
   * 
   * @protected
   */
  getRootOwningDocument() {
    if (this.document.owningDocument !== undefined) {
      return this.document.owningDocument;
    } else {
      return this.document;
    }
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
      // Check to prevent recursive self-adding. 
      // This is a risk for additional content, which may 
      // reference *this* view model instance. 
      if (definition.viewModel == this) continue;

      // Add the property to *this* view model instance. 
      this[definition.viewModel._id] = definition.viewModel;
    }
  }
  
  /** @override */
  getExtenders() {
    return super.getExtenders().concat(getExtenders(BaseListItemViewModel));
  }

}
