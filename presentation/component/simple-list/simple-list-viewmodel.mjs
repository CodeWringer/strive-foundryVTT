import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import FoundryWrapper from "../../../common/foundry-wrapper.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";
import SimpleListItemViewModel from "./simple-list-item-viewmodel.mjs";

/**
 * Represents a simple item list in the sense that the presentation of 
 * individual items is entirely up to the user. 
 * 
 * @property {Array<Any>} value
 * @property {String} itemTemplate
 * * Read-only
 * @property {String} contentItemTemplate
 * @property {String} localizedAddLabel
 * @property {Boolean} isItemAddable
 * @property {Boolean} isItemRemovable
 * @property {ViewModel} vmBtnAddItem
 * 
 * @method onChange Callback that is invoked when the value changes. 
 * Receives the following arguments: 
 * * `oldValue: {Any}`
 * * `newValue: {Any}`
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
   * Returns the current value. 
   * 
   * @type {Array<Any>}
   */
  get value() { return this._value; }
  /**
   * Sets the current value. 
   * 
   * @param {Array<Any>} newValue
   */
  set value(newValue) {
    const oldValue = this._value;
    this._value = newValue;
    this.onChange(oldValue, newValue);
  }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * @param {Boolean | undefined} args.isSendable
   * @param {Boolean | undefined} args.isOwner
   * @param {String | undefined} args.contextTemplate Name or path of a template that embeds this input component. 
   * 
   * @param {String} args.contentItemTemplate
   * @param {Function} args.contentItemViewModelFactory
   * @param {Any} args.newItemDefaultValue 
   * @param {Array<Any> | undefined} args.value
   * @param {Boolean | undefined} args.isItemAddable 
   * * Default `false`.
   * @param {Boolean | undefined} args.isItemRemovable 
   * * Default `false`.
   * @param {String | undefined} args.localizedAddLabel
   * 
   * @param {Function | undefined} args.onChange Callback that is invoked when the value changes. 
   * Receives the following arguments: 
   * * `oldValue: {Any}`
   * * `newValue: {Any}`
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["contentItemTemplate", "contentItemViewModelFactory", "newItemDefaultValue"]);

    this.contentItemTemplate = args.contentItemTemplate;
    this.contentItemViewModelFactory = args.contentItemViewModelFactory;
    this.newItemDefaultValue = args.newItemDefaultValue;
    this._value = args.value ?? [];
    this.isItemAddable = args.isItemAddable ?? false;
    this.isItemRemovable = args.isItemRemovable ?? false;
    this.localizedAddLabel = args.localizedAddLabel ?? "";
    this.onChange = args.onChange ?? (() => {});

    this.onAddClick = async () => {
      const index = this.value.length;
      const vm = this._generateItemViewModel(index, this.newItemDefaultValue);
      const renderedItem = await new FoundryWrapper().renderTemplate(SimpleListItemViewModel.TEMPLATE, {
        viewModel: vm,
      });
      const listElement = this.element.find(`#${this.id}-ul`);
      listElement.append(renderedItem);
      vm.activateListeners(listElement.find(`#${vm.id}`));

      this.value = this.value.concat(this.newItemDefaultValue);
    };
    this.onRemoveClick = (index, vm) => {
      const newValue = this.value.concat([]);
      newValue.splice(index, 1);

      this.element.find(`#${vm.id}`).remove();
      this.value = newValue;
    };

    this.itemViewModels = this._generateItemViewModels();

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
    this.itemViewModels = this._generateItemViewModels();
  }

  /**
   * @returns {Array<SimpleListItemViewModel>}
   * 
   * @private
   */
  _generateItemViewModels() {
    const result = [];

    for (let i = 0; i < this.value.length; i++) {
      const item = this.value[i];
      const vm = this._generateItemViewModel(i, item);
      result.push(vm);
    }

    return result;
  }

  /**
   * @param {Number} index 
   * @param {Any} item 
   * 
   * @returns {SimpleListItemViewModel}
   * 
   * @private
   */
  _generateItemViewModel(index, item) {
    const contentItemViewModel = this.contentItemViewModelFactory(index, item);
    if (ValidationUtil.isDefined(contentItemViewModel.onChange)) {
      contentItemViewModel.onChange = (newValue) => {
        const newValues = this.value.concat([]);
        newValues[index] = newValue;
        this.value = newValues;
      };
    }
    const vm = new SimpleListItemViewModel({
      id: `simpleListItem-${index}`,
      parent: this,
      isEditable: this.isEditable,
      isSendable: this.isSendable,
      isOwner: this.isOwner,
      itemViewModel: contentItemViewModel,
      itemTemplate: this.contentItemTemplate,
      isRemovable: this.isItemRemovable,
      onRemoveClick: () => {
        this.onRemoveClick(index, vm);
      }
    });
    contentItemViewModel.parent = vm;
    return vm;
  }

}
