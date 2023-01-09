import { TEMPLATES } from "../../../templatePreloader.mjs";
import AmbersteelBaseItemSheet from "../ambersteel-base-item-sheet.mjs";
import { ITEM_SHEET_SUBTYPE } from "../item-sheet-subtype.mjs";
import IllnessItemSheetViewModel from "./illness-item-sheet-viewmodel.mjs";

export default class AmbersteelIllnessItemSheet extends AmbersteelBaseItemSheet {
  /** @override */
  get template() { return TEMPLATES.ILLNESS_ITEM_SHEET; }

  /** @override */
  get title() { return game.i18n.localize("ambersteel.character.health.illness.singular"); }

  /** @override */
  getViewModel(context, document) {
    let viewModel = game.ambersteel.viewModels.get(document.id);
    if (viewModel === undefined) {
      viewModel = new IllnessItemSheetViewModel({
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

ITEM_SHEET_SUBTYPE.set("illness", new AmbersteelIllnessItemSheet());
