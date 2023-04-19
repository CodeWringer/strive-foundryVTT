import { getNestedPropertyValue, setNestedPropertyValue } from "../../../business/util/property-utility.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import ViewModel from "../../view-model/view-model.mjs";
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
}

/**
 * @property {String} itemTemplate
 * * Read-only
 * @property {Object} propertyOwner
 * * Read-only
 * @property {String} propertyPath
 * * Read-only
 * @property {Array<VisibilityToggleListItemViewModel>} itemViewModels
 * * Read-only
 * @property {Array<VisibilityToggleListItem>} value
 * 
 * @extends ViewModel
 */
export default class VisibilityToggleListViewModel extends ViewModel {
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
   * Gets or sets the value. 
   * 
   * @type {Array<VisibilityToggleListItem>}
   */
  get value() {
    return getNestedPropertyValue(this.propertyOwner, this.propertyPath);
  }
  set value(value) {
    setNestedPropertyValue(this.propertyOwner, this.propertyPath, value);
  }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Parent ViewModel instance of this instance. 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {Object} args.propertyOwner
   * @param {String} args.propertyPath
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["propertyOwner", "propertyPath"]);

    this.propertyOwner = args.propertyOwner;
    this.propertyPath = args.propertyPath;

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
    const result = [];

    const thiz = this;

    const items = this.value;
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const vm = new VisibilityToggleListItemViewModel({
        id: item.id,
        parent: this,
        isEditable: this.isEditable,
        isSendable: this.isSendable,
        isOwner: this.isOwner,
        propertyOwner: this,
        propertyPath: `value[${i}].value`, // This will not propagate as expected...
        localizedLabel: item.localizedName,
        onChange: () => {
          // Trigger an update of the property on the `propertyOwner`. 
          thiz.value = this.value;
        }
      });
      result.push(vm);
    }

    return result;
  }
}
