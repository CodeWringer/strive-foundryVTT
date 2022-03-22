import { TEMPLATES } from "../../templatePreloader.mjs";
import { createUUID } from "../../utils/uuid-utility.mjs";
import { validateOrThrow } from "../../utils/validation-utility.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";

/**
 * --- Inherited from ViewModel
 * 
 * @property {JQuery | HTMLElement} element The button element on the DOM. 
 * @property {String} id Optional. Id used for the HTML element's id and name attributes. 
 * @property {String} TEMPLATE Static. Returns the template this ViewModel is intended for. 
 * 
 * --- Inherited from ButtonViewModel
 * 
 * @property {JQuery | HTMLElement} element The button element on the DOM. 
 * @property {Object} target The target object to affect.  
 * 
 * --- Own properties
 * 
 * @property {String} visGroup Id or name to group the visiblity of elements by. 
 * Expects this id to be defined as a data-attribute. 
 * E. g. '<div data-vis-group="1A2b3F4E">My content</div>'
 * @property {Boolean} toggleSelf If true, the button will also toggle visibility on itself. 
 */
export default class ButtonToggleVisibilityViewModel extends ButtonViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_BUTTON_TOGGLE_VISIBILITY; }

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
   * @param {Object} args.target The target object to affect. 
   * @param {Function | String | undefined} args.callback Optional. Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {Any | undefined} args.callbackData Optional. Defines any data to pass to the completion callback. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, will be interactible. 
   * 
   * @param {String} args.visGroup Id or name to group the visiblity of elements by. 
   * Expects this id to be defined as a data-attribute. 
   * E. g. '\<div data-vis-group="1A2b3F4E"\>My content\</div\>'
   * @param {Boolean | undefined} args.toggleSelf Optional. If true, the button will also toggle visibility on itself. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["visGroup"]);

    this._visGroup = args.visGroup ?? createUUID();
    this._toggleSelf = args.toggleSelf ?? false;
  }

  /**
   * @override
   * @see {ButtonViewModel.onClick}
   * @async
   */
  async onClick(html, isOwner, isEditable) {
    if (isEditable !== true) return;

    const elements = document.querySelectorAll("[data-vis-group='" + this._visGroup + "']");

    for(const element of elements) {
      element.classList.toggle("hidden");
    }
  }
}

Handlebars.registerHelper('createButtonToggleVisibilityViewModel', function(id, target, callback, callbackData, visGroup, toggleSelf) {
  return new ButtonToggleVisibilityViewModel({
    id: id,
    target: target,
    callback: callback,
    callbackData: callbackData,
    visGroup: visGroup,
    toggleSelf: toggleSelf,
  });
});
Handlebars.registerPartial('buttonToggleVisibility', `{{#> "${ButtonToggleVisibilityViewModel.TEMPLATE}"}}{{> @partial-block }}{{/"${ButtonToggleVisibilityViewModel.TEMPLATE}"}}`);
