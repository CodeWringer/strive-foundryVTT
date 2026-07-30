import { INJURY_STATES } from "../../../../business/model/domain/const/injury-states.mjs";
import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { ChoicesUtil } from "../../../util/choices-utility.mjs";
import InputDropDownViewModel from "../../component/input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import InputTextFieldViewModel from "../../component/input-textfield/input-textfield-viewmodel.mjs";
import { TEMPLATES } from "../../templates.mjs";
import { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";
import BaseItemSheetViewModel from "../base/sheet/base-item-sheet-viewmodel.mjs";
import InjuryContentViewModel from "./injury-content-viewmodel.mjs";
import InputSplitNumberSpinnerViewModel from "../../component/input-split-number-spinner/input-split-number-spinner-viewmodel.mjs";

/**
 * @property {TransientInjury} document 
 */
export default class InjuryItemSheetViewModel extends BaseItemSheetViewModel {
  /** @override */
  get clazz() { return InjuryItemSheetViewModel; }

  /** @override */
  get headerTemplate() { return TEMPLATES.application.item.injury.header; }

  /** @override */
  get contentTemplate() { return TEMPLATES.application.item.injury.content; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is in edit mode. 
   * 
   * @param {TransientInjury} args.document The represented transient document instance. 
   * @param {ActorSheet | ItemSheet} args.sheet The parent sheet instance. 
   */
  constructor(args = {}) {
    super({
      ...args,
      contentViewModel: new InjuryContentViewModel({
        id: "vmContent",
        document: args.document,
      }),
    });

    this.vmName = new InputTextFieldViewModel({
      id: "vmName",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.general.name.documentName"),
      }),
      value: this.document.name,
      onChange: (_, newValue) => {
        this.document.name = newValue;
      },
    });
    this.vmHealingProgress = new InputSplitNumberSpinnerViewModel({
      id: "vmHealingProgress",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.injury.healProgress"),
      }),
      current: {
        value: this.document.healProgress.current,
        min: 0,
        max: this.document.healProgress.required,
      },
      maximum: {
        value: this.document.healProgress.required,
        min: 0,
        negativeIsInfinite: true,
      },
      onChange: (_, newValue) => {
        this.document.healProgress.current = newValue.current;
        this.document.healProgress.required = newValue.maximum;

        this.#updateProgressMaximumReadMode();
      },
    });
    const stateOptions = ChoicesUtil.getAsChoices(INJURY_STATES, "xl");
    const currentStateOption = stateOptions.find(it => it.value === this.document.state.name);
    this.vmState = new InputDropDownViewModel({
      id: "vmState",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.format(
          StringUtil.getLoca("system.item.injury.state.stateWithCurrent"),
          currentStateOption.localizedValue,
        ),
      }),
      options: stateOptions,
      showValue: false,
      value: currentStateOption,
      onChange: (_, newValue) => {
        this.document.state = newValue.value;
        this.vmState.setToolTipContent(StringUtil.format(
          StringUtil.getLoca("system.item.injury.state.stateWithCurrent"),
          newValue.localizedValue,
        ));
      },
    });
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    this.#updateProgressMaximumReadMode();
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
