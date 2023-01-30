import { HEALTH_STATES } from "../../../../business/ruleset/health/health-states.mjs";
import LoadHealthStatesSettingUseCase from "../../../../business/use-case/load-health-states-setting-use-case.mjs";
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import ButtonViewModel from "../../../component/button/button-viewmodel.mjs";
import SimpleListViewModel from "../../../component/simple-list/simple-list-viewmodel.mjs";
import VisibilityToggleListViewModel, { VisibilityToggleListItem } from "../../../component/visibility-toggle-list/visibility-toggle-list-viewmodel.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";
import ViewModel from "../../../view-model/view-model.mjs";

/**
 * @extends ViewModel
 * 
 * @property {Array<ViewModel>} stateViewModels
 * @property {Array<VisibilityToggleListItem>} stateVisibilityItems
 * * Cached
 */
export default class HealthStatesSettingsDialogViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.DIALOG_SETTINGS_HEALTH_STATES; }

  get stateVisibilityItems() { return this._stateVisibilityItems; }
  set stateVisibilityItems(value) {
    this._stateVisibilityItems = value;
    this.writeAllViewState();
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
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["formApplication"]);

    this.formApplication = args.formApplication;

    this.registerViewStateProperty("stateVisibilityItems");
    
    // Build initial visibility states, based on the world setting. 
    const stateSettings = new LoadHealthStatesSettingUseCase().invoke();

    const states = HEALTH_STATES.asArray;
    this._stateVisibilityItems = states.map(healthState => new VisibilityToggleListItem({
      id: healthState.name,
      localizedName: game.i18n.localize(healthState.localizableName),
      value: stateSettings.hidden.find(stateName => stateName === healthState.name) === undefined,
    }));

    const thiz = this;

    this.vmBtnSave = new ButtonViewModel({
      id: "vmBtnSave",
      parent: this,
      isEditable: this.isEditable,
      onClick: async () => {
        const stateSettings = new LoadHealthStatesSettingUseCase().invoke();
        stateSettings.hidden = [];
        for (const item of thiz.stateVisibilityItems) {
          if (item.value === false) {
            stateSettings.hidden.push(item.id);
          }
        }
        thiz.formApplication._saveSettings(stateSettings);
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
      itemViewModels: ,
      itemTemplate: ,
      onAddClick: ,
      isItemAddable: ,
      isItemRemovable: ,
      localizedAddLabel: ,
    });

    // Lastly, read view state. 
    this.readViewState();
  }
}