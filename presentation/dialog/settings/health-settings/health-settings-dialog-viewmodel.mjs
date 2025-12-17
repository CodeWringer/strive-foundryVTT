import SystemHealthConditionBroker from "../../../../business/ruleset/health/system-health-condition-broker.mjs";
import GameSystemWorldSettings from "../../../../business/setting/game-system-world-settings.mjs";
import { ValidationUtil } from "../../../../business/util/validation-utility.mjs";
import ButtonViewModel from "../../../component/button/button-viewmodel.mjs";
import VisibilityToggleListViewModel from "../../../component/visibility-toggle-list/visibility-toggle-list-viewmodel.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import { HealthConditionVisibilityItem } from "./health-settings-visibility-item.mjs";

/**
 * @extends ViewModel
 * 
 * @property {Object} stateSettings Represents the current health settings. 
 * * Has the following properties: 
 * * * `{Array<String>} hidden` - A list of health condition IDs to hide on character sheets. 
 * * Private
 * * Cached
 * @property {Array<ViewModel>} stateViewModels
 * @property {Array<HealthConditionVisibilityItem>} stateVisibilityItems
 */
export default class HealthStatesSettingsDialogViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.DIALOG_SETTINGS_HEALTH_CONDITIONS; }

  /**
   * @type {Array<HealthConditionVisibilityItem>}
   */
  get stateVisibilityItems() { return this._stateVisibilityItems; }
  set stateVisibilityItems(value) {
    this._stateVisibilityItems = value;

    this.stateSettings.hidden = [];
    for (const item of value) {
      if (item.value === false) {
        this.stateSettings.hidden.push(item.id);
      }
    }
    this._renderFormApplication();
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
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["formApplication"]);

    this.formApplication = args.formApplication;

    // Register cachable view state properties. 
    this.registerViewStateProperty("stateSettings");
    
    // Load state. 
    this.stateSettings = new GameSystemWorldSettings().get(GameSystemWorldSettings.KEY_HEALTH_SETTINGS);
    this.readAllViewState();

    // Prepare data for system default health state visibilities. 
    this._stateVisibilityItems = this._getHealthStateVisibilityViewModels();

    this.vmBtnSave = new ButtonViewModel({
      id: "vmBtnSave",
      parent: this,
      content: `<div class="flex flex-middle auto-margin-h-sm"><i class="fas fa-save"></i><span>${game.i18n.localize("system.settings.saveChanges")}</span></div>`,
      isEditable: this.isEditable,
      onClick: async () => {
        this.formApplication._saveSettings(this.stateSettings);
        this.formApplication.close();
      },
    });
    this.vmVisibilityList = new VisibilityToggleListViewModel({
      id: "vmVisibilityList",
      parent: this,
      value: this.stateVisibilityItems,
      onChange: (_, newValue) => {
        this.stateVisibilityItems = newValue;
      }
    });
  }

  /** @override */
  update(args = {}) {
    for (const vm of this._stateVisibilityItems) {
      vm.dispose();
    }
    this._stateVisibilityItems = this._getHealthStateVisibilityViewModels();
    
    super.update(args);
  }

  /**
   * @returns {Array<HealthConditionVisibilityItem>}
   * 
   * @private
   */
  _getHealthStateVisibilityViewModels() {
    const conditions = SystemHealthConditionBroker.conditions;
    const result = conditions.map(healthState => new HealthConditionVisibilityItem({
      id: healthState.name,
      localizedName: healthState.name,
      value: this.stateSettings.hidden.find(stateName => stateName === healthState.name) === undefined,
    }));
    return result;
  }

  /**
   * Writes all view state and then incites the owning form to re-render. 
   * 
   * @private
   */
  _renderFormApplication() {
    this.writeAllViewState();
    this.formApplication.render(true);
  }
}
