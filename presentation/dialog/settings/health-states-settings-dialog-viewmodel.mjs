import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import ButtonViewModel from "../../component/button/button-viewmodel.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import ViewModel from "../../view-model/view-model.mjs";

/**
 * @extends ViewModel
 * 
 * @property {Object} settings
 * @property {Array<String>} settings.hidden
 * @property {Array<Object>} settings.custom
 */
export default class HealthStatesSettingsDialogViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.DIALOG_SETTINGS_HEALTH_STATES; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Parent ViewModel instance of this instance. 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {formApplication} args.formApplication
   * @param {Object} args.settings
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["formApplication", "settings"]);

    this.formApplication = args.formApplication;
    this.settings = args.settings;

    const thiz = this;

    this.vmBtnSave = new ButtonViewModel({
      id: "vmBtnSave",
      parent: this,
      isEditable: this.isEditable,
      onClick: async () => {
        thiz.formApplication._saveSettings(thiz.settings);
        thiz.formApplication.close();
      },
    });
  }
}