import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import InputImageViewModel from "../../../component/input-image/input-image-viewmodel.mjs";
import InputRichTextViewModel from "../../../component/input-rich-text/input-rich-text-viewmodel.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";
import ViewModelFactory from "../../../view-model/view-model-factory.mjs";
import ViewModel from "../../../view-model/view-model.mjs";

export default class IllnessItemSheetViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ILLNESS_ITEM_SHEET; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {TransientIllness} args.document
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);

    this.document = args.document;
    this.contextTemplate = args.contextTemplate ?? "illness-item-sheet";
    const thiz = this;
    const factory = new ViewModelFactory();

    this.vmImg = new InputImageViewModel({
      parent: thiz,
      id: "vmImg",
      value: thiz.document.img,
      onChange: (_, newValue) => {
        thiz.document.img = newValue;
      },
    });
    this.vmTfName = factory.createVmTextField({
      parent: thiz,
      id: "tf-name",
      propertyOwner: thiz.document,
      propertyPath: "name",
      placeholder: "ambersteel.general.name",
    });
    this.vmBtnSendToChat = factory.createVmBtnSendToChat({
      parent: thiz,
      id: "btn-send-to-chat",
      target: thiz.document,
      isEditable: thiz.isEditable || thiz.isGM,
    });
    this.vmTfDuration = factory.createVmTextField({
      parent: thiz,
      id: "tf-duration",
      propertyOwner: thiz.document,
      propertyPath: "duration",
    });
    this.vmTfTreatmentSkill = factory.createVmTextField({
      parent: thiz,
      id: "tf-treatment-skill",
      propertyOwner: thiz.document,
      propertyPath: "treatmentSkill",
    });
    this.vmTfTreatment = factory.createVmTextField({
      parent: thiz,
      id: "tf-treatment",
      propertyOwner: thiz.document,
      propertyPath: "treatment",
    });
    this.vmRtDescription = new InputRichTextViewModel({
      parent: thiz,
      id: "vmRtDescription",
      value: thiz.document.description,
      onChange: (_, newValue) => {
        thiz.document.description = newValue;
      },
    });
  }

  /** @override */
  _getChildUpdates() {
    const updates = super._getChildUpdates();

    updates.set(this.vmBtnSendToChat, {
      ...updates.get(this.vmBtnSendToChat),
      isEditable: this.isEditable || this.isGM,
    });

    return updates;
  }
}
