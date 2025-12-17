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
  get showIntensity() { return (this.limit !== 1) && (this.current > 0); }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {Number | undefined} args.current
   * @param {Number | undefined} args.limit
   * @param {String | undefined} args.img
   * @param {String | undefined} args.localizedName
   * @param {String | undefined} args.localizedToolTip
   * @param {Function | undefined} args.onChange Invoked when the current value changes. Arguments:
   * * `oldValue: Number`
   * * `newValue: Number`
   */
  constructor(args = {}) {
    super({
      ...args,
      localizedToolTip: args.localizedToolTip,
    });

    this.current = args.current ?? 0;
    this.limit = args.limit ?? 0;
    this.img = args.img;
    this.localizedName = args.localizedName;
    this.onChange = args.onChange ?? (() => {});

    this.vmToggle = new InputToggleViewModel({
      id: "vmToggle",
      parent: this,
      value: this.current > 0,
      onChange: (_, newValue) => {
        this.onChange(this.current, this.current > 0 ? 0 : 1);
      },
    });
    if (this.showIntensity === true) {
      this.vmIntensity = new InputNumberSpinnerViewModel({
        id: "vmIntensity",
        parent: this,
        value: this.current,
        onChange: (_, newValue) => {
          this.onChange(this.current, newValue);
        },
        min: 0,
        max: (this.limit > 0) ? this.limit : undefined,
      });
    }
  }

  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(HealthConditionListItemViewModel));
  }

}
