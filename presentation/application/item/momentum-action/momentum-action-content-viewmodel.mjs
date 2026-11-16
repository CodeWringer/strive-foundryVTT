import { StringUtil } from "../../../../common/util/string-utility.mjs";
import InputRichTextViewModel from "../../component/input-rich-text/input-rich-text-viewmodel.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ViewModel, { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";
import BaseItemContentViewModel from "../base/base-item-content-viewmodel.mjs";

export default class MomentumActionContentViewModel extends BaseItemContentViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.item.momentumAction.content; }

  /** @override */
  get clazz() { return MomentumActionContentViewModel; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * 
   * @param {MomentumActionDocument} args.document The represented transient document instance. 
   * @param {ActorSheet | ItemSheet} args.sheet The parent sheet instance. 
   */
  constructor(args = {}) {
    super(args);

    this.vmDesperateDescription = new InputRichTextViewModel({
      id: "vmDesperateDescription",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.momentumAction.desperate.description"),
      }),
      value: this.document.desperate.description,
      onChange: (newValue) => {
        this.document.desperate.description = newValue;
      },
    });
    this.vmHeroicDescription = new InputRichTextViewModel({
      id: "vmHeroicDescription",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.momentumAction.heroic.description"),
      }),
      value: this.document.heroic.description,
      onChange: (newValue) => {
        this.document.heroic.description = newValue;
      },
    });
  }
}
