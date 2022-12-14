import * as StringUtil from "../../../business/util/string-utility.mjs"
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../template/templatePreloader.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";
import ConfirmablePlainDialog from "../../dialog/plain-confirmable-dialog/plain-confirmable-dialog.mjs";

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
 * @property {String} localizableTitle Localization key of the title of the dialog. 
 * 
 * --- Own properties
 * 
 * @property {String | undefined} propertyPath If not undefined, will try to delete by this property path. 
 * @property {Boolean} withDialog If true, will prompt the user to confirm deletion with a dialog. 
 * @property {String} localizableDialogTitle Localization key of the title of the dialog. 
 */
export default class ButtonDeleteViewModel extends ButtonViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_BUTTON_DELETE; }
  
  /**
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * 
   * @param {Object} args.target The target object to affect. 
   * @param {Function | String | undefined} args.callback Optional. Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {Any | undefined} args.callbackData Optional. Defines any data to pass to the completion callback. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, will be interactible. 
   * @param {String | undefined} args.localizableTitle Optional. The localizable title (tooltip). 
   * 
   * @param {String | undefined} args.propertyPath Optional. If not undefined, will try to delete by this property path. 
   * @param {Boolean | undefined} args.withDialog Optional. If true, will prompt the user to make a selection with a dialog. 
   * @param {String | undefined} args.localizableDialogTitle Optional. Localization key of the confirmation dialog window. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["target"]);

    this.withDialog = args.withDialog ?? false;
    this.propertyPath = args.propertyPath;
    this.localizableTitle = args.localizableTitle ?? "ambersteel.general.delete.label";
    this.localizableDialogTitle = args.localizableDialogTitle ?? "ambersteel.general.delete.queryOf";
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

    if (this.target === undefined) {
      throw new Error("NullPointerException: 'target' or 'target.type' is undefined");
    }
    
    if (this.withDialog === true) {
      const thiz = this;

      new ConfirmablePlainDialog({
        localizedTitle: game.i18n.localize("ambersteel.general.delete.query"),
        localizedContent: StringUtil.format(game.i18n.localize(thiz.localizableDialogTitle), thiz.target.name),
        closeCallback: async (dialog) => {
          if (dialog.confirmed !== true) return;
          
          if (thiz.propertyPath !== undefined) {
            if (thiz.target.deleteByPropertyPath === undefined) {
              throw new Error("NullPointerException: 'target.deleteByPropertyPath' is undefined");
            }
            await thiz.target.deleteByPropertyPath(thiz.propertyPath);
          } else {
            await thiz.target.delete();
          }
        },
      }).render(true);
    } else {
      await this.target.delete();
    }
  }
}

Handlebars.registerPartial('buttonDelete', `{{> "${ButtonDeleteViewModel.TEMPLATE}"}}`);
