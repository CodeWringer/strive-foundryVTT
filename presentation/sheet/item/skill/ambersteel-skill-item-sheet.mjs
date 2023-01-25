import { TEMPLATES } from "../../../templatePreloader.mjs";
import AmbersteelBaseItemSheet from "../ambersteel-base-item-sheet.mjs";
import { ITEM_SHEET_SUBTYPE } from "../item-sheet-subtype.mjs";
import SkillItemSheetViewModel from "./skill-item-sheet-viewmodel.mjs";

export default class AmbersteelSkillItemSheet extends AmbersteelBaseItemSheet {
  /** @override */
  get template() { return TEMPLATES.SKILL_ITEM_SHEET; }

  /** @override */
  get title() { return game.i18n.localize("ambersteel.character.skill.singular"); }

  /** @override */
  _getViewModel(context, document) {
    return new SkillItemSheetViewModel({
      id: document.id,
      document: document.getTransientObject(),
      isEditable: context.isEditable,
      isSendable: context.isSendable,
      isOwner: context.isOwner,
    });
  }
}

ITEM_SHEET_SUBTYPE.set("skill", new AmbersteelSkillItemSheet());
