import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";

/**
 * Represents a simple item list item. 
 * 
 * @property {ViewModel} itemViewModel The wrapped content view model. 
 * @property {String} itemTemplate Template path of the content. 
 * @property {Boolean} isRemovable If `true`, the item is removable. 
 * 
 * @extends ViewModel
 */
export default class SimpleListItemViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.COMPONENT_SIMPLE_LIST_ITEM; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * @param {String | undefined} args.contextTemplate Name or path of a template that embeds this input component. 
   * 
   * @param {ViewModel} args.itemViewModel The wrapped content view model. 
   * @param {String} args.itemTemplate Template path of the content. 
   * @param {Boolean | undefined} args.isRemovable If `true`, the item is removable. 
   * * Default `false`.
   * @param {Function | undefined} args.onRemoveClick Invoked when the "remove" button is clicked. 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["itemViewModel", "itemTemplate"]);

    this.itemViewModel = args.itemViewModel;
    this.itemTemplate = args.itemTemplate;
    this.isRemovable = args.isRemovable ?? false;
    this.onRemoveClick = args.onRemoveClick ?? (() => {});

    this.vmBtnRemove = new ButtonViewModel({
      id: "vmBtnRemove",
      parent: this,
      isEditable: this.isEditable,
      iconHtml: '<i class="fas fa-trash"></i>',
      localizedToolTip: game.i18n.localize("system.general.delete.delete"),
      onClick: this.onRemoveClick,
    });
  }
}