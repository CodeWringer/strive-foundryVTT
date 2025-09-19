import TransientHealthCondition from "../../../../business/document/item/transient-health-condition.mjs";
import { HEALTH_CONDITIONS } from "../../../../business/ruleset/health/health-conditions.mjs";
import { ValidationUtil } from "../../../../business/util/validation-utility.mjs";
import { ExtenderUtil } from "../../../../common/extender-util.mjs";
import InputNumberSpinnerViewModel from "../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputToggleViewModel from "../../../component/input-toggle/input-toggle-viewmodel.mjs";
import ViewModel from "../../../view-model/view-model.mjs";

/**
 * @property {TransientHealthCondition} document
 */
export default class HealthConditionListItemViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.HEALTH_CONDITION_LIST_ITEM; }

  /**
   * Returns true, if the condition can be incurred multiple times, which means the 
   * intensity number spinner should be visible. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get showIntensity() { return (this.document.limit !== 1) && (this.document.current > 0); }

  get localizedName() {
    const definedBySystem = HEALTH_CONDITIONS.asArray().find(it => it.name == this.document.name);
    if (ValidationUtil.isDefined(definedBySystem)) {
      return game.i18n.localize(definedBySystem.localizableName);
    } else {
      return this.document.name;
    }
  }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {TransientHealthCondition} args.document 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {String | undefined} args.visGroupId
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["document"]);

    this.localizedToolTip = game.i18n.localize(this.document.description);

    this.vmToggle = new InputToggleViewModel({
      id: "vmToggle",
      parent: this,
      value: this.document.current > 0,
      onChange: (_, newValue) => {
        this.document.current = this.document.current > 0 ? 0 : 1;
      },
    });
    if (this.showIntensity === true) {
      this.vmIntensity = new InputNumberSpinnerViewModel({
        id: "vmIntensity",
        parent: this,
        value: this.document.current,
        onChange: (_, newValue) => {
          this.document.current = newValue;
        },
        min: 0,
        max: (this.stateLimit > 0) ? this.stateLimit : undefined,
      });
    }
  }

  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(HealthConditionListItemViewModel));
  }

}
