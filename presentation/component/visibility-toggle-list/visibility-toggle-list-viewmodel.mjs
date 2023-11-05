import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";
import VisibilityToggleListItemViewModel from "./visibility-toggle-list-item-viewmodel.mjs";

/**
 * Represents a visibility list item. 
 * 
 * @property {String} id Unique ID of this entry. 
 * @property {String} localizedName A localized name for display. 
 * @property {Boolean} value Gets or sets the value. 
 */
export class VisibilityToggleListItem {
  /**
   * @param {Object} args 
   * @param {String} args.id Unique ID of this entry. 
   * @param {String} args.localizedName A localized name for display. 
   * @param {Boolean | undefined} args.value The initial value. 
   * * Default `false`
   */
  constructor(args = {}) {
    validateOrThrow(args, ["id", "localizedName"]);

    this.id = args.id;
    this.localizedName = args.localizedName;
    this.value = args.value ?? false;
  }

  /**
   * Returns a new view model instance representing this type. 
   * 
   * @param {VisibilityToggleListViewModel} parent 
   * 
   * @returns {VisibilityToggleListItemViewModel}
   */
  getViewModel(parent) {
    return new VisibilityToggleListItemViewModel({
      id: this.id,
      parent: parent,
      value: this.value,
      localizedLabel: this.localizedName,
    });
  }
}

/**
 * @property {String} id Unique ID of this view model instance. 
 * @property {Boolean} isEditable If `true`, input(s) will 
 * be in edit mode. If `false`, will be in read-only mode.
 * 
 * @property {String | undefined} localizedToolTip A localized text to 
 * display as a tool tip. 
 * @property {String | undefined} iconHtml Raw HTML to render as 
 * an associated icon. E. g. `'<i class="fas fa-scroll"></i>'`
 * @property {String} localizedValue The current value, localized. 
 * * Read-only
 * @property {JQuery | HTMLElement} element The DOM element that is 
 * associated with this view model. 
 * * Read-only
 * 
 * @property {String} itemTemplate
 * * Read-only
 * @property {Array<VisibilityToggleListItemViewModel>} itemViewModels
 * * Read-only
 * @property {Array<VisibilityToggleListItem>} value
 * 
 * @method onChange Callback that is invoked when the value changes. 
 * Receives the following arguments: 
 * * `oldValue: {Array<VisibilityToggleListItem>}`
 * * `newValue: {Array<VisibilityToggleListItem>}`
 * 
 * @extends InputViewModel
 */
export default class VisibilityToggleListViewModel extends InputViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.COMPONENT_VISIBILITY_TOGGLE_LIST; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('visibilityToggleList', `{{> "${VisibilityToggleListViewModel.TEMPLATE}"}}`);
  }

  get itemTemplate() { return VisibilityToggleListItemViewModel.TEMPLATE; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If `true`, input(s) will 
   * be in edit mode. If `false`, will be in read-only mode.
   * * default `false`. 
   * 
   * @param {String | undefined} args.localizedToolTip A localized text to 
   * display as a tool tip. 
   * @param {String | undefined} args.iconHtml Raw HTML to render as 
   * an associated icon. E. g. `'<i class="fas fa-scroll"></i>'`
   * @param {Function | undefined} args.onChange Callback that is invoked 
   * when the value changes. Receives two arguments: 
   * * `oldValue: {Array<VisibilityToggleListItem>}`
   * * `newValue: {Array<VisibilityToggleListItem>}`
   * 
   * @param {Array<VisibilityToggleListItem> | undefined} args.value 
   * The current list of items. 
   */
  constructor(args = {}) {
    super(args);

    this._value = args.value ?? [];
    this.itemViewModels = [];
    this.itemViewModels = this._getItemViewModels();
  }

  /** @override */
  update(args) {
    for (const vm of this.itemViewModels) {
      vm.dispose();
    }
    this.itemViewModels = [];
    this.itemViewModels = this._getItemViewModels();

    super.update(args);
  }

  /**
   * @returns {Array<VisibilityToggleListItemViewModel>}
   * 
   * @private
   */
  _getItemViewModels() {
    return this.value.map(item => {
      const vm = item.getViewModel(this);
      vm.onChange = (oldItemValue, newItemValue) => {
        const oldItemArray = this.value.concat([]);
        const index = oldItemArray.findIndex(it => it.id === item.id)
        oldItemArray[index] = new VisibilityToggleListItem({
          id: item.id,
          localizedName: item.localizedName,
          value: oldItemValue,
        });

        const newItemArray = this.value.concat([]);
        
        this.onChange(oldItemArray, newItemArray);
      };
      return vm;
    });
  }
}
