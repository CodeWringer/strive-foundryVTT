import ButtonDeleteViewModel from "../../../module/components/button-delete/button-delete-viewmodel.mjs";
import InputNumberSpinnerViewModel from "../../../module/components/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputRadioButtonGroupViewModel from "../../../module/components/input-radio-button-group/input-radio-button-group-viewmodel.mjs";
import InputTextareaViewModel from "../../../module/components/input-textarea/input-textarea-viewmodel.mjs";
import InputTextFieldViewModel from "../../../module/components/input-textfield/input-textfield-viewmodel.mjs";
import SheetViewModel from "../../../module/components/sheet-viewmodel.mjs";
import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import { validateOrThrow } from "../../../module/utils/validation-utility.mjs";

export default class InjuryListItemViewModel extends SheetViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.INJURY_LIST_ITEM; }

  get stateOptions() { return game.ambersteel.getInjuryOptions(); }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} args.isGM If true, the current user is a GM. 
   * 
   * @param {Item} args.item
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["item"]);

    this.item = args.item;
    this.contextTemplate = "injury-list-item";
    const thiz = this;

    this.vmTfName = new InputTextFieldViewModel({
      id: "vmTfName",
      isEditable: thiz.isEditable,
      propertyOwner: thiz.item,
      propertyPath: "name",
      placeholder: "ambersteel.labels.name",
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
    });
    this.vmRbgState = new InputRadioButtonGroupViewModel({
      id: "vmRbgState",
      isEditable: thiz.isEditable,
      propertyOwner: thiz.item,
      propertyPath: "data.data.state",
      placeholder: "ambersteel.labels.name",
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
      options: thiz.stateOptions,
    });
    this.vmBtnDelete = new ButtonDeleteViewModel({
      id: "vmBtnDelete",
      parent: thiz,
      target: thiz.item,
      withDialog: true,
    })
    this.vmNsLimit = new InputNumberSpinnerViewModel({
      id: "vmNsLimit",
      isEditable: thiz.isEditable,
      propertyOwner: thiz.item,
      propertyPath: "data.data.limit",
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
      min: 0,
    });
    this.vmTfTimeToHeal = new InputTextFieldViewModel({
      id: "vmTfTimeToHeal",
      isEditable: thiz.isEditable,
      propertyOwner: thiz.item,
      propertyPath: "data.data.timeToHeal",
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
    });
    this.vmTaDescription = new InputTextareaViewModel({
      id: "vmTaDescription",
      isEditable: thiz.isEditable,
      propertyPath: "data.data.description",
      propertyOwner: thiz.item,
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
      placeholder: "ambersteel.labels.description",
      allowResize: true,
    });
  }
}
