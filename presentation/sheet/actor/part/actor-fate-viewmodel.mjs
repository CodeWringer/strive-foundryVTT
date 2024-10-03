import DocumentFetcher from "../../../../business/document/document-fetcher/document-fetcher.mjs";
import { ITEM_TYPES } from "../../../../business/document/item/item-types.mjs";
import { StringUtil } from "../../../../business/util/string-utility.mjs";
import { ValidationUtil } from "../../../../business/util/validation-utility.mjs";
import { ExtenderUtil } from "../../../../common/extender-util.mjs";
import ButtonAddViewModel from "../../../component/button-add/button-add-viewmodel.mjs";
import InputNumberSpinnerViewModel from "../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import ViewModel from "../../../view-model/view-model.mjs"
import FateCardViewModel from "../../item/fate-card/fate-card-viewmodel.mjs"

export default class ActorFateViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_FATE; }

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

  /**
   * @type {Number}
   * @readonly
   */
  get remainingSlots() { return this.document.fateSystem.remainingFateCards; }

  /**
   * @type {String}
   * @readonly
   */
  get fateCardTemplate() { return game.strive.const.TEMPLATES.FATE_CARD; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hasExceededFateCardLimit() { return (this.document.fateSystem.fateCards.length > 5); }

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
   * @param {TransientPc} args.document
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["document"]);

    this.document = args.document;
    this.contextType = args.contextType ?? "actor-fate";

    const thiz = this;

    this.vmNsMifp = new InputNumberSpinnerViewModel({
      parent: thiz,
      id: "vmNsMifp",
      value: thiz.document.fateSystem.miFP,
      onChange: (_, newValue) => {
        thiz.document.fateSystem.miFP = newValue;
      },
      min: 0,
    });
    this.vmNsMafp = new InputNumberSpinnerViewModel({
      parent: thiz,
      id: "vmNsMafp",
      value: thiz.document.fateSystem.maFP,
      onChange: (_, newValue) => {
        thiz.document.fateSystem.maFP = newValue;
      },
      min: 0,
    });
    this.vmNsAfp = new InputNumberSpinnerViewModel({
      parent: thiz,
      id: "vmNsAfp",
      value: thiz.document.fateSystem.AFP,
      onChange: (_, newValue) => {
        thiz.document.fateSystem.AFP = newValue;
      },
      min: 0,
    });

    this.fateCardAddButtonViewModels = [];
    for (let i = 0; i < this.remainingSlots; i++) {
      const addViewModel = new ButtonAddViewModel({
        parent: thiz,
        id: `addViewModel-${i}`,
        target: thiz.document,
        creationType: ITEM_TYPES.FATE_CARD,
        withDialog: true,
        localizedToolTip: StringUtil.format(
          game.i18n.localize("system.general.add.addType"),
          game.i18n.localize("system.character.driverSystem.fateSystem.fateCard.label"),
        ),
        localizedType: game.i18n.localize("system.character.driverSystem.fateSystem.fateCard.label"),
        selectionLabelMapper: async (selected) => {
          let AFP = "?";
          let MaFP = "?";
          let MiFP = "?";
  
          if (selected.value !== "custom") {
            const document = await new DocumentFetcher().find({
              id: selected.value,
              documentType: "Item",
              contentType: ITEM_TYPES.FATE_CARD,
              includeLocked: true,
              searchEmbedded: false,
            });
  
            if (ValidationUtil.isDefined(document)) {
              const transientFateCard = document.getTransientObject();
              AFP = transientFateCard.cost.AFP;
              MaFP = transientFateCard.cost.maFP;
              MiFP = transientFateCard.cost.miFP;
            }
          }
          
          return `Cost: ${AFP} AFP, ${MaFP} MaFP, ${MiFP} MiFP`;
        }
      });
      this.fateCardAddButtonViewModels.push(addViewModel);
    }

    this.fateCards = this._getFateCardViewModels();
  }

  /**
   * Updates the data of this view model. 
   * 
   * @param {Boolean | undefined} args.isEditable If true, the view model data is editable.
   * * Default `false`. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat.
   * * Default `false`. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document.
   * * Default `false`. 
   * 
   * @override
   */
  update(args = {}) {
    const newFateCards = this._getFateCardViewModels();
    this._cullObsolete(this.fateCards, newFateCards);
    this.fateCards = newFateCards;

    super.update(args);
  }

  /**
   * @returns {Array<FateCardViewModel>}
   * 
   * @private
   */
  _getFateCardViewModels() {
    return this._getViewModels(
      this.document.fateSystem.fateCards, 
      this.fateCards,
      (args) => { return new FateCardViewModel(args); }
    );
  }
  
  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(ActorFateViewModel));
  }

}
