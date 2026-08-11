import { TIME_UNITS } from "../../../../business/model/domain/const/time-units.mjs";
import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { ChoicesUtil } from "../../../util/choices-utility.mjs";
import ComplicationListViewModel from "../../component/complication/complication-list-viewmodel.mjs";
import InputDropDownViewModel from "../../component/input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import InputNumberSpinnerViewModel from "../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputReferenceViewModel from "../../component/input-reference/input-reference-viewmodel.mjs";
import InputRichTextViewModel from "../../component/input-rich-text/input-rich-text-viewmodel.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ViewModel, { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";
import BaseItemContentViewModel from "../base/base-item-content-viewmodel.mjs";

export default class ProjectContentViewModel extends BaseItemContentViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.item.project.content; }

  /** @override */
  get clazz() { return ProjectContentViewModel; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * 
   * @param {TransientProject} args.document The represented transient document instance. 
   * @param {ActorSheet | ItemSheet} args.sheet The parent sheet instance. 
   * @param {DOCUMENT_CONTEXT | undefined} args.context Indicates whether this is an embedded or 
   * independent document. This affects interactibility. 
   * * default `DOCUMENT_CONTEXT.independent`
   */
  constructor(args = {}) {
    super(args);

    this.vmDescription = new InputRichTextViewModel({
      id: "vmDescription",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.general.description"),
      }),
      value: this.document.description,
      onChange: (_, newValue) => {
        this.document.description = newValue;
      },
    });
    this.vmQuality = new InputNumberSpinnerViewModel({
      id: "vmQuality",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.project.quality"),
      }),
      min: 1,
      value: this.document.quality,
      onChange: (_, newValue) => {
        this.document.quality = newValue;
      },
    });
    this.vmPushes = new InputNumberSpinnerViewModel({
      id: "vmPushes",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.project.pushes"),
      }),
      min: 0,
      value: this.document.pushes,
      onChange: (_, newValue) => {
        this.document.pushes = newValue;
      },
    });
    this.vmProgressIncrement = new InputNumberSpinnerViewModel({
      id: "vmProgressIncrement",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.project.progress.increment.increment"),
      }),
      min: 0,
      value: this.document.progress.increment,
      onChange: (_, newValue) => {
        this.document.progress.increment = newValue;
      },
    });
    this.vmProjectSkill = new InputReferenceViewModel({
      id: "vmProjectSkill",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.project.skill"),
      }),
      value: this.document.projectSkill,
      onChange: (_, newValue) => {
        this.document.projectSkill = newValue;
      },
    });
    this.vmProgressTimeAmount = new InputNumberSpinnerViewModel({
      id: "vmProgressTimeAmount",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.project.time.amount"),
      }),
      min: 0,
      value: this.document.progress.increment,
      onChange: (_, newValue) => {
        this.document.progress.increment = newValue;
      },
    });
    const timeOptions = ChoicesUtil.getAsChoices(TIME_UNITS);
    const selectedTimeOption = timeOptions.find(it => it.value === this.document.timeIncrement.unit.name);
    this.vmProgressTimeUnit = new InputDropDownViewModel({
      id: "vmProgressTimeUnit",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.project.time.unit"),
      }),
      options: timeOptions,
      value: selectedTimeOption,
      onChange: (_, newValue) => {
        this.document.timeIncrement.unit = TIME_UNITS[newValue.value];
      },
    });
    this.vmComplications = new ComplicationListViewModel({
      id: "vmComplications",
      parent: this,
      isEditable: this.isEditable,
      value: this.document.complications,
      onChange: (_, newValue) => {
        this.document.complications = newValue;
      },
    });
  }
}
