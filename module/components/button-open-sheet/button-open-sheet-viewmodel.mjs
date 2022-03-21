import { TEMPLATES } from "../../templatePreloader.mjs";
import { findDocument } from "../../utils/content-utility.mjs";
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
 */
export default class ButtonOpenSheetViewModel extends ButtonViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_BUTTON_OPEN_SHEET; }
  
  /**
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * 
   * @param {Object} args.target The target object to affect. 
   * @param {Function | String | undefined} args.callback Optional. Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {Any | undefined} args.callbackData Optional. Defines any data to pass to the completion callback. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["target"]);
  }

  /**
   * @override
   * @see {ButtonViewModel.onClick}
   * @async
   * @throws {Error} NullPointerException - Thrown, if 'target' is undefined. 
   * @throws {Error} NullPointerException - Thrown, if trying to delete by property path and 'target.deleteByPropertyPath' is undefined. 
   */
  async onClick(html, isOwner, isEditable) {
    if (isOwner !== true) return;

    if (this.target === undefined) {
      throw new Error("NullPointerException: 'target' or 'target.type' is undefined");
    }

    const toShow = await findDocument(this.target);
    if (toShow === undefined) return;
    toShow.sheet.render(true);
  }
}

Handlebars.registerHelper('createButtonOpenSheetViewModel', function(id, target, callback, callbackData) {
  return new ButtonOpenSheetViewModel({
    id: id,
    target: target,
    callback: callback,
    callbackData: callbackData,
  });
});
Handlebars.registerPartial('buttonOpenSheet', `{{> "${ButtonOpenSheetViewModel.TEMPLATE}"}}`);
