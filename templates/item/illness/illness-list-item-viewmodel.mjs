import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import { validateOrThrow } from "../../../module/utils/validation-utility.mjs";
import SheetViewModel from "../../../module/components/sheet-viewmodel.mjs";

export default class IllnessListItemViewModel extends SheetViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ILLNESS_LIST_ITEM; }

  /**
   * @type {Array<ChoiceOption>}
   * @readonly
   */
  get stateOptions() { return game.ambersteel.getIllnessOptions(); }

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
    this.contextTemplate = args.contextTemplate ?? "illness-list-item";
    const thiz = this;

    this.vmTfName = this.createVmTextField({
      id: "tf-name",
      propertyOwner: thiz.item,
      propertyPath: "name",
      placeholder: "ambersteel.labels.name",
    });
    this.vmRbgState = this.createVmRadioButtonGroup({
      id: "rbg-state",
      propertyOwner: thiz.item,
      propertyPath: "data.data.state",
      options: thiz.stateOptions,
    })
    this.vmBtnSendToChat = this.createVmBtnSendToChat({
      id: "btn-send-to-chat",
      target: thiz.item,
    });
    this.vmBtnDelete = this.createVmBtnDelete({
      id: "btn-delete",
      target: thiz.item,
      withDialog: true,
    })
    this.vmTfDuration = this.createVmTextField({
      id: "tf-duration",
      propertyOwner: thiz.item,
      propertyPath: "data.data.duration",
    });
    this.vmTfTreatmentSkill = this.createVmTextField({
      id: "tf-treatment-skill",
      propertyOwner: thiz.item,
      propertyPath: "data.data.treatmentSkill",
    });
    this.vmTfTreatment = this.createVmTextField({
      id: "tf-treatment",
      propertyOwner: thiz.item,
      propertyPath: "data.data.treatment",
    });
    this.vmTaDescription = this.createVmTextArea({
      id: "ta-description",
      propertyPath: "data.data.description",
      propertyOwner: thiz.item,
      placeholder: "ambersteel.labels.description",
      allowResize: true,
    });
  }
}
