import { TEMPLATES } from "../../templates.mjs";
import DocumentViewModel from "../../view-model/document-viewmodel.mjs";
import ViewModel from "../../view-model/view-model.mjs";

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
 * @extends DocumentViewModel
 * 
 * @abstract Inheritors MUST override: 
 * * `static get TEMPLATE`
 * * `get clazz`
 */
export default class BaseItemContentViewModel extends DocumentViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.item.base.content; }

  /** @override */
  get clazz() { return BaseItemContentViewModel; }

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
  }
}
