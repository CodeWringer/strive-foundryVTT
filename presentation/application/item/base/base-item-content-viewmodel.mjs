import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { DOCUMENT_CONTEXT } from "../../../model/document-context.mjs";
import InputRichTextViewModel from "../../component/input-rich-text/input-rich-text-viewmodel.mjs";
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
        toolTip: new ViewModelToolTipDefinition({
          localized: StringUtil.getLoca("system.general.gm.gmNotes"),
        }),
        value: this.document.gmNotes,
        onChange: (_, newValue) => {
          this.document.gmNotes = newValue;
        },
      });
    }
  }
}
