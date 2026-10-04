import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import ButtonDropDownViewModel from "../button-dropdown/button-dropdown-viewmodel.mjs";
import { DropDownOption } from "../button-dropdown/dropdown-option.mjs";

/**
 * Represents a simple item list item. 
 * 
 * @property {ViewModel} itemViewModel The wrapped content view model. 
 * @property {String} itemTemplate Template path of the content. 
 * @property {Boolean} isRemovable If `true`, the item is removable. 
 * 
 * @extends ViewModel
 */
export default class ListItemViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.list.item; }

  get showContextMenu() { return this.contextMenuOptions.length > 0; }

  /**
   * @param {Object} args
   * @param {Object} args.content
   * @param {String} args.content.template
   * @param {ViewModel} args.content.viewModel
   * @param {Array<DropDownOption> | undefined} args.contextMenuOptions
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["content"]);
    ValidationUtil.validateOrThrow(args.content, ["template", "viewModel"]);

    this.contentTemplate = args.content.template;
    this.contentViewModel = args.content.viewModel;
    this.contextMenuOptions = args.contextMenuOptions ?? [];

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