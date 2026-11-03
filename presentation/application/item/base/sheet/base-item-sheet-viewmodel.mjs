import { ValidationUtil } from "../../../../../common/util/validation-utility.mjs";
import { SlideDisplaceAnim } from "../../../../animation/slide-displace-anim.mjs";
import { SlideInAnim } from "../../../../animation/slide-in-anim.mjs";
import { SlideOutAnim } from "../../../../animation/slide-out-anim.mjs";
import { ChatUtil } from "../../../../util/chat-utility.mjs";
import { KEY_CODES, MODIFIER_KEY_CODES } from "../../../../util/keyboard/key-codes.mjs";
import { KEYBOARD } from "../../../../util/keyboard/keyboard.mjs";
import Tooltip from "../../../component/tooltip/tooltip.mjs";
import VisibilityChoiceDialog from "../../../dialog/visibility-choice-dialog/visibility-choice-dialog.mjs";
import { TEMPLATES } from "../../../templates.mjs";
import BaseSheetViewModel from "../../../view-model/base-sheet-viewmodel.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import BaseItemContentViewModel from "../base-item-content-viewmodel.mjs";
import BaseItemHeaderViewModel from "../base-item-header-viewmodel.mjs";

/**
 * Represents the abstract base class for all view models that represent 
 * an item sheet. 
 * 
 * @extends BaseSheetViewModel
 * 
 * @abstract Inheritors MUST override: 
 * * `get clazz`
 * * In the `constructor`, inheritors MUST provide: 
 * * * `headerViewModel: BaseItemHeaderViewModel`
 * * * `contentViewModel: BaseItemContentViewModel`
 * 
 * Inheritors MUST NOT override:
 * * `static get TEMPLATE`
 */
export default class BaseItemSheetViewModel extends BaseSheetViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.item.base.sheet; }

  /** @override */
  get clazz() { return BaseItemSheetViewModel; }

  /**
   * Returns the relative url of the header template. 
   * E. g. `TEMPLATES.application.item.language.header`
   * @type {String | undefined}
   * @readonly
   * @protected
   */
  get headerTemplate() { return BaseItemHeaderViewModel.TEMPLATE; }

  /**
   * Returns the relative url of the content template. 
   * E. g. `TEMPLATES.application.item.language.content`
   * @type {String | undefined}
   * @readonly
   * @protected
   */
  get contentTemplate() { return BaseItemContentViewModel.TEMPLATE; }

  /**
   * Returns the `ViewModel` instance of the header template.
   * @type {ViewModel}
   * @readonly
   * @protected
   */
  get headerViewModel() { return this._headerViewModel ?? this; }

  /**
   * Returns the `ViewModel` instance of the content template.
   * @type {ViewModel}
   * @readonly
   * @protected
   */
  get contentViewModel() { return this._contentViewModel ?? this; }

  /**
   * @param {Object} args The arguments object. 
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * 
   * If no value is provided, a shortened UUID will be generated for it. 
   * 
   * This string may not contain any special characters! Alphanumeric symbols, as well as hyphen ('-') and 
   * underscore ('_') are permitted, but no dots, brackets, braces, slashes, equal sign, and so on. Failing to comply to this 
   * naming restriction may result in DOM elements not being properly detected by the `activateListeners` method. 
   * @param {ViewModel | undefined} args.parent Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the view model data is editable.
   * * Default `false`. 
   * @param {Boolean | undefined} args.visible
   * * default `true`
   * @param {ViewModelToolTipDefinition | undefined} args.toolTip Creates a tool tip definition.
   * 
   * @param {TransientDocument} args.document An associated data document. 
   * 
   * @param {ActorSheet | ItemSheet} args.sheet The parent sheet instance. 
   * 
   * @param {BaseItemHeaderViewModel | undefined} args.headerViewModel
   * @param {BaseItemContentViewModel | undefined} args.contentViewModel
   */
  constructor(args = {}) {
    super(args);

    this.document.isBufferMode = this.isEditable;

    this._headerViewModel = args.headerViewModel;
    if (ValidationUtil.isDefined(this._headerViewModel)) {
      this._headerViewModel.parent = this;
    }

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
    if (this.isEditable || ValidationUtil.isDefined(this._stateChangeTimeout) || this.isLocked) return;
    this._stateChangeTimeout = setTimeout(() => {
      this._stateChangeTimeout = null;
    }, 300);

    this.isEditable = true;

    new SlideDisplaceAnim({
      displacingElement: this._exitModeButton,
      displacedElement: this._enterModeButton,
    }).execute();
    new SlideOutAnim({
      elm: this._sendToChatButton,
    }).execute();
    this.#updateTitle();

    this.document.isBufferMode = true;
    this.document.discardUpdates();
  }

  /**
   * Saves edits and transitions from edit mode. 
   * @async
   */
  async saveEdits() {
    if (!this.isEditable || ValidationUtil.isDefined(this._stateChangeTimeout) || this.isLocked) return;
    this._stateChangeTimeout = setTimeout(() => {
      this._stateChangeTimeout = null;
    }, 300);

    this.isEditable = false;

    new SlideDisplaceAnim({
      displacingElement: this._enterModeButton,
      displacedElement: this._exitModeButton,
    }).execute();
    new SlideInAnim({
      elm: this._sendToChatButton,
    }).execute();
    this.#updateTitle();

    await new Promise(resolve => setTimeout(resolve, 500));
    this.document.isBufferMode = false;
  }

  /** @override */
  dispose() {
    super.dispose();
    this.document.discardUpdates();
    this.document.isBufferMode = false;
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
    const dialog = await new VisibilityChoiceDialog().renderAndAwait();

    if (dialog.confirmed) {
      const visibilityMode = dialog.value;

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

    if ((this.isOwner || this.isGM) && !this.isLocked) {
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
        keyCodes: [KEY_CODES.E],
        modifier: MODIFIER_KEY_CODES.CTRL,
        handler: () => {
          this.enterEditMode();
        },
      });
      this._saveHotKeyListenerId = KEYBOARD.onKeyDown({
        keyCodes: [KEY_CODES.S],
        modifier: MODIFIER_KEY_CODES.CTRL,
        handler: () => {
          this.saveEdits();
        },
      });
    } else {
      this._enterModeButton.addClass("hidden");
      this._exitModeButton.addClass("hidden");
    }
  }

  /**
   * @private
   */
  async #updateTitle() {
    this._titleReplacement.text(this.sheet.title);

    await new SlideDisplaceAnim({
      displacingElement: this._titleReplacement,
      displacedElement: this._titleElement,
    }).execute();
    this._titleElement.text(this.sheet.title);
    this._titleElement.removeClass("hidden");
    this._titleReplacement.addClass("hidden");
  }
}
