import ButtonViewModel from "../button/button-viewmodel.mjs";
import ConfirmablePlainDialog from "../../dialog/plain-confirmable-dialog/plain-confirmable-dialog.mjs";
import { StringUtil } from "../../../business/util/string-utility.mjs";
import { ValidationUtil } from "../../../business/util/validation-utility.mjs";

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
   * @param {String | undefined} args.localizedDeletionTarget The localized name of the thing 
   * to delete. 
   * * default is to use `target.name`. 
   * @param {String | undefined} args.localizedDeletionType The localized type of the thing 
   * to delete. 
   * @param {String | undefined} args.localizedToolTip A localized text to 
   * display as a tool tip. 
   * * default is to use the `localizedDeletionTarget` in a generic string or if that 
   * is undefined, to use a completley generic string. 
   * @param {String | undefined} args.localizedLabel A localized text to 
   * display as a button label. 
   * @param {Function | undefined} args.onClick Asynchronous callback that is invoked when the button is clicked. Arguments: 
   * * `event: Event`
   * * `data: undefined`
   * 
   * @param {TransientDocument} args.target The target object to affect. 
   * @param {String | undefined} args.propertyPath If not undefined, will try to delete by this property path. 
   * @param {Boolean | undefined} args.withDialog If `true`, will prompt the user to make a selection with a dialog. 
   * * default `true`
   */
  constructor(args = {}) {
    super({
      ...args,
      iconHtml: '<i class="fas fa-trash"></i>',
    });
    ValidationUtil.validateOrThrow(args, ["target"]);

    this.target = args.target;
    this.localizedDeletionTarget = args.localizedDeletionTarget ?? this.target.name;
    this.localizedDeletionType = args.localizedDeletionType;
    this.withDialog = args.withDialog ?? true;
    this.propertyPath = args.propertyPath;

    if (ValidationUtil.isDefined(this.localizedDeletionType)) {
      this.localizedToolTip = args.localizedToolTip ?? StringUtil.format(
        game.i18n.localize("system.general.delete.deleteTypeOf"), 
        this.localizedDeletionType, 
        this.localizedDeletionTarget
      );
      this.localizedDialogContent = StringUtil.format(
        game.i18n.localize("system.general.delete.queryTypeOf"), 
        this.localizedDeletionType, 
        this.localizedDeletionTarget
      );
    } else {
      this.localizedToolTip = args.localizedToolTip ?? StringUtil.format(
        game.i18n.localize("system.general.delete.deleteOf"), 
        this.localizedDeletionTarget
      );
      this.localizedDialogContent = StringUtil.format(
        game.i18n.localize("system.general.delete.queryOf"), 
        this.localizedDeletionTarget
      );
    }
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
