import AmbersteelBaseItemSheet from "./ambersteel-base-item-sheet.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import MutationItemSheetViewModel from "../../../templates/item/mutation/mutation-item-sheet-viewmodel.mjs";
import { ITEM_SHEET_SUBTYPE } from "./item-sheet-subtype.mjs";

export default class AmbersteelMutationItemSheet extends AmbersteelBaseItemSheet {
  /** @override */
  get template() { return TEMPLATES.MUTATION_ITEM_SHEET; }

  /** @override */
  get title() { return game.i18n.localize("ambersteel.character.health.mutation.singular"); }

  getViewModel(context, item) {
    return new MutationItemSheetViewModel({
      id: item.id,
      isEditable: context.isEditable,
      isSendable: context.isSendable,
      isOwner: context.isOwner,
      isGM: context.isGM,
      item: item,
    });
  }
}

ITEM_SHEET_SUBTYPE.set("mutation", new AmbersteelMutationItemSheet());
