import ButtonSendToChatViewModel from "../../../module/components/button-send-to-chat/button-send-to-chat-viewmodel.mjs";
import InputTextareaViewModel from "../../../module/components/input-textarea/input-textarea-viewmodel.mjs";
import InputTextFieldViewModel from "../../../module/components/input-textfield/input-textfield-viewmodel.mjs";
import SheetViewModel from "../../../module/components/sheet-viewmodel.mjs";
import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import { validateOrThrow } from "../../../module/utils/validation-utility.mjs";

export default class IllnessItemSheetViewModel extends SheetViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ILLNESS_ITEM_SHEET; }

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
    this.contextTemplate = "illness-item-sheet";
    const thiz = this;

    this.vmTfName = new InputTextFieldViewModel({
      id: "tf-name",
      isEditable: thiz.isEditable,
      propertyOwner: thiz.item,
      propertyPath: "name",
      placeholder: "ambersteel.labels.name",
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
    });
    this.vmBtnSendToChat = new ButtonSendToChatViewModel({
      id: "btn-send-to-chat",
      target: thiz.item,
      parent: thiz,
    });
    this.vmTfDuration = new InputTextFieldViewModel({
      id: "tf-duration",
      isEditable: thiz.isEditable,
      propertyOwner: thiz.item,
      propertyPath: "data.data.duration",
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
    });
    this.vmTfTreatmentSkill = new InputTextFieldViewModel({
      id: "tf-treatment-skill",
      isEditable: thiz.isEditable,
      propertyOwner: thiz.item,
      propertyPath: "data.data.treatmentSkill",
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
    });
    this.vmTfTreatment = new InputTextFieldViewModel({
      id: "tf-treatment",
      isEditable: thiz.isEditable,
      propertyOwner: thiz.item,
      propertyPath: "data.data.treatment",
      contextTemplate: thiz.contextTemplate,
      parent: thiz,
    });
    this.vmTaDescription = new InputTextareaViewModel({
      id: "ta-description",
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
