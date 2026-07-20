import { INJURY_STATES } from "../../../../business/model/domain/const/injury-states.mjs";
import { ChoicesUtil } from "../../../util/choices-utility.mjs";
import InputDropDownViewModel from "../../component/input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import InputTextFieldViewModel from "../../component/input-textfield/input-textfield-viewmodel.mjs";
import { TEMPLATES } from "../../templates.mjs";
import { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";
import BaseItemSheetViewModel from "../base/sheet/base-item-sheet-viewmodel.mjs";
import InjuryContentViewModel from "./injury-content-viewmodel.mjs";

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
    const stateOptions = ChoicesUtil.getAsChoices(INJURY_STATES);
    this.vmState = new InputDropDownViewModel({
      id: "vmState",
      parent: this,
      isEditable: this.isEditable,
      options: stateOptions,
      value: stateOptions.find(it => it.value === (this.document.state + "")),
    });
  }
}
