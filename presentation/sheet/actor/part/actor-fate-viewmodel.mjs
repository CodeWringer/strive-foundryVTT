import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import ViewModelFactory from "../../../view-model/view-model-factory.mjs";
import FateCardViewModel from "../../item/fate-card/fate-card-viewmodel.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";

export default class ActorFateViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_FATE; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * @type {Number}
   * @readonly
   */
  get fateCardCount() { return this.document.fateSystem.fateCards.length; }

  /**
   * @type {Array<FateCardViewModel>}
   * @readonly
   */
  fateCards = [];

  get remainingSlots() { return this.document.fateSystem.remainingFateCards; }

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
   * @param {TransientPc} args.document
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);

    this.document = args.document;
    this.contextType = args.contextType ?? "actor-fate";

    const thiz = this;
    const factory = new ViewModelFactory();

    this.vmNsMifp = factory.createVmNumberSpinner({
      parent: thiz,
      id: "vmNsMifp",
      propertyOwner: thiz.document,
      propertyPath: "fateSystem.miFP",
      min: 0,
    });
    this.vmNsMafp = factory.createVmNumberSpinner({
      parent: thiz,
      id: "vmNsMafp",
      propertyOwner: thiz.document,
      propertyPath: "fateSystem.maFP",
      min: 0,
    });
    this.vmNsAfp = factory.createVmNumberSpinner({
      parent: thiz,
      id: "vmNsAfp",
      propertyOwner: thiz.document,
      propertyPath: "fateSystem.AFP",
      min: 0,
    });
    this.vmBtnAddFateCard = factory.createVmBtnAdd({
      parent: thiz,
      id: "vmBtnAddFateCard",
      target: thiz.document,
      creationType: "fate-card",
      withDialog: true,
      localizableType: "ambersteel.character.beliefSystem.fateSystem.fateCard.label",
      localizableDialogTitle: "ambersteel.character.beliefSystem.fateSystem.fateCard.add.query",
    });

    const fateCards = this.document.fateSystem.fateCards;
    for (const fateCard of fateCards) {
      const vm = new FateCardViewModel({
        ...args,
        id: fateCard.id,
        parent: thiz,
        document: fateCard,
      });
      this.fateCards.push(vm);
    }
  }
}
