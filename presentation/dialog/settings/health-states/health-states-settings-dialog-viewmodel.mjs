import { HEALTH_CONDITIONS } from "../../../../business/ruleset/health/health-states.mjs";
import GameSystemWorldSettings from "../../../../business/setting/game-system-world-settings.mjs";
import { ValidationUtil } from "../../../../business/util/validation-utility.mjs";
import ButtonViewModel from "../../../component/button/button-viewmodel.mjs";
import SimpleListViewModel from "../../../component/simple-list/simple-list-viewmodel.mjs";
import VisibilityToggleListViewModel from "../../../component/visibility-toggle-list/visibility-toggle-list-viewmodel.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import CustomHealthStateListItemViewModel from "./custom-health-state-list-item-viewmodel.mjs";
import { HealthStateVisibilityItem } from "./health-state-visibility-item.mjs";

/**
 * @extends ViewModel
 * 
 * @property {Object} stateSettings Represents the current health settings. 
 * * Has the following properties: 
 * * * `{Array<String>} hidden` - A list of health condition IDs to hide on character sheets. 
 * * * `{Array<Object>} custom` - A list of custom health conditions to add to character sheets. 
 * * Private
 * * Cached
 * @property {Array<ViewModel>} stateViewModels
 * @property {Array<HealthStateVisibilityItem>} stateVisibilityItems
 */
export default class HealthStatesSettingsDialogViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.DIALOG_SETTINGS_HEALTH_CONDITIONS; }

  /**
   * @type {Array<HealthStateVisibilityItem>}
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
   * @type {String}
   * @readonly
   */
  get customHealthStateListItemTemplate() { return CustomHealthStateListItemViewModel.TEMPLATE; }

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
    this.stateSettings = new GameSystemWorldSettings().get(GameSystemWorldSettings.KEY_CUSTOM_HEALTH_CONDITIONS);
    this.readAllViewState();

    // Prepare data for system default health state visibilities. 
    this._stateVisibilityItems = this._getHealthStateVisibilityViewModels();

    this.vmBtnSave = new ButtonViewModel({
      id: "vmBtnSave",
      parent: this,
      iconHtml: '<i class="fas fa-save"></i>',
      localizedLabel: game.i18n.localize("system.settings.saveChanges"),
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
    this.vmCustomList = new SimpleListViewModel({
      id: "vmCustomList",
      parent: this,
      value: this.stateSettings.custom,
      contentItemTemplate: this.customHealthStateListItemTemplate,
      contentItemViewModelFactory: (index, customHealthState) => {
        return new CustomHealthStateListItemViewModel({
          id: `vmAttribute${index}`,
          isEditable: this.isEditable,
          stateName: ((customHealthState ?? {}).name ?? customHealthState),
          stateLimit: ((customHealthState ?? {}).limit ?? 0),
        });
      },
      newItemDefaultValue: {
        name: game.i18n.localize("system.settings.healthConditions.newDefaultName"),
        limit: 0,
      },
      isItemAddable: true,
      isItemRemovable: true,
      localizedAddLabel: game.i18n.localize("system.settings.healthConditions.add.label"),
      onChange: (oldValue, newValue) => {
        this.stateSettings.custom = newValue;
        this._renderFormApplication();
      },
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

  /** @override */
  _getChildUpdates() {
    const updates = super._getChildUpdates();

    updates.set(this.vmCustomList, {
      ...updates.get(this.vmCustomList),
    });

    return updates;
  }

  /**
   * @returns {Array<HealthStateVisibilityItem>}
   * 
   * @private
   */
  _getHealthStateVisibilityViewModels() {
    const states = HEALTH_CONDITIONS.asArray();
    const result = states.map(healthState => new HealthStateVisibilityItem({
      id: healthState.name,
      localizedName: game.i18n.localize(healthState.localizableName),
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
