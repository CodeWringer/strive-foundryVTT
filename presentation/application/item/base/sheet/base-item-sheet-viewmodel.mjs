import { VISIBILITY_MODES } from "../../../../../business/model/domain/const/visibility-modes.mjs";
import { StringUtil } from "../../../../../common/util/string-utility.mjs";
import { ValidationUtil } from "../../../../../common/util/validation-utility.mjs";
import { ChatUtil } from "../../../../util/chat-utility.mjs";
import { ChoicesUtil } from "../../../../util/choices-utility.mjs";
import DynamicComponent from "../../../component/dynamic-component/dynamic-component.mjs";
import InputDropDownViewModel from "../../../component/input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import Tooltip from "../../../component/tooltip/tooltip.mjs";
import ConfirmableModalDialog from "../../../dialog/confirmable-modal-dialog/confirmable-modal-dialog.mjs";
import BaseSheetViewModel from "../../../view-model/base-sheet-viewmodel.mjs";
import ViewModel from "../../../view-model/view-model.mjs";

/**
 * Represents the abstract base class for all view models that represent 
 * an item sheet. 
 * 
 * @extends BaseSheetViewModel
 * 
 * @abstract Inheritors MUST override: 
 * * `static get TEMPLATE`
 * * `get clazz`
 * 
 * @property {String} contentTemplate Returns the relative url of the content template. 
 * E. g. `TEMPLATES.application.item.language`
 * * Read-only
 * @property {Boolean} isEditMode If true, the sheet can be edited. 
 */
export default class BaseItemSheetViewModel extends BaseSheetViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.BASE_ITEM_SHEET; }

  /** @override */
  get clazz() { return BaseItemSheetViewModel; }

  /**
   * Returns the relative url of the content template. 
   * E. g. `TEMPLATES.application.item.language`
   * @type {String}
   * @readonly
   * @abstract
   */
  get contentTemplate() { throw new Error("Not implemented"); }

  /**
   * If true, the sheet can be edited. 
   * @type {Boolean}
   */
  get isEditMode() { return this._isEditMode; }
  set isEditMode(value) {
    this._isEditMode = value;

    // Ensure edit mode is propagated to children. 
    if (ValidationUtil.isDefined(this.children)) {
      for (const child of this.children) {
        if (ValidationUtil.isDefined(child.isEditable)) {
          child.isEditable = this._isEditMode;
        }
      }
    }

    this.document.isTransactionMode = value;
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
   * @param {Boolean | undefined} args.isEditMode If true, the sheet can be edited. 
   * * default `false`
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["document"]);

    this._isEditMode = args.isEditMode ?? false;
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

  /** @override */
  dispose() {
    super.dispose();
    this.document.discardUpdates();
    this.isEditMode = false;

    // An extremely aggressive band-aid solution. But, this ensures lingering tool tip elements 
    // with (at least partially) dynamic IDs are always cleared properly. 
    Tooltip.removeAllToolTipElements();
  }

  /**
   * Sends a link to the represented document to chat. 
   * @returns {Promise<void>}
   * @async
   */
  async sendToChat() {
    const visibilityModeOptions = ChoicesUtil.getAsChoices(VISIBILITY_MODES);
    const dialog = await new ConfirmableModalDialog({
      title: StringUtil.getLoca("system.general.messageVisibility.query"),
      sections: [
        new DynamicComponent({
          template: InputDropDownViewModel.TEMPLATE,
          viewModelFactory: (parent) => new InputDropDownViewModel({
            id: "vmVisibilityMode",
            parent: parent,
            options: visibilityModeOptions,
          }),
        }),
      ],
    }).renderAndAwait();

    if (dialog.confirmed) {
      const visibilityMode = VISIBILITY_MODES[dialog.viewModel.vmVisibilityMode.value.value];

      ChatUtil.sendToChat({
        renderedContent: `@UUID[Item.${this.document.id}]{${this.document.name}}`,
        visibilityMode: visibilityMode,
      });
    }
  }
}
