import { SYSTEM_ID } from "../../../../system-id.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";
import SetHealthStatesSettingUseCase from "../../../../business/use-case/set-health-states-setting-use-case.mjs";
import HealthStatesSettingsDialogViewModel from "./health-states-settings-dialog-viewmodel.mjs";
import FoundryWrapper from "../../../../common/foundry-wrapper.mjs";

/**
 * Represents a dialog for customizing character health states globally. 
 * 
 * @extends FormApplication
 */
export default class HealthStatesSettingsDialog extends FormApplication {
  /**
   * @returns {Object}
   * @override
   * @virtual
   */
  static get defaultOptions() {
    return new FoundryWrapper().mergeObject(super.defaultOptions, {
      classes: [SYSTEM_ID, "sheet"],
      width: 600,
      height: 480,
    });
  }

  /**
   * @type {HealthStatesSettingsDialogViewModel}
   * @private
   */
  _viewModel = undefined;
  /**
   * @type {HealthStatesSettingsDialogViewModel}
   * @readonly
   */
  get viewModel() { return this._viewModel; }

  /**
   * Returns the template path. 
   * @returns {String} Path to the template. 
   * @virtual
   * @override
   * @readonly
   */
  get template() { return TEMPLATES.DIALOG_SETTINGS_HEALTH_STATES; }

  /**
   * Returns the localized title of this sheet. 
   * @override
   * @type {String}
   * @readonly
   */
  get title() { return game.i18n.localize("system.settings.healthStates.label"); }

  /** @override */
  getData() {
    const context = super.getData();

    this._viewModel = new HealthStatesSettingsDialogViewModel({
      id: this.id,
      isEditable: true,
      isSendable: true,
      isOwner: true,
      contextTemplate: "HealthStatesSettingsDialog",
      formApplication: this,
    });
    context.viewModel = this._viewModel;
    this._viewModel.readAllViewState();

    return context;
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    await game.strive.logger.logPerfAsync(this, "HealthStatesSettingsDialog.activateListeners (viewModel)", async () => {
      await this.viewModel.activateListeners(html);
    });
  }

  /**
   * Internal method for saving the settings. 
   * 
   * This method is intended to be called by the view model's save button view model. 
   * 
   * @param {Object} settings 
   * @protected
   */
  _saveSettings(settings) {
    new SetHealthStatesSettingUseCase().invoke(settings);
  }
}