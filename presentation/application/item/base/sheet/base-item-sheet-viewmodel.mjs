import { VISIBILITY_MODES } from "../../../../../business/model/domain/const/visibility-modes.mjs";
import { StringUtil } from "../../../../../common/util/string-utility.mjs";
import { ValidationUtil } from "../../../../../common/util/validation-utility.mjs";
import { AnimationUtil } from "../../../../util/anim-utility.mjs";
import { ChatUtil } from "../../../../util/chat-utility.mjs";
import { ChoicesUtil } from "../../../../util/choices-utility.mjs";
import { KEY_CODES, MODIFIER_KEY_CODES } from "../../../../util/keyboard/key-codes.mjs";
import { KEYBOARD } from "../../../../util/keyboard/keyboard.mjs";
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
   * @type {Boolean}
   * @private
   */
  #isEditMode = false;
  /**
   * If true, the sheet can be edited. 
   * @type {Boolean}
   */
  get isEditMode() { return this.#isEditMode; }
  /**
   * If true, the sheet can be edited. 
   * @type {Boolean}
   * @private
   */
  set isEditMode(value) {
    this.#isEditMode = value;

    // Ensure edit mode is propagated to children. 
    if (ValidationUtil.isDefined(this.children)) {
      for (const child of this.children) {
        if (ValidationUtil.isDefined(child.isEditable)) {
          child.isEditable = this.#isEditMode;
        }
      }
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
   * @param {Boolean | undefined} args.isEditMode If true, the sheet can be edited. 
   * * default `false`
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["document"]);

    this.#isEditMode = args.isEditMode ?? false;
    this.document.isTransactionMode = this.#isEditMode;
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
   * Transitions to edit mode. 
   * @async
   */
  async enterEditMode() {
    if (this.isEditMode) return;
    this.isEditMode = true;

    const id = this.sheet.id;
    const enterModeButton = $(`#${id} button[data-action=enterEditMode]`);
    const exitModeButton = $(`#${id} button[data-action=saveEdits]`);
    const sendToChatButton = $(`#${id} button[data-action=sendToChat]`);
    AnimationUtil.slideDisplace({
      enteringElements: [exitModeButton],
      exitingElements: [enterModeButton],
    });
    AnimationUtil.slideOut({
      elements: [sendToChatButton],
    });
    this.#updateTitle();

    this.document.isTransactionMode = true;
    this.document.discardUpdates();
  }

  /**
   * Saves edits and transitions from edit mode. 
   * @async
   */
  async saveEdits() {
    if (!this.isEditMode) return;
    this.isEditMode = false;

    const id = this.sheet.id;
    const enterModeButton = $(`#${id} button[data-action=enterEditMode]`);
    const exitModeButton = $(`#${id} button[data-action=saveEdits]`);
    const sendToChatButton = $(`#${id} button[data-action=sendToChat]`);
    AnimationUtil.slideDisplace({
      enteringElements: [enterModeButton],
      exitingElements: [exitModeButton],
    });
    AnimationUtil.slideIn({
      elements: [sendToChatButton],
    });
    this.#updateTitle();

    this.document.isTransactionMode = false;
  }

  /** @override */
  dispose() {
    super.dispose();
    this.document.discardUpdates();
    this.document.isTransactionMode = false;
    KEYBOARD.offKeyDown(this._editHotKeyListenerId);
    KEYBOARD.offKeyDown(this._saveHotKeyListenerId);

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

  /** @override @inheritdoc */
  async activateListeners(html) {
    await super.activateListeners(html);

    // Ensure the correct button is visible.
    if (this.isEditMode) {
      $(`#${this.sheet.id} button[data-action=enterEditMode]`).addClass("hidden");
    } else {
      $(`#${this.sheet.id} button[data-action=saveEdits]`).addClass("hidden");
    }

    this._editHotKeyListenerId = KEYBOARD.onKeyDown({
      keyCode: KEY_CODES.E,
      modifier: MODIFIER_KEY_CODES.CTRL,
      handler: () => {
        this.enterEditMode();
      },
    });
    this._saveHotKeyListenerId = KEYBOARD.onKeyDown({
      keyCode: KEY_CODES.S,
      modifier: MODIFIER_KEY_CODES.CTRL,
      handler: () => {
        this.saveEdits();
      },
    });
  }

  /**
   * @private
   */
  async #updateTitle() {
    const titleElement = $(`form#${this.sheet.id}`).find("h1.window-title");
    const titleReplacement = $(`<h1 class="window-title">${this.sheet.title}</h1>`);
    $(titleReplacement).insertBefore(titleElement);
    
    await AnimationUtil.slideDisplace({
      enteringElements: [titleReplacement],
      exitingElements: [titleElement],
    }).then(() => {
      $(titleElement).remove();
    });
  }
}
