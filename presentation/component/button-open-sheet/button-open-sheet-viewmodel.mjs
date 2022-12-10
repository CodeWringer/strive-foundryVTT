import { findDocument } from "../../../business/util/content-utility.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../template/templatePreloader.mjs";
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
   * @param {Boolean | undefined} args.isEditable Optional. If true, will be interactible. 
   * @param {String | undefined} args.localizableTitle Optional. The localizable title (tooltip). 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["target"]);

    this.localizableTitle = args.localizableTitle ?? "ambersteel.general.openSheet";
  }

  /**
   * @override
   * @see {ButtonViewModel.onClick}
   * @async
   * @throws {Error} NullPointerException - Thrown, if 'target' is undefined. 
   * @throws {Error} NullPointerException - Thrown, if trying to delete by property path and 'target.deleteByPropertyPath' is undefined. 
   */
  async onClick(html, isOwner, isEditable) {
    if (isEditable !== true) return;

    const toShow = await findDocument({ id: this.target.id ?? this.target, name: this.target.name ?? undefined });
    if (toShow === undefined) {
      game.ambersteel.logger.logWarn(`NullPointerException: Failed to find document '${this.target}' to open sheet`);
      return;
    }
    toShow.sheet.render(true);
  }
}

Handlebars.registerPartial('buttonOpenSheet', `{{> "${ButtonOpenSheetViewModel.TEMPLATE}"}}`);
