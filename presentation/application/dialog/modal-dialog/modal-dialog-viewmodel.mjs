import { TEMPLATES } from "../../templates.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import DynamicComponent from "../../component/dynamic-component/dynamic-component.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import PreparedSection from "../../component/dynamic-component/prepared-section.mjs";

/**
 * Represents the abstract base class for all view models that represent 
 * an item sheet. 
 * 
 * @extends ViewModel
 * 
 * @abstract Inheritors MUST override: 
 * * `static get TEMPLATE`
 * * `get clazz`
 * 
 * @property {Array<DynamicComponent>} sections
 * @property {Array<PreparedSection>} preparedSections
 * @property {String | undefined} initialFocus
 */
export default class ModalDialogViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.dialog.modal; }

  /** @override */
  get clazz() { return ModalDialogViewModel; }

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
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document.
   * * Default `false`. 
   * @param {Map<String, Object>} args.viewStateSource The data source for view state objects. 
   * * Default `game.strive.viewStates`. 
   * @param {Object | undefined} args.document An associated data document. 
   * @param {String | undefined} args.localizedToolTip A localized text to 
   * display as a tool tip. 
   * @param {String | undefined} args.toolTipStyle A style override to attach to the tool tip's DOM element. 
   * E. g. `text-align: center`
   * @param {Boolean | undefined} args.visible
   * * default `true`
   * 
   * @param {Array<DynamicComponent> | undefined} args.sections
   * @param {String | undefined} args.initialFocus
   */
  constructor(args = {}) {
    super(args);

    this.sections = args.sections ?? [];
    this.preparedSections = this.sections.map(it => PreparedSection.fromDynamicComponent(it, this));
    for (const prepared of this.preparedSections) {
      if (ValidationUtil.isDefined(prepared.viewModel)) {
        this[prepared.viewModel._id] = prepared.viewModel;
      }
    }
    this.initialFocus = args.initialFocus;
  }

  async activateListeners(html) {
    await super.activateListeners(html);

    if (ValidationUtil.isDefined(this.initialFocus)) {
      const _findChildToFocus = (children) => {
        for (const child of children) {
          if (child._id == this.initialFocus) {
            return child;
          }
          const childOfChildToFocus = _findChildToFocus(child.children);
          if (ValidationUtil.isDefined(childOfChildToFocus)) {
            return childOfChildToFocus;
          }
        }
      }
      const childToFocus = _findChildToFocus(this.children);
      if (ValidationUtil.isDefined(childToFocus)) {
        childToFocus.element.focus();
      }
    } else if (this.children.length > 0) {
      this.children[0].element.focus();
    }
  }
}
