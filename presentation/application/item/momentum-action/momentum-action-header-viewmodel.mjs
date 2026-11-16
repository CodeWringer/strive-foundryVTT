import { StringUtil } from "../../../../common/util/string-utility.mjs";
import InputImageViewModel from "../../component/input-image/input-image-viewmodel.mjs";
import InputNumberSpinnerViewModel from "../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputTextFieldViewModel from "../../component/input-textfield/input-textfield-viewmodel.mjs";
import { TEMPLATES } from "../../templates.mjs";
import DocumentViewModel from "../../view-model/document-viewmodel.mjs";
import ViewModel, { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";

export default class MomentumActionHeaderViewModel extends DocumentViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.item.momentumAction.header; }

  /** @override */
  get clazz() { return MomentumActionHeaderViewModel; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is in edit mode. 
   * @param {Function | undefined} args.onNameClick Invoked when the name input is clicked. 
   * 
   * @param {MomentumActionDocument} args.document The represented transient document instance. 
   * @param {ActorSheet | ItemSheet} args.sheet The parent sheet instance. 
   */
  constructor(args = {}) {
    super(args);

    this.onNameClick = args.onNameClick;

    // Desperate
    this.vmImgDesperate = new InputImageViewModel({
      id: "vmImgDesperate",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.momentumAction.desperate.img"),
      }),
      value: this.document.desperate.img,
      onChange: (newValue) => {
        this.document.desperate.img = newValue;
      },
    });
    this.vmNameDesperate = new InputTextFieldViewModel({
      id: "vmNameDesperate",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.momentumAction.desperate.name"),
      }),
      value: this.document.desperate.name,
      onChange: (newValue) => {
        this.document.desperate.name = newValue;
      },
      onClick: this.onNameClick,
    });
    this.vmMomentumShiftDesperate = new InputNumberSpinnerViewModel({
      id: "vmMomentumShiftDesperate",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.momentumAction.desperate.momentumChange"),
      }),
      value: this.document.desperate.momentumChange,
      onChange: (newValue) => {
        this.document.desperate.momentumChange = newValue;
      },
    });
    
    // Heroic
    this.vmImgHeroic = new InputImageViewModel({
      id: "vmImgHeroic",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.momentumAction.heroic.img"),
      }),
      value: this.document.heroic.img,
      onChange: (newValue) => {
        this.document.heroic.img = newValue;
      },
    });
    this.vmNameHeroic = new InputTextFieldViewModel({
      id: "vmNameHeroic",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.momentumAction.heroic.name"),
      }),
      value: this.document.heroic.name,
      onChange: (newValue) => {
        this.document.heroic.name = newValue;
      },
      onClick: this.onNameClick,
    });
    this.vmMomentumShiftHeroic = new InputNumberSpinnerViewModel({
      id: "vmMomentumShiftHeroic",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.momentumAction.heroic.momentumChange"),
      }),
      value: this.document.heroic.momentumChange,
      onChange: (newValue) => {
        this.document.heroic.momentumChange = newValue;
      },
    });

  }
}
