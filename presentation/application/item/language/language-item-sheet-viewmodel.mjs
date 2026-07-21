import { LANGUAGE_GRADES } from "../../../../business/model/domain/const/language-grades.mjs";
import { LANGUAGE_READ_WRITE } from "../../../../business/model/domain/const/language-read-write-states.mjs";
import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { ChoicesUtil } from "../../../util/choices-utility.mjs";
import InputDropDownViewModel from "../../component/input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import InputTextFieldViewModel from "../../component/input-textfield/input-textfield-viewmodel.mjs";
import { TEMPLATES } from "../../templates.mjs";
import { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";
import BaseItemSheetViewModel from "../base/sheet/base-item-sheet-viewmodel.mjs";
import LanguageContentViewModel from "./language-content-viewmodel.mjs";

export default class LanguageItemSheetViewModel extends BaseItemSheetViewModel {
  /** @override */
  get clazz() { return LanguageItemSheetViewModel; }

  /** @override */
  get headerTemplate() { return TEMPLATES.application.item.language.header; }

  /** @override */
  get contentTemplate() { return TEMPLATES.application.item.language.content; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is in edit mode. 
   * 
   * @param {TransientLanguage} args.document The represented transient document instance. 
   * @param {ActorSheet | ItemSheet} args.sheet The parent sheet instance. 
   */
  constructor(args = {}) {
    super({
      ...args,
      contentViewModel: new LanguageContentViewModel({
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
    const gradeOptions = ChoicesUtil.getAsChoices(LANGUAGE_GRADES);
    this.vmGrade = new InputDropDownViewModel({
      id: "vmGrade",
      parent: this,
      isEditable: this.isEditable,
      value: gradeOptions.find(it => it.value === this.document.grade.name),
      options: gradeOptions,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.language.grade.grade"),
      }),
      onChange: (_, newValue) => {
        this.document.grade = LANGUAGE_GRADES[newValue.value];
      },
    });
    const readAndWriteOptions = ChoicesUtil.getAsChoices(LANGUAGE_READ_WRITE, "xl");
    this.vmReadAndWrite = new InputDropDownViewModel({
      id: "vmReadAndWrite",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.language.readAndWrite.readAndWrite"),
      }),
      value: readAndWriteOptions.find(it => it.value === (this.document.readAndWrite ? "able" : "unable")),
      options: readAndWriteOptions,
      showValue: false,
      onChange: (_, newValue) => {
        this.document.readAndWrite = newValue.value === "able";
      },
    });
  }
}
