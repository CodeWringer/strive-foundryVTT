import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { SlideDisplaceAnim } from "../../../animation/slide-displace-anim.mjs";
import { DOCUMENT_CONTEXT } from "../../../model/document-context.mjs";
import InputRichTextViewModel from "../../component/input-rich-text/input-rich-text-viewmodel.mjs";
import Tooltip from "../../component/tooltip/tooltip.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ViewModel, { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";

/**
 * Abstract base class for Item content view models. By default, defines a view model for GM notes. 
 * 
 * The templating is a bit more complicated - `BaseItemContentViewModel.TEMPLATE` is used for the 
 * general layout of the content template, and inheritors who override `TEMPLATE` provide custom 
 * content, which is then inserted into this layout. As such, inheritors MUST NOT provide their 
 * own wrapper element. So, instead of: 
 * 
 * ```html
 * <div id="{{viewModel.id}}"> <!-- Bad! Do not provide this wrapper! -->
 *   <a id={{viewModel.id}}-button>Click me!</a>
 * </div>
 * ```
 * 
 * provide only the content:
 * ```html
 * <a id={{viewModel.id}}-button>Click me!</a>
 * ```
 * 
 * @extends ViewModel
 * 
 * @abstract Inheritors MUST override: 
 * * `static get TEMPLATE`
 * * `get clazz`
 */
export default class BaseItemContentViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.item.base.content; }

  /** @override */
  get clazz() { return BaseItemContentViewModel; }

  /**
   * Returns `true`, if this is an embedded document. 
   * @type {Boolean}
   * @readonly
   */
  get isEmbedded() { return this.context === DOCUMENT_CONTEXT.embedded; }

  /**
   * Returns `true`, if this is an independent (i. e. not embedded) document. 
   * @type {Boolean}
   * @readonly
   */
  get isIndependent() { return this.context === DOCUMENT_CONTEXT.independent; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * 
   * @param {TransientBaseItem} args.document The represented transient document instance. 
   * @param {ActorSheet | ItemSheet} args.sheet The parent sheet instance. 
   * @param {DOCUMENT_CONTEXT | undefined} args.context Indicates whether this is an embedded or 
   * independent document. This affects interactibility. 
   * * default `DOCUMENT_CONTEXT.independent`
   */
  constructor(args = {}) {
    super(args);

    this.context = args.context ?? DOCUMENT_CONTEXT.independent;

    if (this.isGM) {
      this.vmGmNotes = new InputRichTextViewModel({
        id: "vmGmNotes",
        parent: this,
        isEditable: this.isEditable,
        value: this.document.gmNotes,
        onChange: (_, newValue) => {
          this.document.gmNotes = newValue;
        },
      });
    }
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    if (this.isGM) {
      this._gmNotesHiddenIndicatorSection = this.element.find(".gm-notes-hidden-indicator");
      this._gmNotesSection = this.element.find(".gm-notes");
      this._gmNotesButton = this.element.find(`a#${this.id}-gm-header`);
      this._gmNotesButton.click(() => {
        this.toggleGmNotes();
      });

      // Extra, to ensure the entire GM section has the tool tip. 
      this._gmNotesToolTip = new Tooltip({
        id: `${this.id}-gm-notes-tooltip`,
        content: StringUtil.getLoca("system.general.gm.gmNotesHidden"),
      });
      this._gmNotesToolTip.activateListeners(this.element.find(".gm-only"));
    }
  }

  /**
   * Toggles the visibility of the GM notes section. 
   * @protected
   * @async
   */
  async toggleGmNotes() {
    if (this._gmNotesSection.hasClass("hidden")) {
      // Show GM notes
      this._gmNotesSection.removeClass("hidden");
      await new SlideDisplaceAnim({
        displacingElement: this._gmNotesSection,
        displacedElement: this._gmNotesHiddenIndicatorSection,
      }).execute();
      this._gmNotesHiddenIndicatorSection.addClass("hidden");
      this._gmNotesToolTip.content = StringUtil.getLoca("system.general.gm.gmNotes");
    } else {
      // Hide GM notes
      this._gmNotesHiddenIndicatorSection.removeClass("hidden");
      await new SlideDisplaceAnim({
        displacingElement: this._gmNotesHiddenIndicatorSection,
        displacedElement: this._gmNotesSection,
      }).execute();
      this._gmNotesSection.addClass("hidden");
      this._gmNotesToolTip.content = StringUtil.getLoca("system.general.gm.gmNotesHidden");
    }
    
    if (this._gmNotesToolTip.visible) {
      this._gmNotesToolTip.show(); // Re-render.
    }
  }
}
