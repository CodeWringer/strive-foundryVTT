import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import ViewModelFactory from "../../../view-model/view-model-factory.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";

export default class IllnessListItemViewModel extends ViewModel {
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
    const factory = new ViewModelFactory();

    this.vmImg = factory.createVmImg({
      parent: thiz,
      id: "vmImg",
      propertyOwner: thiz.item,
      propertyPath: "img",
    });
    this.vmTfName = factory.createVmTextField({
      parent: thiz,
      id: "vmTfName",
      propertyOwner: thiz.item,
      propertyPath: "name",
      placeholder: "ambersteel.general.name",
    });
    this.vmRbgState = factory.createVmRadioButtonGroup({
      parent: thiz,
      id: "vmRbgState",
      propertyOwner: thiz.item,
      propertyPath: "data.data.state",
      options: thiz.stateOptions,
    })
    this.vmBtnSendToChat = factory.createVmBtnSendToChat({
      parent: thiz,
      id: "vmBtnSendToChat",
      target: thiz.item,
    });
    this.vmBtnDelete = factory.createVmBtnDelete({
      parent: thiz,
      id: "vmBtnDelete",
      target: thiz.item,
      withDialog: true,
    })
    this.vmTfDuration = factory.createVmTextField({
      parent: thiz,
      id: "vmTfDuration",
      propertyOwner: thiz.item,
      propertyPath: "data.data.duration",
    });
    this.vmTfTreatmentSkill = factory.createVmTextField({
      parent: thiz,
      id: "vmTfTreatmentSkill",
      propertyOwner: thiz.item,
      propertyPath: "data.data.treatmentSkill",
    });
    this.vmTfTreatment = factory.createVmTextField({
      parent: thiz,
      id: "vmTfTreatment",
      propertyOwner: thiz.item,
      propertyPath: "data.data.treatment",
    });
    this.vmRtDescription = factory.createVmRichText({
      parent: thiz,
      id: "vmRtDescription",
      propertyOwner: thiz.item,
      propertyPath: "data.data.description",
    });
  }
}