import { TEMPLATES } from "../../templatePreloader.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";
import { showConfirmationDialog } from "../../utils/dialog-utility.mjs";

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
 * @property {String | undefined} propertyPath If not undefined, will try to delete by this property path. 
 * @property {Boolean} withDialog If true, will prompt the user to confirm deletion with a dialog. 
 * 
 */
export default class ButtonDeleteViewModel extends ButtonViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_BUTTON_DELETE; }
  
  /**
   * @param {Boolean | undefined} args.isEditable 
   * @param {String | undefined} args.id
   * @param {Object} args.target The target object to affect.  
   * @param {Function | undefined} args.callback Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {Any} args.callbackData Defines any data to pass to the completion callback. 
   * 
   * @param {Boolean | undefined} args.withDialog If true, will prompt the user to make a selection with a dialog. 
   * @param {String | undefined} args.propertyPath If not undefined, will try to delete by this property path. 
   */
  constructor(args = {}) {
    super(args);
    this.withDialog = args.withDialog ?? false;
    this.propertyPath = args.propertyPath;
  }

  /**
   * @override
   * @see {ButtonViewModel.onClick}
   * @async
   * @throws {Error} NullPointerException - Thrown, if 'target' is undefined. 
   * @throws {Error} NullPointerException - Thrown, if trying to delete by property path and 'target.deleteByPropertyPath' is undefined. 
   */
  async onclick() {
    if (this.target === undefined) {
      throw new Error("NullPointerException: 'target' or 'target.type' is undefined");
    }

    if (this.withDialog === true) {
      const dialogResult = await showConfirmationDialog({
        localizableTitle: "ambersteel.dialog.titleConfirmDeletionQuery"
      });
      if (!dialogResult) return;
    }

    if (this.propertyPath !== undefined) {
      if (this.target.deleteByPropertyPath === undefined) {
        throw new Error("NullPointerException: 'target.deleteByPropertyPath' is undefined");
      }
      await this.target.deleteByPropertyPath(this.propertyPath);
    } else {
      await this.target.delete();
    }
  }
}

Handlebars.registerHelper('createButtonDeleteViewModel', function(isEditable, target, propertyPath, withDialog, callback, callbackData) {
  const vm = new ButtonDeleteViewModel({
    isEditable: isEditable,
    target: target,
    withDialog: withDialog,
    propertyPath: propertyPath,
    callback: callback,
    callbackData: callbackData,
  });
  
  // Add new view model instance to global collection. 
  game.ambersteel.viewModels.set(vm.id, vm);
  
  return vm;
});
Handlebars.registerPartial('_buttonDelete', `{{#> "${ButtonDeleteViewModel.TEMPLATE}"}}{{/"${ButtonDeleteViewModel.TEMPLATE}"}}`);
Handlebars.registerPartial('buttonDelete', `{{> _buttonDelete vm=(createButtonDeleteViewModel isEditable target propertyPath withDialog callback callbackData) cssClass=(isDefined cssClass "") }}`);
