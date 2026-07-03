import { LANGUAGE_GRADES } from "../../../../business/model/domain/const/language-grades.mjs";
import { StringUtil } from "../../../../common/util/string-utility.mjs";
import ChoiceOption from "../../../model/choice-option.mjs";
import { ChoicesUtil } from "../../../util/choices-utility.mjs";
import InputDropDownViewModel from "../../component/input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
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
      value: this.document.name,
      onChange: (_, newValue) => {
        this.document.name = newValue;
      },
    });
    const gradeOptions = ChoicesUtil.getAsChoices(LANGUAGE_GRADES);
    this.vmGrade = new InputDropDownViewModel({
      id: "vmGrade",
      parent: this,
      value: gradeOptions.find(it => it.value === this.document.grade.name),
      options: gradeOptions,
    });
    const readAndWriteOptions = [
      new ChoiceOption({
        value: true,
        localizedValue: StringUtil.getLoca("system.item.language.readAndWrite.canReadAndWrite"),
        icon: "systems/strive/presentation/image/can-read-write-d.svg", // TODO: #761 Respect dark/light mode
      }),
      new ChoiceOption({
        value: false,
        localizedValue: StringUtil.getLoca("system.item.language.readAndWrite.cannotReadAndWrite"),
        icon: "systems/strive/presentation/image/cannot-read-write-d.svg", // TODO: #761 Respect dark/light mode
      }),
    ];
    this.vmReadAndWrite = new InputDropDownViewModel({
      id: "vmReadAndWrite",
      parent: this,
      value: readAndWriteOptions.find(it => it.value === this.document.readAndWrite),
      options: readAndWriteOptions,
    });
  }
}
