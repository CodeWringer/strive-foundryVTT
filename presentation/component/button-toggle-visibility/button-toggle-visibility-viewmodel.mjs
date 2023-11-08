import { createUUID } from "../../../business/util/uuid-utility.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";

/**
 * The attribute DOM-elements must have, if they are to be targetable by the visibility 
 * toggle button. 
 * 
 * @type {String}
 * @constant
 */
export const ATTRIBUTE_VIS_GROUP = "data-vis-group";

/**
 * @summary
 * A button that allows toggling the visibility of DOM elements with a specific attribute. 
 * 
 * @description
 * Allows toggling the visibility of all DOM elements that have the attribute `data-vis-group`. 
 * 
 * The value of the attribute is expected to be a unique id, which groups this button and the 
 * elements it target. 
 * 
 * @extends ButtonViewModel
 * 
 * @property {String} visGroup Id or name to group the visiblity of elements by. 
 * * Expects this id to be defined as a data-attribute. 
 * * E. g. `'<div data-vis-group="1A2b3F4E">My content</div>'`
 * @property {Boolean} toggleSelf If true, the button will also toggle visibility on itself. 
 */
export default class ButtonToggleVisibilityViewModel extends ButtonViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_BUTTON_TOGGLE_VISIBILITY; }
  
  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('buttonToggleVisibility', `{{#> "${ButtonToggleVisibilityViewModel.TEMPLATE}"}}{{> @partial-block }}{{/"${ButtonToggleVisibilityViewModel.TEMPLATE}"}}`);
  }

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
   * @type {Boolean}
   * @private
   */
  _toggleSelf = undefined;
  /**
   * @type {Boolean}
   * @readonly
   */
  get toggleSelf() { return this._toggleSelf; }

  /**
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * 
   * @param {Object | undefined} args.target The target object to affect. 
   * @param {Function | String | undefined} args.callback Optional. Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, will be interactible. 
   * @param {String | undefined} args.localizedTooltip Localized tooltip. 
   * 
   * @param {String | undefined} args.visGroup Id or name to group the visiblity of elements by. 
   * Expects this id to be defined as a data-attribute. 
   * 
   * E. g. `<div data-vis-group="1A2b3F4E">My content</div>`. 
   * @param {Boolean | undefined} args.toggleSelf Optional. If true, the button will also toggle visibility on itself. 
   * * Default `false`. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["visGroup"]);

    this.target = args.target;
    this._visGroup = args.visGroup ?? createUUID();
    this._toggleSelf = args.toggleSelf ?? false;
    this.localizedTooltip = args.localizedTooltip ?? game.i18n.localize("ambersteel.general.toggleVisibility");
  }

  /**
   * @override
   * @see {ButtonViewModel.onClick}
   * @async
   */
  async onClick() {
    if (this.isEditable !== true) return;

    const elements = document.querySelectorAll(`[${ATTRIBUTE_VIS_GROUP}='${this._visGroup}']`);

    for(const element of elements) {
      element.classList.toggle("hidden");
    }
  }
}
