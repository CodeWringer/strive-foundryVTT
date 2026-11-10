import { StringUtil } from "../../../../common/util/string-utility.mjs";
import ComplicationListViewModel from "../../component/complication/complication-list-viewmodel.mjs";
import InputNumberSpinnerViewModel from "../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputReferenceViewModel from "../../component/input-reference/input-reference-viewmodel.mjs";
import InputRichTextViewModel from "../../component/input-rich-text/input-rich-text-viewmodel.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ViewModel, { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";
import BaseItemContentViewModel from "../base/base-item-content-viewmodel.mjs";

export default class RecipeContentViewModel extends BaseItemContentViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.item.recipe.content; }

  /** @override */
  get clazz() { return RecipeContentViewModel; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * 
   * @param {RecipeDocument} args.document The represented transient document instance. 
   * @param {ActorSheet | ItemSheet} args.sheet The parent sheet instance. 
   */
  constructor(args = {}) {
    super(args);

    this.vmDescription = new InputRichTextViewModel({
      id: "vmDescription",
      parent: this,
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
      value: this.document.quality,
      onChange: (newValue) => {
        this.document.quality = newValue;
      },
    });
    this.vmRequiredProgress = new InputNumberSpinnerViewModel({
      id: "vmRequiredProgress",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.projectAndRecipe.progress.required"),
      }),
      value: this.document.requiredProgress,
      onChange: (newValue) => {
        this.document.requiredProgress = newValue;
      },
    });
    this.vmWorkRate = new InputNumberSpinnerViewModel({
      id: "vmWorkRate",
      parent: this,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.projectAndRecipe.workRate"),
      }),
      min: 0,
      value: this.document.workRate.value,
      onChange: (newValue) => {
        this.document.workRate.value = newValue;
      },
    });
    this.vmProduct = new InputReferenceViewModel({
      id: "vmProduct",
      parent: this,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.recipe.product"),
      }),
      value: this.document.product,
      onChange: (newValue) => {
        this.document.product = newValue;
      },
    });
    this.vmProjectSkill = new InputReferenceViewModel({
      id: "vmProjectSkill",
      parent: this,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.projectAndRecipe.skill"),
      }),
      value: this.document.projectSkill,
      onChange: (newValue) => {
        this.document.projectSkill = newValue;
      },
    });
    this.vmComplications = new ComplicationListViewModel({
      id: "vmComplications",
      parent: this,
      value: this.document.complications,
      onChange: (newValue) => {
        this.document.complications = newValue;
      },
    });
  }
}
