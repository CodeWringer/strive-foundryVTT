import ExpertiseDocument from "../../../../business/model/document/item/expertise-document.mjs";
import { StringUtil } from "../../../../common/util/string-utility.mjs";
import InputNumberSpinnerViewModel from "../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputRichTextViewModel from "../../component/input-rich-text/input-rich-text-viewmodel.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ViewModel, { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";
import BaseItemContentViewModel from "../base/base-item-content-viewmodel.mjs";

export default class FateCardContentViewModel extends BaseItemContentViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.item.fateCard.content; }

  /** @override */
  get clazz() { return FateCardContentViewModel; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * 
   * @param {ExpertiseDocument} args.document The represented transient document instance. 
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
    this.vmMifp = new InputNumberSpinnerViewModel({
      id: "vmMifp",
      parent: this,
      value: this.document.cost.miFP,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.fateCard.mifp"),
      }),
      onChange: (newValue) => {
        this.document.cost.miFP = newValue;
      },
    });
    this.vmMafp = new InputNumberSpinnerViewModel({
      id: "vmMafp",
      parent: this,
      value: this.document.cost.maFP,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.fateCard.mafp"),
      }),
      onChange: (newValue) => {
        this.document.cost.maFP = newValue;
      },
    });
    this.vmAfp = new InputNumberSpinnerViewModel({
      id: "vmAfp",
      parent: this,
      value: this.document.cost.AFP,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.fateCard.afp"),
      }),
      onChange: (newValue) => {
        this.document.cost.AFP = newValue;
      },
    });
  }
}
