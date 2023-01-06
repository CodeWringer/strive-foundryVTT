import { TEMPLATES } from "../../../templatePreloader.mjs";
import AmbersteelBaseItemSheet from "../ambersteel-base-item-sheet.mjs";
import { ITEM_SHEET_SUBTYPE } from "../item-sheet-subtype.mjs";
import MutationItemSheetViewModel from "./mutation-item-sheet-viewmodel.mjs";

export default class AmbersteelMutationItemSheet extends AmbersteelBaseItemSheet {
  /** @override */
  get template() { return TEMPLATES.MUTATION_ITEM_SHEET; }

  /** @override */
  get title() { return game.i18n.localize("ambersteel.character.health.mutation.singular"); }

  /** @override */
  getViewModel(context, document) {
    return new MutationItemSheetViewModel({
      id: document.id,
      isEditable: context.isEditable,
      isSendable: context.isSendable,
      isOwner: context.isOwner,
      isGM: context.isGM,
      document: document.getTransientObject(),
    });
  }
}

ITEM_SHEET_SUBTYPE.set("mutation", new AmbersteelMutationItemSheet());
