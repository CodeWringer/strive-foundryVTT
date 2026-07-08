import { TEMPLATES } from "../../templates.mjs"
import ViewModel from "../../view-model/view-model.mjs"
import DynamicComponent from "../dynamic-component/dynamic-component.mjs";
import { PreparedSectionViewModelUtility } from "../dynamic-component/prepared-section-viewmodel-utility.mjs";

/**
 * A composable row of a dynamic number of components. 
 * 
 * @extends ViewModel
 * 
 * @param {Array<DynamicComponent> | undefined} sections
 * 
 */
export default class RowViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.row; }
  
  /** @override */
  get clazz() { return RowViewModel; }

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
   * @param {Object | undefined} args.document An associated data document. 
   * @param {Boolean | undefined} args.visible
   * * default `true`
   * @param {ViewModelToolTipDefinition | undefined} args.toolTip Creates a tool tip definition.
   * 
   * @param {Array<DynamicComponent> | undefined} args.sections
   */
  constructor(args = {}) {
    super(args);

    this.sections = args.sections ?? [];
    PreparedSectionViewModelUtility.convertDynamicComponents(this, this.sections);
  }
}