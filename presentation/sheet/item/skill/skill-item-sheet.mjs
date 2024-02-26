import GameSystemBaseItemSheet from "../game-system-base-item-sheet.mjs";
import { ITEM_SHEET_SUBTYPE } from "../item-sheet-subtype.mjs";
import SkillItemSheetViewModel from "./skill-item-sheet-viewmodel.mjs";

export default class SkillItemSheet extends GameSystemBaseItemSheet {
  /** @override */
  get template() { return SkillItemSheetViewModel.TEMPLATE; }

  /** @override */
  get title() { return game.i18n.localize("system.character.skill.singular"); }

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
