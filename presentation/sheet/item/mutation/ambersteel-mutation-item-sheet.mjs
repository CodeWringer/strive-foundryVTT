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
  _getViewModel(context, document) {
    return new MutationItemSheetViewModel({
      id: document.id,
      document: document.getTransientObject(),
      isEditable: context.isEditable,
      isSendable: context.isSendable,
      isOwner: context.isOwner,
    });
  }
}

ITEM_SHEET_SUBTYPE.set("mutation", new AmbersteelMutationItemSheet());
