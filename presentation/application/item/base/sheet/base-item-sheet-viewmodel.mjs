import { VISIBILITY_MODES } from "../../../../../business/model/domain/const/visibility-modes.mjs";
import { StringUtil } from "../../../../../common/util/string-utility.mjs";
import { ValidationUtil } from "../../../../../common/util/validation-utility.mjs";
import { SlideDisplaceAnim } from "../../../../animation/slide-displace-anim.mjs";
import { SlideInAnim } from "../../../../animation/slide-in-anim.mjs";
import { SlideOutAnim } from "../../../../animation/slide-out-anim.mjs";
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
 * * `get clazz`
 * * `get headerTemplate`
 * * `get contentTemplate`
 * 
 * Inheritors _should_ override:
 * `get contentViewModel`
 * 
 * @property {String} headerTemplate Returns the relative url of the header template. 
 * E. g. `TEMPLATES.application.item.language.header`
 * * Read-only
 * @property {String} contentTemplate Returns the relative url of the content template. 
 * E. g. `TEMPLATES.application.item.language.content`
 * * Read-only
 * @property {ViewModel} contentViewModel Returns the `ViewModel` instance of the 
 * content template.
 * * Read-only
 */
export default class BaseItemSheetViewModel extends BaseSheetViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.BASE_ITEM_SHEET; }

  /** @override */
  get clazz() { return BaseItemSheetViewModel; }

  /**
   * Returns the relative url of the header template. 
   * E. g. `TEMPLATES.application.item.language.header`
   * @type {String}
   * @readonly
   * @abstract
   */
  get headerTemplate() { throw new Error("Not implemented"); }

  /**
   * Returns the relative url of the content template. 
   * E. g. `TEMPLATES.application.item.language.content`
   * @type {String}
   * @readonly
   * @abstract
   */
  get contentTemplate() { throw new Error("Not implemented"); }

  /**
   * Returns the `ViewModel` instance of the content template.
   * @type {ViewModel}
   * @readonly
   * @virtual
   */
  get contentViewModel() { return this._contentViewModel ?? this; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is in edit mode. 
   * 
   * @param {TransientDocument} args.document The represented transient document instance. 
   * @param {ActorSheet | ItemSheet} args.sheet The parent sheet instance. 
   * @param {ViewModel | undefined} args.contentViewModel
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["document", "sheet"]);

    this.document.isTransactionMode = this.isEditable;
    this._contentViewModel = args.contentViewModel;
    if (ValidationUtil.isDefined(this._contentViewModel)) {
      this._contentViewModel.parent = this;
    }
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
    if (this.isEditable || ValidationUtil.isDefined(this._stateChangeTimeout)) return;
    this._stateChangeTimeout = setTimeout(() => {
      this._stateChangeTimeout = null;
    }, 300);

    this.isEditable = true;

    new SlideDisplaceAnim({
      elmA: this._exitModeButton,
      elmB: this._enterModeButton,
    }).execute();
    new SlideOutAnim({
      elm: this._sendToChatButton,
    }).execute();
    this.#updateTitle();

    this.document.isTransactionMode = true;
    this.document.discardUpdates();
  }

  /**
   * Saves edits and transitions from edit mode. 
   * @async
   */
  async saveEdits() {
    if (!this.isEditable || ValidationUtil.isDefined(this._stateChangeTimeout)) return;
    this._stateChangeTimeout = setTimeout(() => {
      this._stateChangeTimeout = null;
    }, 300);

    this.isEditable = false;

    new SlideDisplaceAnim({
      elmA: this._enterModeButton,
      elmB: this._exitModeButton,
    }).execute();
    new SlideInAnim({
      elm: this._sendToChatButton,
    }).execute();
    this.#updateTitle();

    await new Promise(resolve => setTimeout(resolve, 500));
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

    const sheetId = this.sheet.id;
    this._enterModeButton = $(`#${sheetId} button[data-action=enterEditMode]`);
    this._exitModeButton = $(`#${sheetId} button[data-action=saveEdits]`);
    this._sendToChatButton = $(`#${sheetId} button[data-action=sendToChat]`);

    if (this.isOwner || this.isGM) {
      this._titleElement = $(`form#${sheetId}`).find("h1.window-title");
      this._titleReplacement = $(`form#${sheetId}`).find("h1.window-title.anim-replacement");

      if (this._titleReplacement.length == 0) {
        this._titleReplacement = this._titleElement.clone();
        this._titleReplacement.addClass("hidden");
        this._titleReplacement.addClass("anim-replacement");
        this._titleReplacement.insertBefore(this._titleElement);
      }

      // Ensure initial button visibility.
      if (this.isEditable) {
        this._enterModeButton.addClass("hidden");
      } else {
        this._exitModeButton.addClass("hidden");
      }

      // Ensure hot-keys. 
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
    } else {
      this._enterModeButton.addClass("hidden");
      this._exitModeButton.addClass("hidden");
      this._sendToChatButton.addClass("hidden");
    }
  }

  /**
   * @private
   */
  async #updateTitle() {
    this._titleReplacement.text(this.sheet.title);

    await new SlideDisplaceAnim({
      elmA: this._titleReplacement,
      elmB: this._titleElement,
    }).execute();
    this._titleElement.text(this.sheet.title);
    this._titleElement.removeClass("hidden");
    this._titleReplacement.addClass("hidden");
  }
}
