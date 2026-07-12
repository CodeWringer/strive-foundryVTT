import { LANGUAGE_GRADES } from "../../../../business/model/domain/const/language-grades.mjs";
import { StringUtil } from "../../../../common/util/string-utility.mjs";
import ChoiceOption from "../../../model/choice-option.mjs";
import { ChoicesUtil } from "../../../util/choices-utility.mjs";
import InputDropDownViewModel from "../../component/input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import InputRichTextViewModel from "../../component/input-rich-text/input-rich-text-viewmodel.mjs";
import InputTextFieldViewModel from "../../component/input-textfield/input-textfield-viewmodel.mjs";
import { TEMPLATES } from "../../templates.mjs";
import BaseItemSheetViewModel from "../base/sheet/base-item-sheet-viewmodel.mjs";

export default class LanguageItemSheetViewModel extends BaseItemSheetViewModel {
  /** @override */
  static get TEMPLATE() { throw new Error("NotImplementedException"); }

  /** @override */
  get clazz() { return LanguageItemSheetViewModel; }

  /** @override */
  get contentTemplate() { return TEMPLATES.application.item.language; }

  constructor(args = {}) {
    super(args);

    this.vmName = new InputTextFieldViewModel({
      id: "vmName",
      parent: this,
      isEditable: this.isEditMode,
      value: this.document.name,
      onChange: (_, newValue) => {
        this.document.name = newValue;
      },
    });
    const gradeOptions = ChoicesUtil.getAsChoices(LANGUAGE_GRADES);
    this.vmGrade = new InputDropDownViewModel({
      id: "vmGrade",
      parent: this,
      isEditable: this.isEditMode,
      value: gradeOptions.find(it => it.value === this.document.grade.name),
      options: gradeOptions,
      onChange: (_, newValue) => {
        this.document.grade = LANGUAGE_GRADES[newValue.value];
      },
    });
    const readAndWriteOptions = [
      new ChoiceOption({
        value: "true",
        localizedValue: StringUtil.getLoca("system.item.language.readAndWrite.canReadAndWrite"),
        iconLightMode: "systems/strive/presentation/image/can-read-write-32x27-dark.svg",
        iconDarkMode: "systems/strive/presentation/image/can-read-write-32x27-light.svg",
      }),
      new ChoiceOption({
        value: "false",
        localizedValue: StringUtil.getLoca("system.item.language.readAndWrite.cannotReadAndWrite"),
        iconLightMode: "systems/strive/presentation/image/cannot-read-write-24x32-dark.svg",
        iconDarkMode: "systems/strive/presentation/image/cannot-read-write-24x32-light.svg",
      }),
    ];
    this.vmReadAndWrite = new InputDropDownViewModel({
      id: "vmReadAndWrite",
      parent: this,
      isEditable: this.isEditMode,
      value: readAndWriteOptions.find(it => it.value === (this.document.readAndWrite + "")),
      options: readAndWriteOptions,
      showValue: false,
      onChange: (_, newValue) => {
        this.document.readAndWrite = newValue.value === "true";
      },
    });
    this.vmDescription = new InputRichTextViewModel({
      id: "vmDescription",
      parent: this,
      isEditable: this.isEditMode,
      value: this.document.description,
      onChange: (_, newValue) => {
        this.document.description = newValue;
      },
    });
    if (this.isGM) {
      this.vmGmNotes = new InputRichTextViewModel({
        id: "vmGmNotes",
        parent: this,
        isEditable: this.isEditMode,
        value: this.document.gmNotes,
        onChange: (_, newValue) => {
          this.document.gmNotes = newValue;
        },
      });
    }
  }
}
