import LoadHealthStatesSettingUseCase from "../../../business/use-case/load-health-states-setting-use-case.mjs";

/**
 * Represents a dialog for customizing character health states globally. 
 * 
 * @extends FormApplication
 */
export default class HealthStatesSettingsDialog extends FormApplication {

  /** @override */
  getData() {
    return new LoadHealthStatesSettingUseCase().invoke();
  }

  /** @override */
  _updateObject(event, formData) {
    const data = expandObject(formData);
    game.settings.set('myModuleName', 'myComplexSettingName', data);
  }
}