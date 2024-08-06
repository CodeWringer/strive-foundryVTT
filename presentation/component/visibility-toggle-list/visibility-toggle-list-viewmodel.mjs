import { HealthStateVisibilityItem } from "../../dialog/settings/health-states/health-state-visibility-item.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";
import VisibilityToggleListItemViewModel from "./visibility-toggle-list-item-viewmodel.mjs";

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
 * @property {Array<HealthStateVisibilityItem>} value
 * 
 * @method onChange Callback that is invoked when the value changes. 
 * Receives the following arguments: 
 * * `oldValue: {Array<HealthStateVisibilityItem>}`
 * * `newValue: {Array<HealthStateVisibilityItem>}`
 * 
 * @extends InputViewModel
 */
export default class VisibilityToggleListViewModel extends InputViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.COMPONENT_VISIBILITY_TOGGLE_LIST; }

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
   * * `oldValue: {Array<HealthStateVisibilityItem>}`
   * * `newValue: {Array<HealthStateVisibilityItem>}`
   * 
   * @param {Array<HealthStateVisibilityItem> | undefined} args.value 
   */
  constructor(args = {}) {
    super(args);

    this._value = args.value ?? [];
    this.itemViewModels = this._getItemViewModels();
  }

  /** @override */
  update(args) {
    for (const vm of this.itemViewModels) {
      vm.dispose();
    }
    this.itemViewModels = this._getItemViewModels();

    super.update(args);
  }

  /**
   * @returns {Array<VisibilityToggleListItemViewModel>}
   * 
   * @private
   */
  _getItemViewModels() {
    return this.value.map(item => 
      new VisibilityToggleListItemViewModel({
        id: `${item.id}-toggle`,
        parent: this,
        value: item.value,
        localizedLabel: item.localizedName,
        onChange: (oldValue, newValue) => {
          // Preserve the old value for use by consumers of the onChange callback. 
          const oldItemArray = this.value.concat([]);
          const index = oldItemArray.findIndex(it => it.id === item.id)
          oldItemArray[index] = new HealthStateVisibilityItem({
            id: item.id,
            localizedName: item.localizedName,
            value: oldValue,
          });

          // Update the new value in the list. 
          const newItemArray = this.value.concat([]);
          newItemArray[index] = new HealthStateVisibilityItem({
            id: item.id,
            localizedName: item.localizedName,
            value: newValue,
          });

          this.onChange(oldItemArray, newItemArray);
        }
      })
    );
  }
}
