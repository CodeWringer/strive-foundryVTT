import AmbersteelBaseItemSheet from "../ambersteel-base-item-sheet.mjs";
import { ITEM_SHEET_SUBTYPE } from "../item-sheet-subtype.mjs";
import SkillItemSheetViewModel from "./skill-item-sheet-viewmodel.mjs";

export default class SkillItemSheet extends AmbersteelBaseItemSheet {
  /** @override */
  get template() { return SkillItemSheetViewModel.TEMPLATE; }

  /** @override */
  get title() { return game.i18n.localize("ambersteel.character.skill.singular"); }

  /** @override */
  _getViewModel(context, document, sheet) {
    return new SkillItemSheetViewModel({
      id: document.id,
      document: document.getTransientObject(),
      isEditable: context.isEditable,
      isSendable: context.isSendable,
      isOwner: context.isOwner,
      sheet: sheet,
    });
  }
}

ITEM_SHEET_SUBTYPE.set("skill", new SkillItemSheet());
