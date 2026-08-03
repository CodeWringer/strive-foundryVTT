import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { DOCUMENT_CONTEXT } from "../../../model/document-context.mjs";
import InputImageViewModel from "../../component/input-image/input-image-viewmodel.mjs";
import InputTextFieldViewModel from "../../component/input-textfield/input-textfield-viewmodel.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ViewModel, { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";

/**
 * Abstract base class for Item header view models. By default, defines a view model for GM notes. 
 * 
 * The templating is a bit more complicated - `BaseItemHeaderViewModel.TEMPLATE` is used for the 
 * general layout of the header template, and inheritors who override `TEMPLATE` provide custom 
 * header content, which is then inserted into this layout. As such, inheritors MUST NOT provide 
 * their own wrapper element. So, instead of: 
 * 
 * ```html
 * <div id="{{viewModel.id}}"> <!-- Bad! Do not provide this wrapper! -->
 *   <a id={{viewModel.id}}-button>Click me!</a>
 * </div>
 * ```
 * 
 * provide only the header content:
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
export default class BaseItemHeaderViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.item.base.header; }

  /** @override */
  get clazz() { return BaseItemHeaderViewModel; }

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
   * @param {Boolean | undefined} args.isEditable If true, the sheet is in edit mode. 
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

    this.vmImg = new InputImageViewModel({
      id: "vmImg",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.general.image"),
      }),
      value: this.document.img,
      onChange: (_, newValue) => {
        this.document.img = newValue;
      },
    });
    this.vmName = new InputTextFieldViewModel({
      id: "vmName",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.general.name.documentName"),
      }),
      value: this.document.name,
      onChange: (_, newValue) => {
        this.document.name = newValue;
      },
      onClickInReadMode: this.context === DOCUMENT_CONTEXT.embedded ? () => {
        // TODO
      } : null,
    });
  }
}
