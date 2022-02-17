import { TEMPLATES } from "../../templatePreloader.mjs";
import { findDocument } from "../../utils/content-utility.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";

/**
 * --- Inherited from ViewModel
 * 
 * @property {JQuery | HTMLElement} element The button element on the DOM. 
 * @property {Boolean} isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
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
 */
export default class ButtonOpenSheetViewModel extends ButtonViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_BUTTON_OPEN_SHEET; }
  
  /**
   * @param {Boolean | undefined} args.isEditable 
   * @param {String | undefined} args.id
   * @param {Object} args.target The target object to affect.  
   */
  constructor(args = {}) {
    super(args);
  }

  /**
   * @async
   * @throws {Error} NullPointerException - Thrown, if 'target' is undefined. 
   * @throws {Error} NullPointerException - Thrown, if trying to delete by property path and 'target.deleteByPropertyPath' is undefined. 
   */
  async callback() {
    if (this.target === undefined) {
      throw new Error("NullPointerException: 'target' or 'target.type' is undefined");
    }

    const toShow = await findDocument(this.target);
    if (toShow === undefined) return;
    toShow.sheet.render(true);
  }
}

Handlebars.registerHelper('createButtonOpenSheetViewModel', function(isEditable, target) {
  const vm = new ButtonOpenSheetViewModel({
    isEditable: isEditable,
    target: target,
  });
  
  // Add new view model instance to global collection. 
  game.ambersteel.viewModels.set(vm.id, vm);
  
  return vm;
});
Handlebars.registerPartial('_buttonOpenSheet', `{{#> "${ButtonOpenSheetViewModel.TEMPLATE}"}}{{/"${ButtonOpenSheetViewModel.TEMPLATE}"}}`);
Handlebars.registerPartial('buttonOpenSheet', `{{> _buttonOpenSheet vm=(createButtonOpenSheetViewModel isEditable target) cssClass=(isDefined cssClass "") readOnlyCssClass=(isDefined readOnlyCssClass "") }}`);
