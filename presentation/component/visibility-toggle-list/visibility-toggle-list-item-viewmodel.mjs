import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";
import ButtonToggleIconViewModel from "../button-toggle-icon/button-toggle-icon-viewmodel.mjs";

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
 * @property {Boolean} value The current value. 
 * 
 * @method onChange Callback that is invoked when the value changes. 
 * Receives the following arguments: 
 * * `oldValue: {Boolean}`
 * * `newValue: {Boolean}`
 * 
 * @extends InputViewModel
 */
export default class VisibilityToggleListItemViewModel extends InputViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.COMPONENT_VISIBILITY_TOGGLE_LIST_ITEM; }

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
   * * `oldValue: {Boolean}`
   * * `newValue: {Boolean}`
   * 
   * @param {Boolean | undefined} args.value The current value. 
   * * default `false`
   * @param {String} args.localizedLabel A localized label for the state. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["localizedLabel"]);

    this.localizedLabel = args.localizedLabel;
    this._value = args.value ?? false;
    
    this.btnToggle = new ButtonToggleIconViewModel({
      id: "btnToggle",
      parent: this,
      isEditable: this.isEditable,
      isSendable: this.isSendable,
      isOwner: this.isOwner,
      iconActive: '<i class="fas fa-eye"></i>',
      iconInactive: '<i class="fas fa-eye-slash"></i>',
      onClick: () => {
        this.value = !this.value;
      },
    });
  }
}
