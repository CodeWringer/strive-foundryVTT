import SheetViewModel from "../../../module/components/sheet-viewmodel.mjs";
import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import { validateOrThrow } from "../../../module/utils/validation-utility.mjs";

export default class InjuryListItemViewModel extends SheetViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.INJURY_LIST_ITEM; }

  /** @override */
  get entityId() { return this.item.id; }

  /**
   * An array of {ChoiceOption}s which represent the possible states of the injury. 
   * @type {Array<ChoiceOption>}
   * @readonly
   */
  get stateOptions() {
    const stateOptions = game.ambersteel.getInjuryOptions();

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
    this.contextTemplate = args.contextTemplate ?? "injury-list-item";
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
      placeholder: "ambersteel.general.name",
      options: thiz.stateOptions,
    });
    this.vmBtnSendToChat = this.createVmBtnSendToChat({
      id: "vmBtnSendToChat",
      target: thiz.item,
    });
    this.vmBtnDelete = this.createVmBtnDelete({
      id: "vmBtnDelete",
      target: thiz.item,
      withDialog: true,
    })
    this.vmNsLimit = this.createVmNumberSpinner({
      id: "vmNsLimit",
      propertyOwner: thiz.item,
      propertyPath: "data.data.limit",
      min: 0,
    });
    this.vmTfTimeToHeal = this.createVmTextField({
      id: "vmTfTimeToHeal",
      propertyOwner: thiz.item,
      propertyPath: "data.data.timeToHeal",
    });
    this.vmRtDescription = this.createVmRichText({
      id: "vmRtDescription",
      propertyOwner: thiz.item,
      propertyPath: "data.data.description",
    });
  }
}
