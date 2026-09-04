import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { ChoicesUtil } from "../../../util/choices-utility.mjs";
import InputDropDownViewModel from "../../component/input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ViewModel, { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";
import InputSplitNumberSpinnerViewModel from "../../component/input-split-number-spinner/input-split-number-spinner-viewmodel.mjs";
import { ILLNESS_STATES } from "../../../../business/model/domain/const/illness-states.mjs";
import BaseItemHeaderViewModel from "../base/base-item-header-viewmodel.mjs";

export default class IllnessHeaderViewModel extends BaseItemHeaderViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.item.illness.header; }

  /** @override */
  get clazz() { return IllnessHeaderViewModel; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is in edit mode. 
   * 
   * @param {TransientIllness} args.document The represented transient document instance. 
   * @param {ActorSheet | ItemSheet} args.sheet The parent sheet instance. 
   * @param {DOCUMENT_CONTEXT | undefined} args.context 
   * * default `DOCUMENT_CONTEXT.independent`
   */
  constructor(args = {}) {
    super(args);

    this.vmHealingProgress = new InputSplitNumberSpinnerViewModel({
      id: "vmHealingProgress",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.illness.healProgress"),
      }),
      current: {
        value: this.document.healProgress.current,
        min: 0,
        limitToMax: true,
      },
      maximum: {
        value: this.document.healProgress.required,
        min: 0,
      },
      onChange: (newValue) => {
        this.document.healProgress.current = newValue.current;
        this.document.healProgress.required = newValue.maximum;
        
        this.#updateProgressMaximumReadMode();
      },
    });
    const stateOptions = ChoicesUtil.getAsChoices(ILLNESS_STATES, "xl");
    const currentStateOption = stateOptions.find(it => it.value === this.document.state.name);
    this.vmState = new InputDropDownViewModel({
      id: "vmState",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.format(
          StringUtil.getLoca("system.item.illness.state.stateWithCurrent"),
          currentStateOption.localizedValue,
        ),
      }),
      options: stateOptions,
      showValue: false,
      value: currentStateOption,
      onChange: (newValue) => {
        this.document.state = ILLNESS_STATES[newValue.value];
        this.vmState.setToolTipContent(StringUtil.format(
          StringUtil.getLoca("system.item.illness.state.stateWithCurrent"),
          newValue.localizedValue,
        ));
      },
    });
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    this.#updateProgressMaximumReadMode();

    if (this.isIndependent) {
      this.element.find(`#${this.id}-embedded-content`).addClass("hidden");
    }
  }

  /**
   * @private
   */
  #updateProgressMaximumReadMode() {
    const re = this.vmHealingProgress.element.find(".read-mode > .maximum");
    if (this.vmHealingProgress.value.maximum < 1) {
      re.empty();
      re.append('<i class="ico ico-infinity lg"></i>');
    } else {
      re.empty();
      re.append(this.vmHealingProgress.value.maximum);
    }
  }
}
