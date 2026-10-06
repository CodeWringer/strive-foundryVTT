import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import ButtonDropDownViewModel from "../button-dropdown/button-dropdown-viewmodel.mjs";
import { DropDownOption } from "../button-dropdown/dropdown-option.mjs";
import ListItem from "./list-item.mjs";

export default class ListItemViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.list.item; }

  /** @override */
  get clazz() { return ListItemViewModel; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get showContextMenu() { return this.contextMenuOptions.length > 0; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hasContent() { return ValidationUtil.isDefined(this.item.content); }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hasHeaderViewModel() { return ValidationUtil.isDefined(this.vmHeader); }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hasContentViewModel() { return ValidationUtil.isDefined(this.vmContent); }

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
   * @param {Boolean | undefined} args.showSecrets `true`, if GM or user-specific secrets contained by this 
   * view model are to be shown. 
   * * default `false`
   * 
   * @param {ListItem} args.item
   * @param {Array<DropDownOption> | undefined} args.contextMenuOptions
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["item"]);

    this.item = args.item;
    this.contextMenuOptions = args.contextMenuOptions ?? [];

    if (this.showContextMenu) {
      this.vmContextMenu = new ButtonDropDownViewModel({
        id: "context-menu",
        parent: this,
        options: this.contextMenuOptions,
        visible: false,
      });
    }
    if (ValidationUtil.isDefined(this.item.header.viewModelFactory)) {
      this.vmHeader = this.item.header.viewModelFactory(this);
    }
    if (ValidationUtil.isDefined(this.item.content) && ValidationUtil.isDefined(this.item.content.viewModelFactory)) {
      this.vmContent = this.item.content.viewModelFactory(this);
    }
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    if (ValidationUtil.isDefined(this.vmContextMenu)) {
      this.element.on("mouseenter", () => {
        this.vmContextMenu.visible = true;
      });
      this.element.on("mouseleave", () => {
        this.vmContextMenu.visible = false;
      });
    }
  }
}
