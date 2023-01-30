import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
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
 * @extends ViewModel
 */
export default class SimpleListViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.COMPONENT_SIMPLE_LIST; }

  /**
   * @type {String}
   * @readonly
   */
  get itemTemplate() { return SimpleListItemViewModel.TEMPLATE; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * @param {String | undefined} args.contextTemplate Name or path of a template that embeds this input component. 
   * 
   * @param {Array<ViewModel>} args.itemViewModels 
   * @param {Function | undefined} args.onAddClick
   * @param {Boolean | undefined} args.isItemAddable 
   * * Default `false`.
   * @param {Boolean | undefined} args.isItemRemovable 
   * * Default `false`.
   * @param {String | undefined} args.localizedAddLabel
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["itemViewModels"]);

    this.itemViewModels = args.itemViewModels;
    this.isItemAddable = args.isItemAddable ?? false;
    this.isItemRemovable = args.isItemRemovable ?? false;
    this.localizedAddLabel = args.localizedAddLabel ?? "";
    this.onAddClick = args.onAddClick ?? this.onAddClick;

    const thiz = this;

    for(const viewModel of this.itemViewModels) {
      viewModel.onRemoveClick = () => {
        thiz.onRemoveClick(viewModel);
      }
    }

    if (this.isItemAddable === true) {
      this.vmBtnAddItem = new ButtonViewModel({
        id: "vmBtnAddItem",
        parent: this,
        isEditable: this.isEditable,
        onClick: this.onAddClick,
      });
    }
  }

  /**
   * Invoked when the "add" button is clicked. 
   * 
   * A user of this component is expected to instantiate and provide a new list item view model instance. 
   */
  onAddClick() { /* Implementation up to the user. */ }

  /**
   * Invoked when the "add" button is clicked. 
   * 
   * A user of this component is expected to instantiate and provide a new list item view model instance. 
   * 
   * @param {SimpleListItemViewModel} viewmodel The view model instance whose remove button was clicked. 
   */
  onRemoveClick(viewmodel) { /* Implementation up to the user. */ }
}

Handlebars.registerPartial('simpleList', `{{> "${SimpleListViewModel.TEMPLATE}"}}`);
