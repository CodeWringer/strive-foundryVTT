import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import SheetViewModel from "../../../view-model/sheet-view-model.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";

export default class IllnessListItemViewModel extends SheetViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ILLNESS_LIST_ITEM; }

  /** @override */
  get entityId() { return this.item.id; }
  
  /**
   * An array of {ChoiceOption}s which represent the possible states of the illness. 
   * @type {Array<ChoiceOption>}
   * @readonly
   */
  get stateOptions() {
    const stateOptions = game.ambersteel.getIllnessOptions();

    for (const stateOption of stateOptions) {
      stateOption.shouldDisplayValue = false;
    }

    return stateOptions;
  }

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

    this.vmImg = this.createVmImg({
      id: "vmImg",
      propertyOwner: thiz.item,
      propertyPath: "img",
    });
    this.vmTfName = this.createVmTextField({
      id: "vmTfName",
      propertyOwner: thiz.item,
      propertyPath: "name",
      placeholder: "ambersteel.general.name",
    });
    this.vmRbgState = this.createVmRadioButtonGroup({
      id: "vmRbgState",
      propertyOwner: thiz.item,
      propertyPath: "data.data.state",
      options: thiz.stateOptions,
    })
    this.vmBtnSendToChat = this.createVmBtnSendToChat({
      id: "vmBtnSendToChat",
      target: thiz.item,
    });
    this.vmBtnDelete = this.createVmBtnDelete({
      id: "vmBtnDelete",
      target: thiz.item,
      withDialog: true,
    })
    this.vmTfDuration = this.createVmTextField({
      id: "vmTfDuration",
      propertyOwner: thiz.item,
      propertyPath: "data.data.duration",
    });
    this.vmTfTreatmentSkill = this.createVmTextField({
      id: "vmTfTreatmentSkill",
      propertyOwner: thiz.item,
      propertyPath: "data.data.treatmentSkill",
    });
    this.vmTfTreatment = this.createVmTextField({
      id: "vmTfTreatment",
      propertyOwner: thiz.item,
      propertyPath: "data.data.treatment",
    });
    this.vmRtDescription = this.createVmRichText({
      id: "vmRtDescription",
      propertyOwner: thiz.item,
      propertyPath: "data.data.description",
    });
  }
}
