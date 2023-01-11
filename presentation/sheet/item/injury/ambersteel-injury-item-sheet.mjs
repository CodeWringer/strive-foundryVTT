import { TEMPLATES } from "../../../templatePreloader.mjs";
import AmbersteelBaseItemSheet from "../ambersteel-base-item-sheet.mjs";
import { ITEM_SHEET_SUBTYPE } from "../item-sheet-subtype.mjs";
import InjuryItemSheetViewModel from "./injury-item-sheet-viewmodel.mjs";

export default class AmbersteelInjuryItemSheet extends AmbersteelBaseItemSheet {
  /** @override */
  get template() { return TEMPLATES.INJURY_ITEM_SHEET; }

  /** @override */
  get title() { return game.i18n.localize("ambersteel.character.health.injury.singular"); }

  /** @override */
  getViewModel(context, document) {
    let viewModel = game.ambersteel.viewModels.get(document.id);
    if (viewModel === undefined) {
      viewModel = new InjuryItemSheetViewModel({
        id: document.id,
        document: document.getTransientObject(),
        isEditable: context.isEditable,
        isSendable: context.isSendable,
        isOwner: context.isOwner,
      });
      game.ambersteel.viewModels.set(document.id, viewModel);
    } else {
      viewModel.update({
        isEditable: context.isEditable,
        isSendable: context.isSendable,
        isOwner: context.isOwner,
      });
    }
    return viewModel;
  }
}

ITEM_SHEET_SUBTYPE.set("injury", new AmbersteelInjuryItemSheet());
