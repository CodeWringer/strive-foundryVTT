import { HEALTH_STATES } from "../../../../business/ruleset/health/health-states.mjs";
import LoadHealthStatesSettingUseCase from "../../../../business/use-case/load-health-states-setting-use-case.mjs";
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import ButtonViewModel from "../../../component/button/button-viewmodel.mjs";
import VisibilityToggleListViewModel, { VisibilityToggleListItem } from "../../../component/visibility-toggle-list/visibility-toggle-list-viewmodel.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";
import ViewModel from "../../../view-model/view-model.mjs";

/**
 * @extends ViewModel
 * 
 * @property {Object} settings
 * @property {Array<String>} settings.hidden
 * @property {Array<Object>} settings.custom
 * @property {Array<ViewModel>} stateViewModels
 * @property {Array<VisibilityToggleListItem>} stateVisibilityItems
 */
export default class HealthStatesSettingsDialogViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.DIALOG_SETTINGS_HEALTH_STATES; }

  get stateVisibilityItems() { return this._stateVisibilityItems; }
  set stateVisibilityItems(value) {
    this._stateVisibilityItems = value;
    this.formApplication.render();
  }

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
    
    // Build initial visibility states, based on the world setting. 
    const stateSettings = new LoadHealthStatesSettingUseCase().invoke();
    const hidden = stateSettings.hidden;

    const states = HEALTH_STATES.asArray;
    this._stateVisibilityItems = states.map(it => new VisibilityToggleListItem({
      id: it.name,
      localizedName: game.i18n.localize(it.localizableName),
      value: hidden.find(it => it === it.name) === undefined,
    }));

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
    this.vmVisibilityList = new VisibilityToggleListViewModel({
      id: "vmVisibilityList",
      parent: this,
      isEditable: this.isEditable,
      isSendable: this.isSendable,
      isOwner: this.isOwner,
      propertyOwner: this,
      propertyPath: "stateVisibilityItems",
    });
  }
}