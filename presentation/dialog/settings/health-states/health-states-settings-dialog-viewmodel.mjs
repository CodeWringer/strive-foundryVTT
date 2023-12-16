import { HEALTH_STATES } from "../../../../business/ruleset/health/health-states.mjs";
import LoadHealthStatesSettingUseCase from "../../../../business/use-case/load-health-states-setting-use-case.mjs";
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import ButtonViewModel from "../../../component/button/button-viewmodel.mjs";
import SimpleListItemViewModel from "../../../component/simple-list/simple-list-item-viewmodel.mjs";
import SimpleListViewModel from "../../../component/simple-list/simple-list-viewmodel.mjs";
import VisibilityToggleListViewModel from "../../../component/visibility-toggle-list/visibility-toggle-list-viewmodel.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import CustomHealthStateListItemViewModel from "./custom-health-state-list-item-viewmodel.mjs";
import { HealthStateVisibilityItem } from "./health-state-visibility-item.mjs";

/**
 * @extends ViewModel
 * 
 * @property {Object} stateSettings
 * * Private
 * * Cached
 * @property {Array<ViewModel>} stateViewModels
 * @property {Array<HealthStateVisibilityItem>} stateVisibilityItems
 * @property {Array<HealthState>} customHealthStates
 */
export default class HealthStatesSettingsDialogViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.DIALOG_SETTINGS_HEALTH_STATES; }

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
    validateOrThrow(args, ["formApplication"]);

    this.formApplication = args.formApplication;

    // Register cachable view state properties. 
    this.registerViewStateProperty("stateSettings");
    
    // Build initial visibility states, based on the world setting. 
    this.stateSettings = new LoadHealthStatesSettingUseCase().invoke();

    // Prepare data for system default health state visibilities. 
    this._stateVisibilityItems = this._getHealthStateVisibilityViewModels();

    // Prepare data for custom health states. 
    this.customHealthStateViewModels = [];
    this.customHealthStateViewModels = this._getCustomHealthStateViewModels();

    const thiz = this;

    this.vmBtnSave = new ButtonViewModel({
      id: "vmBtnSave",
      parent: this,
      iconHtml: '<i class="fas fa-save"></i>',
      localizedLabel: game.i18n.localize("ambersteel.settings.saveChanges"),
      isEditable: this.isEditable,
      onClick: async () => {
        thiz.formApplication._saveSettings(this.stateSettings);
        thiz.formApplication.close();
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
      isEditable: this.isEditable,
      isSendable: this.isSendable,
      isOwner: this.isOwner,
      contentItemViewModels: this.customHealthStateViewModels,
      contentItemTemplate: this.customHealthStateListItemTemplate,
      onAddClick: this._onClickAddCustomHealthState.bind(this),
      onRemoveClick: this._onClickRemoveCustomHealthState.bind(this),
      isItemAddable: true,
      isItemRemovable: true,
      localizedAddLabel: game.i18n.localize("ambersteel.settings.healthStates.add.label"),
    });
  }

  /** @override */
  update(args = {}) {
    for (const vm of this._stateVisibilityItems) {
      vm.dispose();
    }
    this._stateVisibilityItems = this._getHealthStateVisibilityViewModels();
    
    for (const vm of this.customHealthStateViewModels) {
      vm.dispose();
    }
    this.customHealthStateViewModels = this._getCustomHealthStateViewModels();

    super.update(args);
  }

  /** @override */
  _getChildUpdates() {
    const updates = super._getChildUpdates();

    updates.set(this.vmCustomList, {
      ...updates.get(this.vmCustomList),
      contentItemViewModels: this.customHealthStateViewModels,
    });

    return updates;
  }

  /**
   * @returns {Array<HealthStateVisibilityItem>}
   * 
   * @private
   */
  _getHealthStateVisibilityViewModels() {
    const states = HEALTH_STATES.asArray();
    const result = states.map(healthState => new HealthStateVisibilityItem({
      id: healthState.name,
      localizedName: game.i18n.localize(healthState.localizableName),
      value: this.stateSettings.hidden.find(stateName => stateName === healthState.name) === undefined,
    }));
    return result;
  }

  /**
   * @returns {Array<CustomHealthStateListItemViewModel>}
   * 
   * @private
   */
  _getCustomHealthStateViewModels() {
    const result = [];
    const thiz = this;

    for (let index = 0; index < this.stateSettings.custom.length; index++) {
      const customHealthState = this.stateSettings.custom[index];
      const vm = new CustomHealthStateListItemViewModel({
        id: `name${index}`,
        isEditable: this.isEditable,
        stateName: (customHealthState.name ?? customHealthState),
        stateLimit: (customHealthState.limit ?? 0),
        onChange: (state) => {
          this.stateSettings.custom[index] = state;
          thiz._renderFormApplication();
        }
      });
      result.push(vm);
    }
    return result;
  }

  /**
   * Writes all view state and then incites the owning form to re-render. 
   * 
   * @private
   */
  _renderFormApplication() {
    this.writeAllViewState();
    this.formApplication.render();
  }

  /**
   * Event handler for when a new custom health state is added. 
   * 
   * @private
   */
  _onClickAddCustomHealthState() {
    this.stateSettings.custom.push({
      name: "New Health State",
      limit: 0,
    });
    this._renderFormApplication();
  }

  /**
   * Event handler for when a custom health state is to be removed. 
   * 
   * @param {SimpleListItemViewModel} viewModel
   * 
   * @private
   */
  _onClickRemoveCustomHealthState(viewModel) {
    const index = this.customHealthStateViewModels.indexOf(viewModel.itemViewModel);
    this.stateSettings.custom.splice(index, 1);
    this._renderFormApplication();
  }
}