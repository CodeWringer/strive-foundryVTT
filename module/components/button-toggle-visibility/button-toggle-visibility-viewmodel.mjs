import { TEMPLATES } from "../../templatePreloader.mjs";
import { createUUID } from "../../utils/uuid-utility.mjs";
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
   * @param {String | undefined} args.id
   * @param {Object  undefined} args.target The target object to affect.  
   * @param {Function | undefined} args.callback Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {Any} args.callbackData Defines any data to pass to the completion callback. 
   * 
   * @param {String | undefined} args.visGroup Id or name to group the visiblity of elements by. 
   * Expects this id to be defined as a data-attribute. 
   * E. g. '<div data-vis-group="1A2b3F4E">My content</div>'
   * @param {Boolean | undefined} args.toggleSelf If true, the button will also toggle visibility on itself. 
   */
  constructor(args = {}) {
    super(args);
    this._visGroup = args.visGroup ?? createUUID();
    this._toggleSelf = args.toggleSelf ?? false;
  }

  /**
   * @override
   * @see {ButtonViewModel.onClick}
   * @async
   */
  async onClick(html, isOwner, isEditable) {
    const elements = document.querySelectorAll("[data-vis-group='" + this._visGroup + "']");

    for(const element of elements) {
      element.classList.toggle("hidden");
    }
  }
}

Handlebars.registerHelper('createButtonToggleVisibilityViewModel', function(target, callback, callbackData, visGroup, toggleSelf) {
  const vm = new ButtonToggleVisibilityViewModel({
    target: target,
    callback: callback,
    callbackData: callbackData,
    visGroup: visGroup,
    toggleSelf: toggleSelf,
  });
  
  // Add new view model instance to global collection. 
  game.ambersteel.viewModels.set(vm.id, vm);
  
  return vm;
});
Handlebars.registerPartial('_buttonToggleVisibility', `{{#> "${ButtonToggleVisibilityViewModel.TEMPLATE}"}}{{> @partial-block }}{{/"${ButtonToggleVisibilityViewModel.TEMPLATE}"}}`);
Handlebars.registerPartial('buttonToggleVisibility', `{{> _buttonToggleVisibility vm=(createButtonToggleVisibilityViewModel target callback callbackData visGroup toggleSelf) cssClass=(isDefined cssClass "") }}`);
