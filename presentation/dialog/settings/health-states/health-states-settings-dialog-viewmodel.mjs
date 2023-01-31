import { HealthState, HEALTH_STATES } from "../../../../business/ruleset/health/health-states.mjs";
import LoadHealthStatesSettingUseCase from "../../../../business/use-case/load-health-states-setting-use-case.mjs";
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import ButtonViewModel from "../../../component/button/button-viewmodel.mjs";
import SimpleListViewModel from "../../../component/simple-list/simple-list-viewmodel.mjs";
import VisibilityToggleListViewModel, { VisibilityToggleListItem } from "../../../component/visibility-toggle-list/visibility-toggle-list-viewmodel.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import CustomHealthStateListItemViewModel from "./custom-health-state-list-item-viewmodel.mjs";

/**
 * @extends ViewModel
 * 
 * @property {Object} stateSettings
 * * Private
 * * Cached
 * @property {Array<ViewModel>} stateViewModels
 * @property {Array<VisibilityToggleListItem>} stateVisibilityItems
 * @property {Array<HealthState>} customHealthStates
 */
export default class HealthStatesSettingsDialogViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.DIALOG_SETTINGS_HEALTH_STATES; }

  /**
   * @type {Array<VisibilityToggleListItem>}
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
    this.writeAllViewState();
    this.formApplication.render();
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
      isEditable: this.isEditable,
      onClick: async () => {
        thiz.formApplication._saveSettings(this.stateSettings);
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
    this.vmCustomList = new SimpleListViewModel({
      id: "vmCustomList",
      parent: this,
      isEditable: this.isEditable,
      isSendable: this.isSendable,
      isOwner: this.isOwner,
      contentItemViewModels: this.customHealthStateViewModels,
      contentItemTemplate: this.customHealthStateListItemTemplate,
      onAddClick: this._onClickAddCustomHealthState,
      onRemoveClick: this._onClickRemoveCustomHealthState,
      isItemAddable: true,
      isItemRemovable: true,
      localizedAddLabel: game.i18n.localize("ambersteel.settings.healthStates.add.label"),
    });

    this.readViewState();
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
   * @returns {Array<VisibilityToggleListItem>}
   * 
   * @private
   */
  _getHealthStateVisibilityViewModels() {
    const states = HEALTH_STATES.asArray;
    const result = states.map(healthState => new VisibilityToggleListItem({
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
    const result = this.stateSettings.custom.map(name => 
      new CustomHealthStateListItemViewModel({
        id: name,
        parent: this,
        isEditable: this.isEditable,
      })
    );
    return result;
  }

  /**
   * @private
   */
  _onClickAddCustomHealthState() {
    throw new Error("NotImplementedException");
  }

  /**
   * @param {}
   * 
   * @private
   */
  _onClickRemoveCustomHealthState(viewModel) {
    throw new Error("NotImplementedException");
  }
}