import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";
import SimpleListItemViewModel from "./simple-list-item-viewmodel.mjs";

/**
 * Represents a simple item list in the sense that the presentation of 
 * individual items is entirely up to the user. 
 * 
 * @property {Array<SimpleListItemViewModel>} itemViewModels
 * @property {Array<ViewModel>} contentItemViewModels
 * @property {String} itemTemplate
 * * Read-only
 * @property {String} contentItemTemplate
 * @property {String} localizedAddLabel
 * @property {Boolean} isItemAddable
 * @property {Boolean} isItemRemovable
 * @property {ViewModel} vmBtnAddItem
 * 
 * @method onAddClick Invoked when the "add" button is clicked. 
 * * A user of this component is expected to instantiate and provide a new list item view model instance. 
 * @method onRemoveClick Invoked when the "remove" button is clicked. Arguments: 
 * * `{SimpleListItemViewModel} viewmodel` View model instance of the list item to remove. 
 * * `{Number} index` Index of the list item to remove. 
 * 
 * @extends ViewModel
 */
export default class SimpleListViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.COMPONENT_SIMPLE_LIST; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('simpleList', `{{> "${SimpleListViewModel.TEMPLATE}"}}`);
  }

  /**
   * @type {String}
   * @readonly
   */
  get itemTemplate() { return SimpleListItemViewModel.TEMPLATE; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * @param {Boolean | undefined} args.isSendable
   * @param {Boolean | undefined} args.isOwner
   * @param {String | undefined} args.contextTemplate Name or path of a template that embeds this input component. 
   * 
   * @param {Array<ViewModel>} args.contentItemViewModels 
   * @param {String} args.contentItemTemplate
   * @param {Function | undefined} args.onAddClick Invoked when the "add" button is clicked. 
   * * A user of this component is expected to instantiate and provide a new list item view model instance. 
   * @param {Function | undefined} args.onRemoveClick Invoked when the "remove" button is clicked. Arguments: 
   * * `{SimpleListItemViewModel} viewmodel` View model instance of the list item to remove. 
   * * `{Number} index` Index of the list item to remove. 
   * @param {Boolean | undefined} args.isItemAddable 
   * * Default `false`.
   * @param {Boolean | undefined} args.isItemRemovable 
   * * Default `false`.
   * @param {String | undefined} args.localizedAddLabel
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["contentItemViewModels", "contentItemTemplate"]);

    this.contentItemViewModels = args.contentItemViewModels;
    this.contentItemTemplate = args.contentItemTemplate;
    this.isItemAddable = args.isItemAddable ?? false;
    this.isItemRemovable = args.isItemRemovable ?? false;
    this.localizedAddLabel = args.localizedAddLabel ?? "";
    this.onAddClick = args.onAddClick ?? (() => {});
    this.onRemoveClick = args.onRemoveClick ?? (() => {});

    this.itemViewModels = [];
    this.itemViewModels = this._getItemViewModels();

    if (this.isItemAddable === true) {
      this.vmBtnAddItem = new ButtonViewModel({
        id: "vmBtnAddItem",
        parent: this,
        iconHtml: '<i class="fas fa-plus"></i>',
        localizedLabel: this.localizedAddLabel,
        isEditable: this.isEditable,
        onClick: this.onAddClick,
      });
    }
  }

  /** @override */
  update(args = {}) {
    // Remove current list of child view models. 
    for (const vm of this.itemViewModels) {
      vm.dispose();
    }
    // Generate new list of child view models. 
    this.itemViewModels = this._getItemViewModels();
  }

  /**
   * Returns simple list item view models, based on `this.contentItemViewModels`. 
   * 
   * @returns {Array<SimpleListItemViewModel>}
   * 
   * @private
   */
  _getItemViewModels() {
    const result = [];

    for (let i = 0; i < this.contentItemViewModels.length; i++) {
      const contentItemViewModel = this.contentItemViewModels[i];
      const vm = new SimpleListItemViewModel({
        id: `simpleListItem${i}`,
        parent: this,
        isEditable: this.isEditable,
        isSendable: this.isSendable,
        isOwner: this.isOwner,
        itemViewModel: contentItemViewModel,
        itemTemplate: this.contentItemTemplate,
        isRemovable: this.isItemRemovable,
        onRemoveClick: () => {
          this.onRemoveClick(vm, i);
        }
      });
      contentItemViewModel.parent = vm;
      result.push(vm);
    }

    return result;
  }
}
