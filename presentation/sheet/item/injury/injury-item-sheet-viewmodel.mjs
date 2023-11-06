import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import InputImageViewModel from "../../../component/input-image/input-image-viewmodel.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";
import ViewModelFactory from "../../../view-model/view-model-factory.mjs";
import ViewModel from "../../../view-model/view-model.mjs";

export default class InjuryItemSheetViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.INJURY_ITEM_SHEET; }

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
   * @param {TransientInjury} args.document
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);

    this.document = args.document;
    this.contextTemplate = args.contextTemplate ?? "injury-item-sheet";
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
      id: "vmTfName",
      propertyOwner: thiz.document,
      propertyPath: "name",
      placeholder: "ambersteel.general.name",
    });
    this.vmBtnSendToChat = factory.createVmBtnSendToChat({
      parent: thiz,
      id: "vmBtnSendToChat",
      target: thiz.document,
      isEditable: thiz.isEditable || thiz.isGM,
    });
    this.vmLimit = factory.createVmTextField({
      parent: thiz,
      id: "vmLimit",
      propertyOwner: thiz.document,
      propertyPath: "limit",
      placeholder: "ambersteel.character.health.injury.limit.placeholder",
    });
    this.vmTfTimeToHeal = factory.createVmTextField({
      parent: thiz,
      id: "vmTfTimeToHeal",
      propertyOwner: thiz.document,
      propertyPath: "timeToHeal",
    });
    this.vmScar = factory.createVmTextField({
      parent: thiz,
      id: "vmScar",
      propertyOwner: thiz.document,
      propertyPath: "scar",
    });
    this.vmRtDescription = factory.createVmRichText({
      parent: thiz,
      id: "vmRtDescription",
      propertyOwner: thiz.document,
      propertyPath: "description",
    });
    this.vmTreatmentSkill = factory.createVmTextField({
      parent: thiz,
      id: "vmTreatmentSkill",
      propertyOwner: thiz.document,
      propertyPath: "treatmentSkill",
    });
    this.vmRequiredSupplies = factory.createVmTextField({
      parent: thiz,
      id: "vmRequiredSupplies",
      propertyOwner: thiz.document,
      propertyPath: "requiredSupplies",
    });
    this.vmObstaclePatchUp = factory.createVmTextField({
      parent: thiz,
      id: "vmObstaclePatchUp",
      propertyOwner: thiz.document,
      propertyPath: "obstaclePatchUp",
    });
    this.vmObstacleTreatment = factory.createVmTextField({
      parent: thiz,
      id: "vmObstacleTreatment",
      propertyOwner: thiz.document,
      propertyPath: "obstacleTreatment",
    });
    this.vmTimeToHealTreated = factory.createVmTextField({
      parent: thiz,
      id: "vmTimeToHealTreated",
      propertyOwner: thiz.document,
      propertyPath: "timeToHealTreated",
    });
    this.vmSelfPatchUp = factory.createVmTextField({
      parent: thiz,
      id: "vmSelfPatchUp",
      propertyOwner: thiz.document,
      propertyPath: "selfPatchUp",
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
