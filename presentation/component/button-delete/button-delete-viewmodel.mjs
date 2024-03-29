import * as StringUtil from "../../../business/util/string-utility.mjs"
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";
import ConfirmablePlainDialog from "../../dialog/plain-confirmable-dialog/plain-confirmable-dialog.mjs";

/**
 * A button that allows deleting a specific document. 
 * 
 * @extends ButtonViewModel
 * 
 * @property {String | undefined} propertyPath If not undefined, will try to delete by this property path. 
 * @property {Boolean} withDialog If true, will prompt the user to confirm deletion with a dialog. 
 * @property {String} localizedDialogContent Localized content of the confirmation dialog window. 
 * 
 * @method onClick Asynchronous callback that is invoked when the button is clicked. Arguments: 
 * * `event: Event`
 * * `data: undefined`
 */
export default class ButtonDeleteViewModel extends ButtonViewModel {
  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('buttonDelete', `{{> "${ButtonDeleteViewModel.TEMPLATE}"}}`);
  }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If true, will be interactible. 
   * @param {String | undefined} args.localizedToolTip A localized text to 
   * display as a tool tip. 
   * @param {String | undefined} args.localizedLabel A localized text to 
   * display as a button label. 
   * @param {Function | undefined} args.onClick Asynchronous callback that is invoked when the button is clicked. Arguments: 
   * * `event: Event`
   * * `data: undefined`
   * 
   * @param {TransientDocument} args.target The target object to affect. 
   * @param {String | undefined} args.propertyPath If not undefined, will try to delete by this property path. 
   * @param {Boolean | undefined} args.withDialog If true, will prompt the user to make a selection with a dialog. 
   */
  constructor(args = {}) {
    super({
      ...args,
      iconHtml: '<i class="fas fa-trash"></i>',
    });
    validateOrThrow(args, ["target"]);

    this.target = args.target;
    this.withDialog = args.withDialog ?? false;
    this.propertyPath = args.propertyPath;
    this.localizedTooltip = args.localizedTooltip ?? game.i18n.localize("system.general.delete.label");
    this.localizedDialogContent = StringUtil.format(game.i18n.localize("system.general.delete.queryOf"), this.target.name);
  }

  /**
   * @param {Event} event
   * 
   * @throws {Error} NullPointerException - Thrown, if 'target' is undefined. 
   * @throws {Error} NullPointerException - Thrown, if trying to delete by property path and 'target.deleteByPath' is undefined. 
   * 
   * @async
   * @protected
   * @override
   */
  async _onClick(event) {
    if (this.isEditable !== true) return;

    if (this.target === undefined) {
      throw new Error("NullPointerException: 'target' or 'target.type' is undefined");
    }
    
    if (this.withDialog === true) {
      const thiz = this;

      await new ConfirmablePlainDialog({
        localizedTitle: game.i18n.localize("system.general.delete.query"),
        localizedContent: this.localizedDialogContent,
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
