import GameSystemBaseItemSheet from "../game-system-base-item-sheet.mjs";
import SkillItemSheetViewModel from "./skill-item-sheet-viewmodel.mjs";

export default class SkillItemSheet extends GameSystemBaseItemSheet {
  /** @override */
  get template() { return SkillItemSheetViewModel.TEMPLATE; }

  /** @override */
  get localizedType() { return game.i18n.localize("system.character.skill.singular"); }

  /** @override */
  getTitle(item) { return item.getTransientObject().nameForDisplay; }

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
