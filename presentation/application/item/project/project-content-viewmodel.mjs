import { StringUtil } from "../../../../common/util/string-utility.mjs";
import ComplicationListViewModel from "../../component/complication/complication-list-viewmodel.mjs";
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
   * @param {ProjectDocument} args.document The represented transient document instance. 
   * @param {ActorSheet | ItemSheet} args.sheet The parent sheet instance. 
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
      onChange: (newValue) => {
        this.document.description = newValue;
      },
    });
    this.vmQuality = new InputNumberSpinnerViewModel({
      id: "vmQuality",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.projectAndRecipe.quality"),
      }),
      min: 1,
      value: this.document.quality,
      onChange: (newValue) => {
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
      onChange: (newValue) => {
        this.document.pushes = newValue;
      },
    });
    this.vmProgressIncrement = new InputNumberSpinnerViewModel({
      id: "vmProgressIncrement",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.projectAndRecipe.progress.increment.increment"),
      }),
      min: 0,
      value: this.document.progress.increment,
      onChange: (newValue) => {
        this.document.progress.increment = newValue;
      },
    });
    this.vmProjectSkill = new InputReferenceViewModel({
      id: "vmProjectSkill",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.projectAndRecipe.skill"),
      }),
      value: this.document.projectSkill,
      onChange: (newValue) => {
        this.document.projectSkill = newValue;
      },
    });
    this.vmWorkRate = new InputNumberSpinnerViewModel({
      id: "vmWorkRate",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.projectAndRecipe.workRate"),
      }),
      min: 0,
      value: this.document.workRate.value,
      onChange: (newValue) => {
        this.document.workRate.value = newValue;
      },
    });
    this.vmComplications = new ComplicationListViewModel({
      id: "vmComplications",
      parent: this,
      isEditable: this.isEditable,
      value: this.document.complications,
      onChange: (newValue) => {
        this.document.complications = newValue;
      },
    });
  }
}
