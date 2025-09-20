import TransientDocument from "../../../../business/document/transient-document.mjs";
import { ValidationUtil } from "../../../../business/util/validation-utility.mjs";
import LazyRichTextViewModel from "../../../component/lazy-rich-text/lazy-rich-text-viewmodel.mjs";
import ViewModel from "../../../view-model/view-model.mjs";

export default class BaseChatMessageViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.BASE_CHAT_MESSAGE; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * Returns true, if the description is to be shown. 
   * 
   * @type
   * @protected
   * @readonly
   */
  get showDescription() { return true; }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {TransientDocument} args.document 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["document"]);

    this.document = args.document;

    this.vmLazyDescription = new LazyRichTextViewModel({
      id: "vmLazyDescription",
      parent: this,
      isEditable: this.isEditable,
      isSendable: this.isSendable,
      isOwner: this.isOwner,
      renderableContent: this.document.description,
    });

    this.dataFields = this.getDataFields();
    this._ensureViewModelsAsProperties(this.dataFields);

    this.additionalContent = this.getAdditionalContent();
    if (ValidationUtil.isDefined(this.additionalContent)) {
      this._ensureViewModelsAsProperties([this.additionalContent]);
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
  
}
