import { ITEM_TYPES } from "../../../../business/model/domain/const/item-types.mjs";
import { StringUtil } from "../../../../common/util/string-utility.mjs";
import InputNumberSpinnerViewModel from "../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputReferenceViewModel from "../../component/input-reference/input-reference-viewmodel.mjs";
import InputRichTextViewModel from "../../component/input-rich-text/input-rich-text-viewmodel.mjs";
import InputTextFieldViewModel from "../../component/input-textfield/input-textfield-viewmodel.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ViewModel, { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";
import BaseItemContentViewModel from "../base/base-item-content-viewmodel.mjs";

export default class IllnessContentViewModel extends BaseItemContentViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.item.illness.content; }

  /** @override */
  get clazz() { return IllnessContentViewModel; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * 
   * @param {TransientLanguage} args.document The represented transient document instance. 
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
    this.vmTreatmentDate = new InputTextFieldViewModel({
      id: "vmTreatmentDate",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.illness.treatment.date"),
      }),
      value: this.document.treatment.lastTreatmentTime,
      onChange: (_, newValue) => {
        this.document.treatment.lastTreatmentTime = newValue;
      },
    });
    this.vmTreatmentObstacle = new InputTextFieldViewModel({
      id: "vmTreatmentObstacle",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.illness.treatment.obstacle"),
      }),
      value: this.document.treatment.obstacle,
      onChange: (_, newValue) => {
        this.document.treatment.obstacle = newValue;
      },
    });
    this.vmTreatmentSkill = new InputReferenceViewModel({
      id: "vmTreatmentSkill",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.illness.treatment.skill"),
      }),
      acceptedTypes: [ITEM_TYPES.skill],
      value: this.document.treatment.skill,
      onChange: (_, newValue) => {
        this.document.treatment.skill = newValue;
      },
    });
    this.vmTreatmentSuppliesAmount = new InputNumberSpinnerViewModel({
      id: "vmTreatmentSuppliesAmount",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.illness.treatment.supplies.amount"),
      }),
      value: this.document.treatment.requiredSupplies.amount,
      min: 0,
      onChange: (_, newValue) => {
        this.document.treatment.requiredSupplies.amount = newValue;
      },
    });
    this.vmTreatmentSuppliesAsset = new InputReferenceViewModel({
      id: "vmTreatmentSuppliesAsset",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.illness.treatment.supplies.asset"),
      }),
      acceptedTypes: [ITEM_TYPES.asset],
      value: this.document.treatment.requiredSupplies.asset,
      onChange: (_, newValue) => {
        this.document.treatment.requiredSupplies.asset = newValue;
      },
    });
  }
}
