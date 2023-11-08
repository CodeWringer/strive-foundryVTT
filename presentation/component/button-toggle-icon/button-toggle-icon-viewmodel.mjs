import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";

/**
 * A button that allows toggling a specific boolean value. 
 * 
 * Toggles between two given icons, based on the boolean value. 
 * 
 * @extends InputViewModel
 * 
 * @property {Boolean} value The value of the boolean property. 
 * @property {String} iconActive An HTML-String of the "active" icon. 
   * * E. g. `"<i class="fas fa-eye"></i>"`
 * @property {String} iconInactive An HTML-String of the "inactive" icon. 
   * * E. g. `"<i class="fas fa-eye-slash"></i>"`
 * 
 * @method onChange Callback that is invoked when the value changes. 
 * Receives the following arguments: 
 * * `oldValue: {Boolean}`
 * * `newValue: {Boolean}`
 */
export default class ButtonToggleIconViewModel extends InputViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_BUTTON_TOGGLE_ICON; }
  
  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
  */
 static registerHandlebarsPartial() {
    Handlebars.registerPartial('buttonToggleIcon', `{{> "${ButtonToggleIconViewModel.TEMPLATE}"}}`);
  }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * 
   * @param {Boolean | undefined} args.value The current value. 
   * * default `false` 
   * @param {Function | undefined} args.onChange Callback that is invoked 
   * when the value changes. Receives two arguments: 
   * * `oldValue: {String}`
   * * `newValue: {String}`
   * @param {String} args.iconActive An HTML-String of the "active" icon. 
   * * E. g. `"<i class="fas fa-eye"></i>"`
   * @param {String} args.iconInactive An HTML-String of the "inactive" icon. 
   * * E. g. `"<i class="fas fa-eye-slash"></i>"`
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["iconActive", "iconInactive"]);

    this._value = args.value ?? false;
    this.iconActive = args.iconActive;
    this.iconInactive = args.iconInactive;

    this.vmButton = new ButtonViewModel({
      id: "vmButton",
      parent: this,
      iconHtml: this.value === true ? this.iconActive : this.iconInactive,
      localizedToolTip: args.localizedToolTip,
      onClick: () => {
        if (this.isEditable !== true) return;
    
        this.value = !this.value;
      }
    });
  }
}
