import * as StringUtil from "../../../business/util/string-utility.mjs"
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";
import ConfirmablePlainDialog from "../../dialog/plain-confirmable-dialog/plain-confirmable-dialog.mjs";

/**
 * A button that allows deleting a specific document. 
 * 
 * @extends ButtonViewModel
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
   * @param {TransientDocument} args.target The target object to affect. 
   * @param {Function | String | undefined} args.callback Optional. Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
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
   * @throws {Error} NullPointerException - Thrown, if trying to delete by property path and 'target.deleteByPath' is undefined. 
   */
  async onClick(html, isOwner, isEditable) {
    if (isEditable !== true) return;

    if (this.target === undefined) {
      throw new Error("NullPointerException: 'target' or 'target.type' is undefined");
    }
    
    if (this.withDialog === true) {
      const thiz = this;

      await new ConfirmablePlainDialog({
        localizedTitle: game.i18n.localize("ambersteel.general.delete.query"),
        localizedContent: StringUtil.format(game.i18n.localize(thiz.localizableDialogTitle), thiz.target.name),
        closeCallback: async (dialog) => {
          if (dialog.confirmed !== true) return;
          
          if (thiz.propertyPath !== undefined) {
            if (thiz.target.deleteByPath === undefined) {
              throw new Error("NullPointerException: 'target.deleteByPath' is undefined");
            }
            await thiz.target.deleteByPath(thiz.propertyPath);
          } else {
            await thiz.target.delete();
          }
        },
      }).renderAndAwait(true);
    } else {
      await this.target.delete();
    }
  }
}

Handlebars.registerPartial('buttonDelete', `{{> "${ButtonDeleteViewModel.TEMPLATE}"}}`);
