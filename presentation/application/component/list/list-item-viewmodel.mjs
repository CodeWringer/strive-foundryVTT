import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import ButtonDropDownViewModel from "../button-dropdown/button-dropdown-viewmodel.mjs";
import { DropDownOption } from "../button-dropdown/dropdown-option.mjs";

/**
 * Represents a simple item list item. 
 * 
 * @property {ViewModel} contentViewModel The wrapped content view model. 
 * @property {Boolean} isRemovable If `true`, the item is removable. 
 * 
 * @extends ViewModel
 */
export default class ListItemViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.list.item; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hasContentViewModel() { return ValidationUtil.isDefined(this.contentViewModel); }
  
  /**
   * @type {Boolean}
   * @readonly
   */
  get showContextMenu() { return this.contextMenuOptions.length > 0; }
  
  /**
   * @type {Boolean}
   * @readonly
   */
  get hasHtml() { return ValidationUtil.isDefined(this.html); }

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
   * @param {Boolean | undefined} args.showSecrets `true`, if GM or user-specific secrets contained by this 
   * view model are to be shown. 
   * * default `false`
   * 
   * @param {ViewModel | undefined} args.contentViewModel
   * @param {Array<DropDownOption> | undefined} args.contextMenuOptions
   * @param {Boolean | undefined} args.isSeparator
   * * default `false`
   * @param {String | undefined} args.html
   */
  constructor(args = {}) {
    super(args);

    this.contentViewModel = args.contentViewModel;
    this.contextMenuOptions = args.contextMenuOptions ?? [];
    this.isSeparator = args.isSeparator ?? false;
    this.html = args.html;

    if (this.showContextMenu) {
      this.vmContextMenu = new ButtonDropDownViewModel({
        id: "context-menu",
        parent: this,
        options: this.contextMenuOptions,
        visible: this.showContextMenu,
      });
    }
  }
}