import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import ButtonToggleIconViewModel from "../button-toggle-icon/button-toggle-icon-viewmodel.mjs";

/**
 * @summary
 * A button that allows toggling the visibility of DOM elements with a `data-vis-group` attribute. 
 * 
 * @description
 * Allows toggling the visibility of all DOM elements that have the attribute `data-vis-group`. 
 * 
 * The value of the attribute is expected to be a unique ID, which groups this button and the 
 * elements it target. Note it will target ALL elements, globally, that share the same 
 * ID! 
 * 
 * @extends ButtonToggleIconViewModel
 * 
 * @property {Boolean} value The current toggle state. 
 * * `false` is considered the default state, when no toggling has been done yet. 
 * * `true` is considered the activated state, when toggling has been done. 
 * @property {String} iconActive An HTML-String of the "active" icon. 
 * * E. g. `"<i class="fas fa-eye"></i>"`
 * @property {String} iconInactive An HTML-String of the "inactive" icon. 
 * * E. g. `"<i class="fas fa-eye-slash"></i>"`

 * @property {String} visGroup Id or name to group the visiblity of elements by. 
 * * Expects this id to be defined as a data-attribute. 
 * * E. g. `'<div data-vis-group="1A2b3F4E">My content</div>'`
 * 
 * @method onClick Asynchronous callback that is invoked when 
 * the button is clicked. Arguments: 
 * * `event: Event`
 * * `data: Boolean` - The current toggle state. 
 */
export default class ButtonToggleVisibilityViewModel extends ButtonToggleIconViewModel {
  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('buttonToggleVisibility', `{{> "${ButtonToggleVisibilityViewModel.TEMPLATE}"}}`);
  }

  /**
   * The attribute DOM-elements must possess, if they are to be targetable by the visibility 
   * toggle button. 
   * 
   * @type {String}
   * @static
   * @readonly
   */
  static get ATTRIBUTE_VIS_GROUP() { return "data-vis-group"; }

  /**
   * @type {String}
   * @private
   */
  _visGroup = undefined;
  /**
   * @type {String}
   * @readonly
   */
  get visGroup() { return this._visGroup; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * 
   * @param {Boolean | undefined} args.value The current value. 
   * * default `false` 
   * @param {String} args.iconActive An HTML-String of the "active" icon. 
   * * E. g. `"<i class="fas fa-eye"></i>"`
   * @param {String} args.iconInactive An HTML-String of the "inactive" icon. 
   * * E. g. `"<i class="fas fa-eye-slash"></i>"`
   * @param {Function | undefined} args.onClick Asynchronous callback that is invoked when 
   * the button is clicked. Arguments: 
   * * `event: Event`
   * * `data: Boolean` - The current toggle state. 
   * 
   * @param {String | undefined} args.visGroup Id or name to group the visiblity of elements by. 
   * Expects this id to be defined as a data-attribute. 
   * E. g. `<div data-vis-group="1A2b3F4E">My content</div>`. 
   */
  constructor(args = {}) {
    super({
      ...args,
      localizedToolTip: args.localizedToolTip ?? game.i18n.localize("system.general.toggleVisibility"),
    });
    ValidationUtil.validateOrThrow(args, ["visGroup"]);

    this._visGroup = args.visGroup;
  }

  /**
   * @param {Event} event
   * 
   * @async
   * @protected
   * @override
   */
  async _onClick(event) {
    super._onClick(event);

    if (this.isEditable !== true) return;

    const elements = document.querySelectorAll(`[${ButtonToggleVisibilityViewModel.ATTRIBUTE_VIS_GROUP}='${this._visGroup}']`);

    for (const element of elements) {
      element.classList.toggle("hidden");
    }

    return this.value;
  }
}
